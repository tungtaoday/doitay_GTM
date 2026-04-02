"""Run Phase 5 (Extract Patterns) for existing experiment."""
import asyncio
import io
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from dotenv import load_dotenv
load_dotenv()

EID = "r87exhmdbe3wnd9u7w6p4u6n"

INPUT_BASE = {
    "vertical": "handmade crafts",
    "geography": "Ho Chi Minh City",
    "business_type": "marketplace",
    "marketplace_name": "Doitay.vn - Handmade Crafts",
}


async def main():
    from src.db.session import init_db, SessionLocal
    from src.db.models import AgentOutput
    from src.tools.db_tools import update_experiment
    from src.agents.runner import run_agent
    from sqlalchemy import select

    await init_db()
    total_start = time.monotonic()

    # Load ALL previous phase outputs from DB
    print("Loading all phase outputs from DB...")
    phase_data = {}
    async with SessionLocal() as session:
        rows = (await session.execute(
            select(AgentOutput).where(AgentOutput.experiment_id == EID)
            .order_by(AgentOutput.created_at)
        )).scalars().all()
        for r in rows:
            data = json.loads(r.output_data) if isinstance(r.output_data, str) else r.output_data
            phase_data[r.phase] = data

    for phase_name, data in phase_data.items():
        print(f"  {phase_name}: {list(data.keys())[:5]}")
    print()

    # Build comprehensive context for pattern extraction
    discover = phase_data.get("discover", {})
    define = phase_data.get("define", {})
    build_test = phase_data.get("build_test", {})
    decide = phase_data.get("decide", {})

    # Summarize each phase
    context_summary = {
        "discover": {
            "signals": [s.get("title", "") for s in discover.get("signals", [])],
            "wedge_segment": discover.get("recommended_wedge", {}).get("segment", ""),
            "pain_phrases": (discover.get("audience_intel", {}).get("pain_phrases", []))[:5],
        },
        "define": {
            "thesis": (define.get("thesis", {}).get("statement", "") if isinstance(define.get("thesis"), dict) else str(define.get("thesis", "")))[:300],
            "moat": str(define.get("cvp", {}).get("moat_type", ""))[:200],
            "kill_criteria": define.get("thesis", {}).get("constraints", {}).get("kill_criteria", []) if isinstance(define.get("thesis"), dict) else [],
        },
        "build_test": {
            "posts_created": len(build_test.get("posts", [])),
            "platforms": list(set(p.get("platform", "") for p in build_test.get("posts", []))),
        },
        "decide": {
            "verdict": decide.get("verdict", ""),
            "critical_weaknesses": [
                (w.get("flaw", str(w)) if isinstance(w, dict) else str(w))[:100]
                for w in decide.get("critical_weaknesses", [])[:3]
            ],
            "unvalidated_assumptions": decide.get("unvalidated_assumptions", [])[:3],
        },
    }

    # === PHASE 5: EXTRACT ===
    print("=" * 60)
    print("  PHASE 5: EXTRACT - Pattern Learning")
    print("=" * 60)
    await update_experiment(EID, phase="extract")

    r5 = await run_agent(
        agent_name="analytics",
        task=(
            "Extract patterns from the complete experiment for Doitay.vn - Handmade Crafts marketplace "
            "in Ho Chi Minh City. This experiment went through all phases: "
            "DISCOVER (3 signals found), DEFINE (thesis + CVP created), "
            "BUILD_TEST (3 Facebook posts created), DECIDE (stress test: REQUIRE_MORE_EVIDENCE, 7/7 fail). "
            "Analyze what worked, what didn't, what to learn for future marketplace experiments. "
            "Return ONLY pure JSON. "
            "Required keys: "
            "patterns (array of {category, title, description, result: win|fail|pivot, confidence: 0-1, evidence}), "
            "cold_start_learnings (string), "
            "content_learnings (string), "
            "trust_model_learnings (string), "
            "cross_marketplace_overlaps (array of strings), "
            "recommended_next_experiment (object with hypothesis, vertical, geography, reason)."
        ),
        experiment_id=EID,
        phase="extract",
        input_data={**INPUT_BASE, "all_phases": context_summary},
        skill_code="A7_pattern_extraction",
        inject_patterns=False,
    )

    s5 = r5.get("status")
    d5 = r5.get("duration_ms", 0)
    icon5 = "[OK]" if s5 == "success" else "[!!]"
    print(f"  {icon5} Status: {s5} | Duration: {d5}ms")

    if r5.get("output"):
        o = r5["output"]
        print(f"  Keys: {list(o.keys())}")
        print()

        # Patterns
        patterns = o.get("patterns", [])
        print(f"  PATTERNS EXTRACTED ({len(patterns)}):")
        for i, p in enumerate(patterns):
            result = p.get("result", "?")
            confidence = p.get("confidence", "?")
            icon = "W" if result == "win" else "F" if result == "fail" else "P"
            print(f"    [{icon}] {p.get('category','?')}: {p.get('title','?')}")
            print(f"        {p.get('description','')[:120]}")
            print(f"        Result: {result} | Confidence: {confidence}")
            print()

        # Cold start learnings
        cs = o.get("cold_start_learnings", "")
        if cs:
            print(f"  COLD START LEARNINGS:")
            print(f"    {cs[:300]}")
            print()

        # Content learnings
        cl = o.get("content_learnings", "")
        if cl:
            print(f"  CONTENT LEARNINGS:")
            print(f"    {cl[:300]}")
            print()

        # Trust model
        tm = o.get("trust_model_learnings", "")
        if tm:
            print(f"  TRUST MODEL LEARNINGS:")
            print(f"    {tm[:300]}")
            print()

        # Cross-marketplace overlaps
        overlaps = o.get("cross_marketplace_overlaps", [])
        if overlaps:
            print(f"  CROSS-MARKETPLACE OVERLAPS ({len(overlaps)}):")
            for ov in overlaps[:5]:
                print(f"    - {str(ov)[:150]}")
            print()

        # Recommended next experiment
        nxt = o.get("recommended_next_experiment", {})
        if nxt:
            print(f"  RECOMMENDED NEXT EXPERIMENT:")
            print(f"    Hypothesis: {nxt.get('hypothesis','?')[:200]}")
            print(f"    Vertical: {nxt.get('vertical','?')}")
            print(f"    Geography: {nxt.get('geography','?')}")
            print(f"    Reason: {str(nxt.get('reason','?'))[:200]}")
    else:
        print(f"  Raw: {r5.get('raw_text','')[:400]}")

    # Deactivate experiment
    await update_experiment(EID, is_active=False)

    total_ms = int((time.monotonic() - total_start) * 1000)
    print()
    print("=" * 60)
    print(f"  Phase 5: {icon5} {s5} ({d5}ms)")
    print(f"  Total: {total_ms}ms ({total_ms/1000:.0f}s)")
    print()
    print("  FULL PIPELINE COMPLETE")
    print("  Phase 1: DISCOVER   [OK]")
    print("  Phase 2: DEFINE     [OK]")
    print("  Phase 3: BUILD_TEST [OK]")
    print("  Phase 4: DECIDE     [OK]")
    print(f"  Phase 5: EXTRACT    {icon5}")
    print(f"  Experiment: {EID} (deactivated)")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
