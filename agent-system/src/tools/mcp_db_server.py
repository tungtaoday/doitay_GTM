"""MCP Server for database tools — exposes db_tools functions as MCP tools.

Usage: Register with Claude Agent SDK as an MCP tool server.
"""
from __future__ import annotations

from claude_agent_sdk import create_sdk_mcp_server, tool

from src.tools import db_tools


@tool(description="Save agent output to database")
async def save_agent_output(
    experiment_id: str,
    agent_name: str,
    phase: str,
    output_data: dict,
    skill_code: str = "",
    input_data: dict | None = None,
    raw_text: str = "",
    session_id: str = "",
    cost_usd: float = 0.0,
    duration_ms: int = 0,
) -> dict:
    return await db_tools.save_agent_output(
        experiment_id=experiment_id,
        agent_name=agent_name,
        phase=phase,
        output_data=output_data,
        skill_code=skill_code or None,
        input_data=input_data,
        raw_text=raw_text or None,
        session_id=session_id or None,
        cost_usd=cost_usd or None,
        duration_ms=duration_ms or None,
    )


@tool(description="Read agent outputs from database")
async def read_agent_output(
    experiment_id: str,
    agent_name: str = "",
    skill_code: str = "",
    limit: int = 5,
) -> list[dict]:
    return await db_tools.read_agent_output(
        experiment_id=experiment_id,
        agent_name=agent_name or None,
        skill_code=skill_code or None,
        limit=limit,
    )


@tool(description="Save content item to queue")
async def save_content(
    experiment_id: str,
    platform: str,
    content_type: str,
    body: str,
    hook: str = "",
    cta: str = "",
    pillar: str = "",
    media_urls: list[str] | None = None,
    status: str = "draft",
) -> dict:
    return await db_tools.save_content(
        experiment_id=experiment_id,
        platform=platform,
        content_type=content_type,
        body=body,
        hook=hook or None,
        cta=cta or None,
        pillar=pillar or None,
        media_urls=media_urls,
        status=status,
    )


@tool(description="Read content queue")
async def read_content_queue(
    experiment_id: str,
    status: str = "",
    platform: str = "",
    limit: int = 20,
) -> list[dict]:
    return await db_tools.read_content_queue(
        experiment_id=experiment_id,
        status=status or None,
        platform=platform or None,
        limit=limit,
    )


@tool(description="Update content status and metrics")
async def update_content_status(
    content_id: str,
    status: str,
    post_url: str = "",
    impressions: int = 0,
    engagements: int = 0,
    clicks: int = 0,
    replies: int = 0,
    reposts: int = 0,
    bookmarks: int = 0,
    saves: int = 0,
    shares: int = 0,
    reactions: int = 0,
) -> dict:
    return await db_tools.update_content_status(
        content_id=content_id,
        status=status,
        post_url=post_url or None,
        impressions=impressions or None,
        engagements=engagements or None,
        clicks=clicks or None,
        replies=replies or None,
        reposts=reposts or None,
        bookmarks=bookmarks or None,
        saves=saves or None,
        shares=shares or None,
        reactions=reactions or None,
    )


@tool(description="Save weekly metrics")
async def save_weekly_metric(
    experiment_id: str,
    week_number: int,
    cmf_score: float = 0.0,
    traction_score: float = 0.0,
    engagement_quality: float = 0.0,
    audience_relevance: float = 0.0,
    conversion_signal: float = 0.0,
    raw_metrics: dict | None = None,
    notes: str = "",
) -> dict:
    return await db_tools.save_weekly_metric(
        experiment_id=experiment_id,
        week_number=week_number,
        cmf_score=cmf_score or None,
        traction_score=traction_score or None,
        engagement_quality=engagement_quality or None,
        audience_relevance=audience_relevance or None,
        conversion_signal=conversion_signal or None,
        raw_metrics=raw_metrics,
        notes=notes or None,
    )


@tool(description="Save pattern to Pattern Library")
async def save_pattern(
    category: str,
    business_type: str,
    result: str,
    title: str,
    description: str,
    experiment_id: str = "",
    evidence: list | None = None,
    applies_to: list | None = None,
    confidence: float = 0.0,
) -> dict:
    return await db_tools.save_pattern(
        category=category,
        business_type=business_type,
        result=result,
        title=title,
        description=description,
        experiment_id=experiment_id or None,
        evidence=evidence,
        applies_to=applies_to,
        confidence=confidence or None,
    )


@tool(description="Read audience intelligence data")
async def read_audience_intel(
    experiment_id: str,
    unused_only: bool = True,
    limit: int = 20,
) -> list[dict]:
    return await db_tools.read_audience_intel(
        experiment_id=experiment_id,
        unused_only=unused_only,
        limit=limit,
    )


@tool(description="Save audience intelligence data")
async def save_audience_intel(
    experiment_id: str,
    pain_phrase: str,
    source_platform: str,
    source_url: str = "",
    frequency: int = 1,
    sentiment: str = "",
    segment: str = "",
) -> dict:
    return await db_tools.save_audience_intel(
        experiment_id=experiment_id,
        pain_phrase=pain_phrase,
        source_platform=source_platform,
        source_url=source_url or None,
        frequency=frequency,
        sentiment=sentiment or None,
        segment=segment or None,
    )


@tool(description="Read hypothesis backlog")
async def read_hypotheses(
    tier: int = 0,
    is_active: bool = True,
    limit: int = 20,
) -> list[dict]:
    return await db_tools.read_hypotheses(
        tier=tier or None,
        is_active=is_active,
        limit=limit,
    )


@tool(description="Save a new hypothesis")
async def save_hypothesis(
    title: str,
    description: str = "",
    business_type: str = "",
    tier: int = 1,
    signal_type: str = "",
    signal_score: int = 0,
    source_agent: str = "",
) -> dict:
    return await db_tools.save_hypothesis(
        title=title,
        description=description or None,
        business_type=business_type or None,
        tier=tier,
        signal_type=signal_type or None,
        signal_score=signal_score or None,
        source_agent=source_agent or None,
    )


@tool(description="Update hypothesis (promote tier, deactivate, etc.)")
async def update_hypothesis(
    hypothesis_id: str,
    tier: int = 0,
    is_active: bool = True,
    stress_test: dict | None = None,
    promoted_to_experiment_id: str = "",
) -> dict:
    return await db_tools.update_hypothesis(
        hypothesis_id=hypothesis_id,
        tier=tier or None,
        is_active=is_active,
        stress_test=stress_test,
        promoted_to_experiment_id=promoted_to_experiment_id or None,
    )


@tool(description="Read experiment details")
async def read_experiment(experiment_id: str = "") -> dict | None:
    return await db_tools.read_experiment(experiment_id=experiment_id or None)


@tool(description="Update experiment state")
async def update_experiment(
    experiment_id: str,
    phase: str = "",
    week_number: int = 0,
    cmf_score: float = 0.0,
    traction_score: float = 0.0,
    is_active: bool = True,
) -> dict:
    return await db_tools.update_experiment(
        experiment_id=experiment_id,
        phase=phase or None,
        week_number=week_number or None,
        cmf_score=cmf_score or None,
        traction_score=traction_score or None,
        is_active=is_active,
    )


@tool(description="Create a new experiment")
async def create_experiment(
    name: str,
    business_type: str,
    vertical: str,
    geography: str,
) -> dict:
    return await db_tools.create_experiment(
        name=name,
        business_type=business_type,
        vertical=vertical,
        geography=geography,
    )


# Create the MCP server
server = create_sdk_mcp_server(
    name="db-tools",
    tools=[
        save_agent_output, read_agent_output,
        save_content, read_content_queue, update_content_status,
        save_weekly_metric, save_pattern,
        read_audience_intel, save_audience_intel,
        read_hypotheses, save_hypothesis, update_hypothesis,
        read_experiment, update_experiment, create_experiment,
    ],
)
