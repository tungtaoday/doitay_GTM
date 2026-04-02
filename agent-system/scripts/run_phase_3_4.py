"""Run Phase 3 (Content) + Phase 4 (Stress Test) for existing experiment."""
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

    # Load previous phase outputs from DB
    print("Loading previous outputs from DB...")
    discover_data = {}
    define_data = {}
    async with SessionLocal() as session:
        rows = (await session.execute(
            select(AgentOutput).where(AgentOutput.experiment_id == EID)
            .order_by(AgentOutput.created_at)
        )).scalars().all()
        for r in rows:
            data = json.loads(r.output_data) if isinstance(r.output_data, str) else r.output_data
            if r.phase == "discover":
                discover_data = data
            elif r.phase == "define":
                define_data = data

    print(f"  Discover keys: {list(discover_data.keys())[:5]}")
    print(f"  Define keys: {list(define_data.keys())[:5]}")
    print()

    # Extract context
    thesis_stmt = ""
    wedge_cvp = ""
    pain_phrases = []
    if isinstance(define_data.get("thesis"), dict):
        thesis_stmt = define_data["thesis"].get("statement", "")[:300]
    if isinstance(define_data.get("cvp"), dict):
        wedge_cvp = str(define_data["cvp"].get("wedge_cvp", ""))[:200]
    if isinstance(discover_data.get("audience_intel"), dict):
        pain_phrases = discover_data["audience_intel"].get("pain_phrases", [])[:5]

    # === PHASE 3: BUILD_TEST ===
    print("=" * 60)
    print("  PHASE 3: BUILD_TEST - Content Creation for Facebook")
    print("=" * 60)
    await update_experiment(EID, phase="build_test", week_number=1)

    r3 = await run_agent(
        agent_name="content",
        task=(
            "Tao 3 Facebook posts cho marketplace Doitay.vn - handmade crafts tai Ho Chi Minh City. "
            f"Thesis: {thesis_stmt[:200]} "
            f"CVP: {wedge_cvp[:150]} "
            f"Pain phrases tu audience: {json.dumps(pain_phrases[:3], ensure_ascii=False)[:200]} "
            "Target: Artisan handmade va nguoi mua qua handmade tai TPHCM. "
            "Moi post phai co hook manh, body hap dan, CTA ro rang, hashtags. "
            "Viet bang tieng Viet tu nhien, khong formal qua. "
            "Return ONLY pure JSON. "
            "Required key: posts (array of {platform, hook, body, cta, content_type, hashtags, target_audience})."
        ),
        experiment_id=EID,
        phase="build_test",
        input_data={
            **INPUT_BASE,
            "strategy_context": {
                "thesis": thesis_stmt[:200],
                "cvp": wedge_cvp[:150],
                "pain_phrases": pain_phrases[:5],
            },
            "platform": "facebook",
            "num_posts": 3,
            "week": 1,
        },
        skill_code="C1_hook_writing",
        inject_patterns=False,
    )

    s3 = r3.get("status")
    d3 = r3.get("duration_ms", 0)
    icon3 = "[OK]" if s3 == "success" else "[!!]"
    print(f"  {icon3} Status: {s3} | Duration: {d3}ms")
    if r3.get("output"):
        o = r3["output"]
        posts = o.get("posts", [])
        print(f"  {len(posts)} posts created:")
        for i, p in enumerate(posts):
            print(f"\n    --- Post {i+1} [{p.get('content_type','?')}] ---")
            print(f"    Hook: {p.get('hook','?')}")
            body = p.get("body", "")
            # Show full body
            for line in body.split("\n")[:8]:
                print(f"    {line}")
            if len(body.split("\n")) > 8:
                print(f"    ...")
            print(f"    CTA: {p.get('cta','?')}")
            print(f"    Tags: {p.get('hashtags',[])[:6]}")
    else:
        print(f"  Raw: {r3.get('raw_text','')[:400]}")

    print()

    # === PHASE 4: DECIDE ===
    print("=" * 60)
    print("  PHASE 4: DECIDE - Stress Test (Devils Advocate)")
    print("=" * 60)
    await update_experiment(EID, phase="decide")

    all_context = {
        "discover_signals": [s.get("title", "") for s in discover_data.get("signals", [])[:3]],
        "thesis": thesis_stmt[:300],
        "cvp": wedge_cvp[:200],
        "content_created": len(r3.get("output", {}).get("posts", [])),
        "wedge_segment": discover_data.get("recommended_wedge", {}).get("segment", ""),
    }

    r4 = await run_agent(
        agent_name="devils_advocate",
        task=(
            "Stress test marketplace Doitay.vn - Handmade Crafts tai Ho Chi Minh City. "
            "Apply 7 stress-test questions: Substitution, Copy, Cold Start, "
            "Chicken-Egg Inversion, Liquidity Cliff, Monetization Timing, 10x Test. "
            "Return ONLY pure JSON (no markdown, no explanation). "
            "Required keys: stress_tests (object with 7 test results each having pass:bool), "
            "critical_weaknesses (array of strings), "
            "unvalidated_assumptions (array of strings), "
            "competitive_vulnerability (string), "
            "kill_criteria (array of strings), "
            "verdict (string: PROCEED_WITH_CAUTION or REQUIRE_MORE_EVIDENCE or RECOMMEND_KILL)."
        ),
        experiment_id=EID,
        phase="decide",
        input_data={**INPUT_BASE, "analysis": all_context},
        skill_code="A1_stress_testing",
        inject_patterns=False,
    )

    s4 = r4.get("status")
    d4 = r4.get("duration_ms", 0)
    icon4 = "[OK]" if s4 == "success" else "[!!]"
    print(f"  {icon4} Status: {s4} | Duration: {d4}ms")

    if r4.get("output"):
        o = r4["output"]

        verdict = o.get("verdict", "?")
        print(f"\n  === VERDICT: {verdict} ===\n")

        # Critical weaknesses
        cw = o.get("critical_weaknesses", [])
        if cw:
            print(f"  CRITICAL WEAKNESSES ({len(cw)}):")
            for i, w in enumerate(cw[:5]):
                text = w.get("title", str(w)) if isinstance(w, dict) else str(w)
                print(f"    {i+1}. {text[:150]}")
            print()

        # Unvalidated assumptions
        ua = o.get("unvalidated_assumptions", [])
        if ua:
            print(f"  UNVALIDATED ASSUMPTIONS ({len(ua)}):")
            for i, a in enumerate(ua[:5]):
                text = a.get("assumption", str(a)) if isinstance(a, dict) else str(a)
                print(f"    {i+1}. {text[:150]}")
            print()

        # Kill criteria
        kc = o.get("kill_criteria", [])
        if kc:
            print(f"  KILL CRITERIA ({len(kc)}):")
            for i, k in enumerate(kc[:5]):
                text = k.get("criteria", str(k)) if isinstance(k, dict) else str(k)
                print(f"    {i+1}. {text[:150]}")
            print()

        # Stress tests summary
        st = o.get("stress_tests", {})
        if isinstance(st, dict):
            print("  STRESS TESTS:")
            for name, result in st.items():
                if isinstance(result, dict):
                    passed = result.get("pass", result.get("passed", "?"))
                    icon = "PASS" if passed else "FAIL"
                    summary = result.get("summary", result.get("switch_likelihood", ""))
                    print(f"    {name}: {icon} — {str(summary)[:100]}")
                else:
                    print(f"    {name}: {str(result)[:100]}")
        elif isinstance(st, list):
            print(f"  STRESS TESTS ({len(st)}):")
            for t in st:
                if isinstance(t, dict):
                    name = t.get("test", t.get("name", "?"))
                    passed = t.get("pass", t.get("passed", "?"))
                    print(f"    {name}: {'PASS' if passed else 'FAIL'}")
    else:
        print(f"  Raw: {r4.get('raw_text','')[:400]}")

    total_ms = int((time.monotonic() - total_start) * 1000)
    print()
    print("=" * 60)
    print(f"  Phase 3: {icon3} {s3} ({d3}ms)")
    print(f"  Phase 4: {icon4} {s4} ({d4}ms)")
    print(f"  Total: {total_ms}ms ({total_ms/1000:.0f}s)")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
