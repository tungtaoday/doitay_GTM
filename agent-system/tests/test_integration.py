"""Integration tests — real API calls.

These tests hit real APIs (Claude, SerpAPI, Firecrawl, Facebook).
Only run when API keys are configured.
Run with: pytest tests/test_integration.py -v -s
"""
import os
import pytest
from dotenv import load_dotenv

load_dotenv()

# Skip all tests if no API key
pytestmark = pytest.mark.skipif(
    not os.getenv("ANTHROPIC_API_KEY"),
    reason="ANTHROPIC_API_KEY not set",
)


async def test_serpapi_search():
    """Test SerpAPI web search."""
    from src.tools.search_tools import web_search

    result = await web_search("doitay.vn marketplace", num_results=3)
    assert "error" not in result, f"SerpAPI error: {result}"
    assert result["total"] > 0
    print(f"SerpAPI: {result['total']} results for 'doitay.vn marketplace'")
    for r in result["results"][:3]:
        title = r['title'].encode('ascii', 'replace').decode()
        print(f"  - {title}: {r['link']}")


async def test_firecrawl_scrape():
    """Test Firecrawl web scrape."""
    from src.tools.search_tools import web_scrape

    if not os.getenv("FIRECRAWL_API_KEY"):
        pytest.skip("FIRECRAWL_API_KEY not set")

    result = await web_scrape("https://doitay.vn")
    assert "error" not in result, f"Firecrawl error: {result}"
    assert result.get("success") is True
    print(f"Firecrawl: scraped {len(result.get('markdown', ''))} chars from doitay.vn")


async def test_facebook_page_info():
    """Test Facebook Page API."""
    import httpx
    from src.config import FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID

    if not FACEBOOK_PAGE_ACCESS_TOKEN:
        pytest.skip("FACEBOOK_PAGE_ACCESS_TOKEN not set")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://graph.facebook.com/v18.0/{FACEBOOK_PAGE_ID}",
            params={
                "fields": "name,fan_count,followers_count",
                "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        print(f"Facebook Page: {data.get('name')} — {data.get('followers_count', 'N/A')} followers")


async def test_db_tools_crud():
    """Test DB tools end-to-end."""
    from src.db.session import init_db
    from src.tools.db_tools import (
        create_experiment,
        read_experiment,
        update_experiment,
        save_hypothesis,
        read_hypotheses,
        save_audience_intel,
        read_audience_intel,
        save_content,
        read_content_queue,
        save_weekly_metric,
        save_pattern,
    )

    await init_db()

    # Create experiment
    exp = await create_experiment(
        name="Integration Test",
        business_type="marketplace",
        vertical="handmade",
        geography="Ho Chi Minh",
    )
    assert exp["status"] == "created"
    exp_id = exp["id"]
    print(f"Created experiment: {exp_id}")

    # Read experiment
    exp_data = await read_experiment(exp_id)
    assert exp_data["name"] == "Integration Test"

    # Update experiment
    await update_experiment(exp_id, phase="build_test", week_number=1)
    exp_data = await read_experiment(exp_id)
    assert exp_data["phase"] == "build_test"

    # Save hypothesis
    h = await save_hypothesis(
        title="Handmade marketplace in HCMC",
        description="Fragmented supply, no dominant platform",
        tier=1,
        signal_type="fragmentation",
        signal_score=250,
    )
    assert h["status"] == "saved"

    # Read hypotheses
    hypotheses = await read_hypotheses(tier=1)
    assert len(hypotheses) > 0

    # Save audience intel
    ai = await save_audience_intel(
        experiment_id=exp_id,
        pain_phrase="khó tìm thợ handmade uy tín",
        source_platform="facebook",
        frequency=5,
        sentiment="negative",
    )
    assert ai["status"] == "saved"

    # Read audience intel
    intel = await read_audience_intel(exp_id)
    assert len(intel) > 0

    # Save content
    c = await save_content(
        experiment_id=exp_id,
        platform="facebook",
        content_type="post",
        body="Test content for integration",
        hook="Bạn có biết?",
    )
    assert c["status"] == "saved"

    # Read content queue
    content = await read_content_queue(exp_id)
    assert len(content) > 0

    # Save weekly metric
    m = await save_weekly_metric(
        experiment_id=exp_id,
        week_number=1,
        cmf_score=0.35,
        traction_score=0.2,
    )
    assert m["status"] == "saved"

    # Save pattern
    p = await save_pattern(
        category="content",
        business_type="marketplace",
        result="win",
        title="Question hooks get 3x engagement",
        description="Posts starting with questions get 3x more replies than statements",
        confidence=0.8,
    )
    assert p["status"] == "saved"

    # Deactivate test experiment
    await update_experiment(exp_id, is_active=False)
    print("DB tools CRUD: all operations passed")


async def test_claude_agent_basic():
    """Test basic Claude API call via Agent SDK."""
    from claude_agent_sdk import ClaudeAgentOptions, AssistantMessage, ResultMessage, query

    raw_text = ""
    cost = 0.0
    async for message in query(
        prompt="Reply with exactly: AGENT_SYSTEM_OK",
        options=ClaudeAgentOptions(
            model="claude-haiku-4-5-20251001",
            max_turns=1,
            permission_mode="bypassPermissions",
        ),
    ):
        if isinstance(message, AssistantMessage) and hasattr(message, "content"):
            for block in message.content:
                if hasattr(block, "text"):
                    raw_text += block.text
        if isinstance(message, ResultMessage):
            cost = getattr(message, "total_cost_usd", 0) or 0
            if hasattr(message, "result"):
                raw_text = message.result or raw_text

    assert "AGENT_SYSTEM_OK" in raw_text, f"Got: {raw_text[:200]}"
    print(f"Claude API OK: '{raw_text.strip()}' (cost: ${cost:.4f})")


async def test_agent_runner_research():
    """Test running research agent with real Claude API."""
    from src.db.session import init_db
    from src.tools.db_tools import create_experiment, update_experiment
    from src.agents.runner import run_agent

    await init_db()

    # Create test experiment
    exp = await create_experiment(
        name="Runner Test",
        business_type="marketplace",
        vertical="handmade crafts",
        geography="Ho Chi Minh City",
    )
    exp_id = exp["id"]

    # Run research agent
    result = await run_agent(
        agent_name="research",
        task="Scan market signals cho vertical handmade crafts tại Ho Chi Minh City. "
             "Identify 2-3 market signals (fragmentation, trust gap, information asymmetry). "
             "Return JSON with signals, audience_intel, and segments.",
        experiment_id=exp_id,
        phase="discover",
        input_data={
            "vertical": "handmade crafts",
            "geography": "Ho Chi Minh City",
            "business_type": "marketplace",
        },
        skill_code="R1_market_scanning",
        inject_patterns=False,  # No patterns yet
    )

    print(f"Agent runner result: status={result['status']}, duration={result['duration_ms']}ms")
    if result.get("output"):
        print(f"Output keys: {list(result['output'].keys())}")
    else:
        print(f"Raw text preview: {result.get('raw_text', '')[:300]}")

    assert result["status"] in ("success", "no_json_output")

    # Cleanup
    await update_experiment(exp_id, is_active=False)
