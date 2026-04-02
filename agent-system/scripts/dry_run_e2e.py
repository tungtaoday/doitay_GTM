"""Dry Run E2E — Full pipeline for 1 marketplace.

Pipeline: DISCOVER → DEFINE → BUILD_TEST → DECIDE → EXTRACT
Marketplace: Doitay.vn (handmade crafts, Ho Chi Minh City)

Run: python scripts/dry_run_e2e.py
"""
from __future__ import annotations

import asyncio
import json
import logging
import sys
import time
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

# Fix Windows cp1252 console encoding
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("dry_run")


# ─── Config ───
MARKETPLACE = {
    "name": "Doitay.vn — Handmade Crafts",
    "business_type": "marketplace",
    "vertical": "handmade crafts",
    "geography": "Ho Chi Minh City",
}


def banner(text: str):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def result_summary(result: dict):
    """Print concise result summary."""
    status = result.get("status", "unknown")
    duration = result.get("duration_ms", 0)
    agent = result.get("agent", "?")
    skill = result.get("skill_code", "?")

    icon = "✅" if status == "success" else "⚠️" if status == "no_json_output" else "❌"
    print(f"  {icon} Agent: {agent} | Skill: {skill} | Status: {status} | {duration}ms")

    output = result.get("output")
    if output:
        keys = list(output.keys())[:8]
        print(f"     Output keys: {keys}")
        # Print first-level summary
        for k in keys[:4]:
            v = output[k]
            if isinstance(v, list):
                print(f"     {k}: [{len(v)} items]")
            elif isinstance(v, str) and len(v) > 80:
                print(f"     {k}: {v[:80]}...")
            else:
                print(f"     {k}: {v}")
    elif result.get("raw_text"):
        text = result["raw_text"][:200].replace("\n", " ")
        print(f"     Raw: {text}")
    elif result.get("error"):
        print(f"     Error: {result['error']}")


async def main():
    from src.db.session import init_db
    from src.tools.db_tools import (
        create_experiment,
        update_experiment,
        read_experiment,
    )
    from src.agents.runner import run_agent

    await init_db()

    total_start = time.monotonic()
    total_cost = 0.0

    # ─── Create Experiment ───
    banner("SETUP: Create Test Experiment")
    exp = await create_experiment(**MARKETPLACE)
    exp_id = exp["id"]
    print(f"  Experiment ID: {exp_id}")
    print(f"  Marketplace: {MARKETPLACE['name']}")
    print(f"  Vertical: {MARKETPLACE['vertical']} @ {MARKETPLACE['geography']}")

    input_base = {
        "vertical": MARKETPLACE["vertical"],
        "geography": MARKETPLACE["geography"],
        "business_type": MARKETPLACE["business_type"],
        "marketplace_name": MARKETPLACE["name"],
    }

    results = {}  # Store all results for downstream agents

    try:
        # ═══════════════════════════════════════════
        # PHASE 1: DISCOVER
        # ═══════════════════════════════════════════
        banner("PHASE 1: DISCOVER — Market Signal Scanning")
        await update_experiment(exp_id, phase="discover")

        r1 = await run_agent(
            agent_name="research",
            task=(
                f"Scan market signals cho vertical '{MARKETPLACE['vertical']}' "
                f"tại {MARKETPLACE['geography']}. "
                "Identify 2-3 market signals (fragmentation, trust gap, information asymmetry). "
                "DO NOT use any external tools. Generate analysis from your knowledge. "
                "Return ONLY pure JSON (no markdown, no explanation). "
                "Required keys: signals (array of {title, signal_type, signal_score, evidence}), "
                "audience_intel ({pain_phrases: [], questions_asked: [], watering_holes: []}), "
                "segments (array of {name, job, underservice_score, switching_trigger})."
            ),
            experiment_id=exp_id,
            phase="discover",
            input_data=input_base,
            skill_code="R1_market_scanning",
            inject_patterns=False,
        )
        results["discover"] = r1
        result_summary(r1)

        # ═══════════════════════════════════════════
        # PHASE 2: DEFINE — Strategy Formation
        # ═══════════════════════════════════════════
        banner("PHASE 2: DEFINE — Thesis + Segmentation + CVP")
        await update_experiment(exp_id, phase="define")

        # Feed discover results to strategy agent
        discover_context = r1.get("output") or {"raw_summary": r1.get("raw_text", "")[:1000]}

        r2 = await run_agent(
            agent_name="strategy",
            task=(
                f"Dựa trên market signals đã scan, tạo thesis, segmentation, và CVP "
                f"cho marketplace '{MARKETPLACE['name']}'. "
                "Return ONLY pure JSON (no markdown, no explanation). "
                "Required keys: thesis (object with statement, playing_field, constraints), "
                "cvp (object with supply_side, demand_side, moat_type, "
                "chicken_egg_solution, wedge_cvp), "
                "experiment_design (object with hypothesis, success_metric, "
                "failure_metric, timeline_weeks)."
            ),
            experiment_id=exp_id,
            phase="define",
            input_data={**input_base, "discover_results": discover_context},
            skill_code="S1_thesis_formation",
            inject_patterns=False,
        )
        results["define"] = r2
        result_summary(r2)

        # ═══════════════════════════════════════════
        # PHASE 3: BUILD_TEST — Content Creation
        # ═══════════════════════════════════════════
        banner("PHASE 3: BUILD_TEST — Content Creation for Facebook")
        await update_experiment(exp_id, phase="build_test", week_number=1)

        define_context = r2.get("output") or {"raw_summary": r2.get("raw_text", "")[:1000]}

        r3 = await run_agent(
            agent_name="content",
            task=(
                f"Tạo 2 Facebook posts cho marketplace '{MARKETPLACE['name']}' — "
                f"vertical: {MARKETPLACE['vertical']} tại {MARKETPLACE['geography']}. "
                "Target audience: người yêu thích đồ handmade, muốn tìm thợ uy tín. "
                "Posts phải có hook mạnh, body hấp dẫn, CTA rõ ràng. "
                "Return JSON with key: posts (array of objects with "
                "platform, hook, body, cta, content_type, hashtags)."
            ),
            experiment_id=exp_id,
            phase="build_test",
            input_data={
                **input_base,
                "strategy": define_context,
                "platform": "facebook",
                "num_posts": 2,
                "week": 1,
            },
            skill_code="C1_hook_writing",
            inject_patterns=False,
        )
        results["content"] = r3
        result_summary(r3)

        # ═══════════════════════════════════════════
        # PHASE 4: DECIDE — Analytics + Devil's Advocate
        # ═══════════════════════════════════════════
        banner("PHASE 4: DECIDE — Stress Test (Devil's Advocate)")
        await update_experiment(exp_id, phase="decide")

        all_context = {
            "discover": results.get("discover", {}).get("output") or results.get("discover", {}).get("raw_text", "")[:500],
            "define": results.get("define", {}).get("output") or results.get("define", {}).get("raw_text", "")[:500],
            "content": results.get("content", {}).get("output") or results.get("content", {}).get("raw_text", "")[:500],
        }

        r4 = await run_agent(
            agent_name="devils_advocate",
            task=(
                f"Stress test marketplace '{MARKETPLACE['name']}' thesis and strategy. "
                "Apply 7 stress-test questions: Substitution, Copy, Cold Start, "
                "Chicken-Egg Inversion, Liquidity Cliff, Monetization Timing, 10x Test. "
                "Return JSON with keys: critical_weaknesses (array), "
                "unvalidated_assumptions (array), competitive_vulnerability (string), "
                "kill_criteria (array), verdict (PROCEED_WITH_CAUTION | "
                "REQUIRE_MORE_EVIDENCE | RECOMMEND_KILL)."
            ),
            experiment_id=exp_id,
            phase="decide",
            input_data={**input_base, "analysis": all_context},
            skill_code="A1_stress_testing",
            inject_patterns=False,
        )
        results["decide"] = r4
        result_summary(r4)

        # ═══════════════════════════════════════════
        # PHASE 5: EXTRACT — Pattern Extraction
        # ═══════════════════════════════════════════
        banner("PHASE 5: EXTRACT — Pattern Learning")
        await update_experiment(exp_id, phase="extract")

        r5 = await run_agent(
            agent_name="analytics",
            task=(
                f"Extract patterns from experiment '{MARKETPLACE['name']}'. "
                "Analyze what worked, what didn't. "
                "Return JSON with keys: patterns (array of objects with "
                "category, title, description, result (win/fail/pivot), "
                "confidence (0-1), evidence)."
            ),
            experiment_id=exp_id,
            phase="extract",
            input_data={**input_base, "all_phases": all_context},
            skill_code="A7_pattern_extraction",
            inject_patterns=False,
        )
        results["extract"] = r5
        result_summary(r5)

    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)

    finally:
        # ─── Summary ───
        total_ms = int((time.monotonic() - total_start) * 1000)

        banner("DRY RUN COMPLETE — Summary")
        print(f"  Total duration: {total_ms}ms ({total_ms/1000:.1f}s)")
        print(f"  Experiment ID: {exp_id}")
        print()

        for phase_name, r in results.items():
            status = r.get("status", "?")
            duration = r.get("duration_ms", 0)
            has_json = "YES" if r.get("output") else "NO"
            icon = "✅" if status == "success" else "⚠️" if status == "no_json_output" else "❌"
            print(f"  {icon} {phase_name:12s} | {r.get('agent','?'):18s} | {status:15s} | {duration:6d}ms | JSON: {has_json}")

        print()

        # Count successes
        successes = sum(1 for r in results.values() if r.get("status") == "success")
        total = len(results)
        print(f"  Result: {successes}/{total} phases returned structured JSON")

        if successes == total:
            print("  🎉 FULL PIPELINE SUCCESS — All phases produced structured output!")
        elif successes >= 3:
            print("  👍 MOSTLY WORKING — Most phases produced output. Prompts may need tuning.")
        else:
            print("  ⚠️  NEEDS WORK — Several phases didn't return structured JSON. Check agent prompts.")

        # Deactivate test experiment
        await update_experiment(exp_id, is_active=False)
        print(f"\n  Test experiment deactivated.")


if __name__ == "__main__":
    asyncio.run(main())
