"""Marketing Department API — Full pipeline integration.

Kết nối: Social Listening → Audience Intel → Content Generation → Image → Publish → Analytics

POST /api/marketing/weekly-plan        — Run full pipeline: listen → analyze → generate
GET  /api/marketing/weekly             — Get posts for a specific week
GET  /api/marketing/today              — Today's posts + fresh insights
PUT  /api/marketing/post/{id}          — Edit a post
PUT  /api/marketing/post/{id}/approve  — Approve
PUT  /api/marketing/post/{id}/reject   — Reject
PUT  /api/marketing/post/{id}/draft    — Revert to draft
POST /api/marketing/post/{id}/image    — Generate image
POST /api/marketing/post/{id}/publish  — Publish to Facebook
DELETE /api/marketing/post/{id}        — Delete
PUT  /api/marketing/approve-all        — Approve all drafts for a week
GET  /api/marketing/stats              — Quarterly: real analytics + patterns + hypotheses
POST /api/marketing/scan-insights      — Manual trigger: run social listening now
GET  /api/marketing/insights           — Get latest audience insights from DB
"""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select, func, desc

from src.db.models import ScheduledPost, AudienceIntel, Pattern, Hypothesis, ScanReport, DecisionInsight
from src.db.session import SessionLocal
from src.project import get_project_context, build_search_queries

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/marketing")


def _now_vn() -> datetime:
    """Current time in Vietnam timezone."""
    return datetime.now(VN_TZ)


def _project_id() -> str:
    """Get project identifier for DB experiment_id fields — from project.yaml name."""
    name = get_project_context()["name"]
    # "Doitay.vn" → "doitay" — strip domain suffix, lowercase, clean
    clean = name.lower().split(".")[0].replace(" ", "_")
    return clean


# ── Agent System Integration ──


async def _run_agent_task(
    agent_name: str,
    task: str,
    input_data: dict[str, Any] | None = None,
    skill_code: str | None = None,
    skill_codes: list[str] | None = None,
    experiment_id: str | None = None,
    phase: str = "build_test",
) -> dict[str, Any] | list | None:
    """Run an agent from the agent system and return parsed output.

    Maps marketing operations to the correct agent + skill:
    - Social listening / audience scan → research agent (R2/R6)
    - Market signals → research agent (R1)
    - Competitor analysis → research agent (R4)
    - Content generation → content agent (C1-C3)
    - Pattern extraction → analytics agent (A7)
    - Stress testing → devils_advocate agent (A1)
    - Hypothesis generation → strategy agent (S7)
    """
    from src.agents.runner import run_agent_with_retry

    if experiment_id is None:
        experiment_id = _project_id()

    try:
        result = await run_agent_with_retry(
            agent_name=agent_name,
            task=task,
            experiment_id=experiment_id,
            phase=phase,
            input_data=input_data,
            skill_code=skill_code,
            skill_codes=skill_codes,
            max_retries=2,
        )

        if result.get("status") == "success" and result.get("output"):
            return result["output"]

        # Fallback: try parsing raw_text if output is None
        raw = result.get("raw_text", "")
        if raw:
            logger.info(f"Agent '{agent_name}' raw_text (first 500): {raw[:500]}")
            parsed = _safe_parse_json(raw)
            if parsed:
                return parsed

        logger.warning(f"Agent '{agent_name}' returned no usable output: {result.get('status')}")
        logger.warning(f"Agent result keys: {list(result.keys())}, error: {result.get('error')}")
        return None

    except Exception as e:
        logger.error(f"Agent '{agent_name}' execution failed: {e}")
        return None


# ── JSON Safety Helper ──


def _safe_parse_json(raw: str) -> dict | list | None:
    """Robustly parse JSON from AI responses that may have markdown fences or truncation."""
    import re

    text = raw.strip()

    # Strip markdown code fences
    if text.startswith("```"):
        # Remove opening fence (```json or ```)
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        # Remove closing fence
        text = re.sub(r"\n?```\s*$", "", text)
        text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fix truncated JSON: try closing open strings/arrays/objects
    for fix_suffix in ['"}]', '"}]}', '"}}]', '"]', '"}', '}]', ']}', '}', ']']:
        try:
            return json.loads(text + fix_suffix)
        except json.JSONDecodeError:
            continue

    # Last resort: find the largest valid JSON substring
    # Find first { or [
    start = -1
    for i, c in enumerate(text):
        if c in ('{', '['):
            start = i
            break
    if start == -1:
        return None

    # Try parsing from start, progressively trimming from end
    candidate = text[start:]
    for trim in range(0, min(200, len(candidate)), 1):
        trimmed = candidate if trim == 0 else candidate[:-trim]
        for fix_suffix in ['', '}', ']', '"}', '"]', '"}]', '"}]}', '}]}', '}}', '"]}}']:
            try:
                return json.loads(trimmed + fix_suffix)
            except json.JSONDecodeError:
                continue

    return None


# ── Request Models ──


class WeeklyPlanRequest(BaseModel):
    week_start: str  # "2026-03-24" (Monday)
    angle: str = ""
    extra_context: str = ""
    posts_per_day: int = 2
    reels_per_day: int = 2
    run_listening: bool = True  # scan social media before generating


class PostEditRequest(BaseModel):
    hook: str | None = None
    body: str | None = None
    cta: str | None = None
    hashtags: list[str] | None = None
    image_prompt: str | None = None
    scheduled_time: str | None = None
    reel_script: dict | None = None


class ImageRequest(BaseModel):
    prompt: str | None = None


class ScanRequest(BaseModel):
    """Optional custom queries for any scan endpoint."""
    custom_queries: list[str] | None = None


class GenerateHypothesesRequest(BaseModel):
    """Request body for hypothesis generation from intelligence data."""
    signals: list[dict] | None = None
    pain_phrases: list[dict] | None = None
    competitors: list[dict] | None = None
    gaps: list[dict] | None = None
    audience_profiles: list[dict] | None = None
    content_recommendations: list[dict] | None = None


# ── Helpers ──


def _post_to_dict(p: ScheduledPost) -> dict[str, Any]:
    return {
        "id": p.id,
        "hook": p.hook,
        "body": p.body,
        "cta": p.cta,
        "hashtags": p.hashtags or [],
        "angle": p.angle,
        "content_type": getattr(p, "content_type", None) or "post",
        "content_format": getattr(p, "content_format", None),
        "image_prompt": p.image_prompt,
        "image_path": p.image_path,
        "image_url": f"/images/{Path(p.image_path).name}" if p.image_path else None,
        "reel_script": getattr(p, "reel_script", None),
        "video_path": getattr(p, "video_path", None),
        "video_url": f"/videos/{Path(p.video_path).name}" if getattr(p, "video_path", None) else None,
        "scheduled_date": p.scheduled_date,
        "scheduled_time": p.scheduled_time,
        "platform": p.platform,
        "status": p.status,
        "post_url": p.post_url,
        "fb_post_id": p.fb_post_id,
        "posted_at": p.posted_at.isoformat() if p.posted_at else None,
        "impressions": p.impressions,
        "engagements": p.engagements,
        "clicks": p.clicks,
        "week_label": p.week_label,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _week_label(date_str: str) -> str:
    d = datetime.strptime(date_str, "%Y-%m-%d")
    return f"{d.year}-W{d.isocalendar()[1]:02d}"


# ═══════════════════════════════════════════════
# STAGE 1: Social Listening — Collect fresh insights
# ═══════════════════════════════════════════════


async def _run_social_listening(custom_queries: list[str] | None = None) -> list[dict]:
    """Run social listening: search for pain points from contractor groups.

    Uses: search_tools.web_search (SerpAPI) → Agent extracts pain phrases → save to audience_intel.
    """
    from src.tools.search_tools import web_search

    ctx = get_project_context()
    queries = build_search_queries("social_listening", custom_queries)

    raw_results = []
    for q in queries:
        try:
            result = await web_search(q, num_results=5, location="Vietnam", lang="vi")
            if result.get("results"):
                for r in result["results"][:3]:
                    raw_results.append(f"[{r.get('title', '')}] {r.get('snippet', '')}")
        except Exception as e:
            logger.warning(f"Search failed for '{q}': {e}")

    if not raw_results:
        logger.info("Social listening: no results from web search")
        return []

    # Use Research Agent (R2: Social Listening) to extract pain phrases
    combined = "\n".join(raw_results[:15])
    task = f"""Trích xuất NỖI ĐAU CỤ THỂ mà {ctx['vertical']} đang gặp từ dữ liệu social listening.
Chỉ report FACTS, không recommend.

Trả về JSON object với key "pain_phrases" chứa array:
{{"pain_phrases": [{{"pain_phrase": "câu nỗi đau bằng ngôn ngữ thực", "segment": "phân loại", "sentiment": "negative/frustrated/worried", "frequency": 1-5}}]}}"""

    try:
        agent_output = await _run_agent_task(
            agent_name="research",
            task=task,
            input_data={"search_results": combined, "vertical": ctx["vertical"], "geography": ctx["geography"]},
            skill_code="R2",
            phase="discover",
        )

        # Extract pain phrases from agent output
        if isinstance(agent_output, dict):
            insights = agent_output.get("pain_phrases") or agent_output.get("audience_intel", {}).get("pain_phrases", [])
        elif isinstance(agent_output, list):
            insights = agent_output
        else:
            insights = []

        if not isinstance(insights, list):
            insights = []
        if not insights or not isinstance(insights, list):
            insights = []

        # Save to database
        saved = []
        async with SessionLocal() as session:
            for item in insights:
                intel = AudienceIntel(
                    id=str(uuid.uuid4()),
                    experiment_id=_project_id(),  # single project
                    pain_phrase=item.get("pain_phrase", ""),
                    source_platform="web_search",
                    frequency=item.get("frequency", 1),
                    sentiment=item.get("sentiment", "negative"),
                    segment=item.get("segment", ""),
                )
                session.add(intel)
                saved.append({
                    "pain_phrase": intel.pain_phrase,
                    "segment": intel.segment,
                    "sentiment": intel.sentiment,
                    "frequency": intel.frequency,
                })
            await session.commit()

        logger.info(f"Social listening: extracted {len(saved)} pain phrases")
        return saved

    except Exception as e:
        logger.error(f"Social listening extraction failed: {e}")
        return []


# ═══════════════════════════════════════════════
# STAGE 2: Context Building — Combine all intelligence
# ═══════════════════════════════════════════════


async def _build_enriched_context() -> str:
    """Build content generation context from ALL sources:
    1. project.yaml (static context)
    2. audience_intel (dynamic pain phrases from social listening)
    3. past post performance (what angles/hooks worked)
    4. pattern library (lessons learned)
    """
    from src.project import get_content_prompt_context

    # 1. Static project context
    base_context = get_content_prompt_context()

    # 2. Fresh audience insights (top 10 most frequent pain phrases)
    insights_text = ""
    async with SessionLocal() as session:
        result = await session.execute(
            select(AudienceIntel)
            .where(AudienceIntel.experiment_id == _project_id())
            .order_by(desc(AudienceIntel.frequency), desc(AudienceIntel.created_at))
            .limit(10)
        )
        insights = result.scalars().all()
        if insights:
            pain_lines = [f'  - "{i.pain_phrase}" (segment: {i.segment or "chung"}, tần suất: {i.frequency})' for i in insights]
            insights_text = f"\n\n**NỖI ĐAU THỰC TẾ TỪ SOCIAL LISTENING (mới nhất):**\n" + "\n".join(pain_lines)

    # 3. Past performance — which angles/hooks got best engagement
    performance_text = ""
    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.status == "posted")
            .order_by(desc(ScheduledPost.posted_at))
            .limit(10)
        )
        posted = result.scalars().all()
        if posted:
            # Count by angle
            angle_counts: dict[str, int] = {}
            for p in posted:
                a = p.angle or "unknown"
                angle_counts[a] = angle_counts.get(a, 0) + 1

            # Best hooks (by engagement if available, otherwise most recent)
            engaged = sorted(posted, key=lambda p: (p.engagements or 0), reverse=True)
            top_hooks = [f'  - [{p.angle}] "{(p.hook or "")[:80]}"' for p in engaged[:3] if p.hook]

            performance_text = f"\n\n**HIỆU SUẤT GẦN ĐÂY:**"
            performance_text += f"\nBài đã đăng: {len(posted)}"
            performance_text += f"\nPhân bổ angle: {', '.join(f'{a}: {c} bài' for a, c in angle_counts.items())}"
            if top_hooks:
                performance_text += f"\nHook tốt nhất:\n" + "\n".join(top_hooks)

    # 4. Pattern library lessons
    patterns_text = ""
    async with SessionLocal() as session:
        result = await session.execute(
            select(Pattern)
            .order_by(desc(Pattern.created_at))
            .limit(5)
        )
        patterns = result.scalars().all()
        if patterns:
            pattern_lines = [f'  - [{p.category}] {p.title}: {p.description[:100]}' for p in patterns]
            patterns_text = f"\n\n**BÀI HỌC TỪ PATTERN LIBRARY:**\n" + "\n".join(pattern_lines)

    # 5. Hypothesis backlog (Tier 2+3 = validated ideas to test)
    hypotheses_text = ""
    async with SessionLocal() as session:
        result = await session.execute(
            select(Hypothesis)
            .where(Hypothesis.is_active == True)
            .where(Hypothesis.tier >= 2)
            .order_by(desc(Hypothesis.tier), desc(Hypothesis.signal_score))
            .limit(5)
        )
        hyps = result.scalars().all()
        if hyps:
            hyp_lines = [f'  - [T{h.tier}] {h.title}: {h.description[:100] if h.description else ""}' for h in hyps]
            hypotheses_text = f"\n\n**HYPOTHESIS CẦN TEST TUẦN NÀY (từ Intelligence Layer):**\n" + "\n".join(hyp_lines)
            hypotheses_text += "\n→ Ưu tiên tạo content test các hypothesis trên. Mỗi hypothesis = 1-2 bài test cụ thể."

    return base_context + insights_text + performance_text + patterns_text + hypotheses_text


# ═══════════════════════════════════════════════
# STAGE 3: Content Generation — AI writes using full context
# ═══════════════════════════════════════════════


@router.post("/weekly-plan")
async def generate_weekly_plan(req: WeeklyPlanRequest) -> dict[str, Any]:
    """Full pipeline: Social Listening → Build Context → Generate Content Plan."""

    ctx = get_project_context()

    # STEP 1: Run social listening (if enabled)
    new_insights = []
    if req.run_listening:
        logger.info("Weekly plan: running social listening first...")
        new_insights = await _run_social_listening()

    # STEP 2: Build enriched context (project + insights + performance + patterns)
    enriched_context = await _build_enriched_context()

    # STEP 3: Generate content with full context
    start = datetime.strptime(req.week_start, "%Y-%m-%d")
    days = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    day_names = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
    week = _week_label(req.week_start)

    angle_instruction = ""
    if req.angle:
        angle_instruction = f"\n**Angle ưu tiên tuần này:** {req.angle}"
    if req.extra_context:
        angle_instruction += f"\n**Ghi chú từ CEO:** {req.extra_context}"

    reels_per_day = getattr(req, "reels_per_day", 2)
    days_spec = "\n".join(
        f"- {day_names[i]} ({days[i]}): {req.posts_per_day} bài post + {reels_per_day} reels"
        for i in range(7)
    )

    angles_str = " / ".join(ctx["angles"]) if ctx.get("angles") else "Cai Uy / Si Dien / Co Hoi"

    content_task = f"""Tao KE HOACH CONTENT cho tuan {week}:
{days_spec}
{angle_instruction}

QUAN TRONG:
- Su dung NOI DAU THUC TE tu audience intel de viet content chan thuc
- Phan bo deu cac angles ({angles_str}) qua tuan
- KHONG lap lai hook da dung truoc do
- Gio dang uu tien: 10:00, 14:00, 20:00
- Viet bang ngon ngu tho, khong phai ngon ngu cong ty

DA DANG FORMAT BAI POST (BAT BUOC):
Moi ngay {req.posts_per_day} bai post PHAI xen ke cac format khac nhau trong tuan:
- **Longform** (C2): Bai dai 300-500 tu, chia se kien thuc sau, co cau truc ro rang (van de → giai phap → ket qua). Dung cho build authority.
- **Shortform** (C3): Bai ngan 50-150 tu, di thang vao van de, toi uu engagement. Dung cho viral, tuong tac cao.
- **Storytelling** (C4): Ke chuyen khach hang/tho thuc te, co nhan vat + dien bien + bai hoc. Gay cam xuc.
- **Zero-click** (C6): Cho toan bo gia tri trong bai, khong can click link. Tips, checklist, how-to ngan gon.
- **CTA-focused** (C7): Bai tap trung chuyen doi, co uu dai/khuyen mai/khan hiem. Push hanh dong.
MOI format it nhat xuat hien 2-3 lan trong tuan. KHONG duoc chi viet 1 kieu.
Them truong "content_format" vao moi post: "longform" | "shortform" | "storytelling" | "zero_click" | "cta_focused"

YEU CAU VE REELS (QUAN TRONG):
- Moi ngay tao DUNG {reels_per_day} reels voi content_type="reel"
- Moi reel CHI 10 GIAY, toi da 3 frames
- Moi reel co truong "reel_script" day du gom: title, duration_seconds=10, style, music_mood, frames[]
- Moi frame PHAI co: frame_number, start_time, end_time, text_overlay (ngan 1-2 dong), voiceover_text (tieng Viet, NGAN vi chi 3-4 giay/frame), visual_direction (MO TA CANH/HINH ANH cu the de AI generate anh background, VD: "Tho dien lanh dang lap may trong phong khach hien dai"), background_color, text_position, text_size
- visual_direction KHONG duoc viet kieu "dark background, bold text" — PHAI la mo ta hinh anh/canh cu the
- Hook frame dau (0-3s) phai gay to mo
- Frame cuoi la CTA (8-10s)
- Style reel: educational, problem_solution, tips, before_after, storytelling

Tra ve JSON object voi TAT CA posts va reels trong 1 mang "items":
{{"items": [
  {{"date":"YYYY-MM-DD","time":"HH:MM","angle":"...","platform":"facebook","content_type":"post","content_format":"shortform","hook":"...","body":"...","cta":"...","hashtags":["#tag"],"image_prompt":"..."}},
  {{"date":"YYYY-MM-DD","time":"HH:MM","angle":"...","platform":"facebook","content_type":"reel","hook":"text overlay frame 1","body":"tom tat reel","cta":"...","hashtags":["#tag"],"image_prompt":"thumbnail","reel_script":{{"title":"...","duration_seconds":10,"style":"educational","music_mood":"upbeat","frames":[{{"frame_number":1,"start_time":0,"end_time":3,"text_overlay":"HOOK","text_position":"center","text_size":"large","voiceover_text":"...","visual_direction":"Mo ta canh cu the cho AI generate anh","background_color":"#1a1a2e"}},{{"frame_number":2,"start_time":3,"end_time":8,"text_overlay":"Noi dung","text_position":"center","text_size":"medium","voiceover_text":"...","visual_direction":"Mo ta canh cu the","background_color":"#16213e"}},{{"frame_number":3,"start_time":8,"end_time":10,"text_overlay":"CTA","text_position":"center","text_size":"large","voiceover_text":"Lien he ngay","visual_direction":"Logo va thong tin lien he","background_color":"#0f3d3e"}}]}}}}
]}}"""

    try:
        # Use Content Agent with multiple skills for diverse content
        agent_output = await _run_agent_task(
            agent_name="content",
            task=content_task,
            input_data={
                "enriched_context": enriched_context,
                "pillars": ctx["angles"] if ctx.get("angles") else ["Cai Uy", "Si Dien", "Co Hoi"],
                "audience_intel": {"context": f"{ctx['vertical']} tai {ctx['geography']}"},
                "week": week,
                "days": days,
                "reels_per_day": reels_per_day,
            },
            skill_codes=["C1", "C2", "C3", "C4", "C6", "C7", "C12"],
            phase="build_test",
        )

        # Extract posts from agent output
        if isinstance(agent_output, dict) and "items" in agent_output:
            posts_data = agent_output["items"]
        elif isinstance(agent_output, list):
            posts_data = agent_output
        else:
            posts_data = None

        if not posts_data or not isinstance(posts_data, list):
            return {"status": "failed", "error": "AI returned invalid content plan"}

        # Save to database
        saved = []
        async with SessionLocal() as session:
            for p in posts_data:
                post = ScheduledPost(
                    id=str(uuid.uuid4()),
                    hook=p.get("hook", ""),
                    body=p.get("body", ""),
                    cta=p.get("cta", ""),
                    hashtags=p.get("hashtags", []),
                    angle=p.get("angle", ""),
                    image_prompt=p.get("image_prompt", ""),
                    content_type=p.get("content_type", "post"),
                    content_format=p.get("content_format"),
                    reel_script=p.get("reel_script"),
                    scheduled_date=p.get("date", days[0]),
                    scheduled_time=p.get("time", "10:00"),
                    platform="facebook",
                    status="draft",
                    week_label=week,
                )
                session.add(post)
                saved.append(post)
            await session.commit()
            for p in saved:
                await session.refresh(p)

        return {
            "status": "success",
            "week": week,
            "posts": [_post_to_dict(p) for p in saved],
            "total": len(saved),
            "pipeline": {
                "social_listening": len(new_insights),
                "context_sources": [
                    "project.yaml",
                    f"audience_intel ({len(new_insights)} new)",
                    "past_performance",
                    "pattern_library",
                ],
            },
        }

    except Exception as e:
        logger.error(f"Weekly plan generation failed: {e}")
        return {"status": "failed", "error": str(e)}


# ═══════════════════════════════════════════════
# Manual Social Listening Trigger
# ═══════════════════════════════════════════════


@router.post("/scan-insights")
async def scan_insights() -> dict[str, Any]:
    """Manually trigger social listening scan."""
    insights = await _run_social_listening()
    return {
        "status": "success",
        "new_insights": len(insights),
        "insights": insights,
    }


@router.get("/insights")
async def get_insights(limit: int = 20) -> dict[str, Any]:
    """Get latest audience insights from DB."""
    async with SessionLocal() as session:
        result = await session.execute(
            select(AudienceIntel)
            .where(AudienceIntel.experiment_id == _project_id())
            .order_by(desc(AudienceIntel.created_at))
            .limit(limit)
        )
        insights = result.scalars().all()

    return {
        "total": len(insights),
        "insights": [
            {
                "id": i.id,
                "pain_phrase": i.pain_phrase,
                "segment": i.segment,
                "sentiment": i.sentiment,
                "frequency": i.frequency,
                "source": i.source_platform,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in insights
        ],
    }


# ═══════════════════════════════════════════════
# CRUD + Publish (unchanged)
# ═══════════════════════════════════════════════


@router.get("/weekly")
async def get_weekly_posts(week: str = "") -> dict[str, Any]:
    if not week:
        today = _now_vn()
        monday = today - timedelta(days=today.weekday())
        week = _week_label(monday.strftime("%Y-%m-%d"))
    elif "-W" not in week:
        week = _week_label(week)

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.week_label == week)
            .order_by(ScheduledPost.scheduled_date, ScheduledPost.scheduled_time)
        )
        posts = result.scalars().all()

    return {
        "week": week,
        "posts": [_post_to_dict(p) for p in posts],
        "total": len(posts),
        "by_status": {
            "draft": sum(1 for p in posts if p.status == "draft"),
            "approved": sum(1 for p in posts if p.status == "approved"),
            "posted": sum(1 for p in posts if p.status == "posted"),
            "rejected": sum(1 for p in posts if p.status == "rejected"),
        },
    }


@router.get("/today")
async def get_today_posts() -> dict[str, Any]:
    """Get today's posts + latest insights."""
    today = _now_vn().strftime("%Y-%m-%d")

    async with SessionLocal() as session:
        # Today's posts
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.scheduled_date == today)
            .order_by(ScheduledPost.scheduled_time)
        )
        posts = result.scalars().all()

        # Recent insights (last 24h)
        yesterday = _now_vn() - timedelta(days=1)
        result2 = await session.execute(
            select(AudienceIntel)
            .where(AudienceIntel.experiment_id == _project_id())
            .where(AudienceIntel.created_at >= yesterday)
            .order_by(desc(AudienceIntel.frequency))
            .limit(5)
        )
        recent_insights = result2.scalars().all()

    return {
        "date": today,
        "posts": [_post_to_dict(p) for p in posts],
        "total": len(posts),
        "recent_insights": [
            {"pain_phrase": i.pain_phrase, "segment": i.segment, "frequency": i.frequency}
            for i in recent_insights
        ],
    }


@router.put("/post/{post_id}")
async def edit_post(post_id: str, req: PostEditRequest) -> dict[str, Any]:
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            return {"error": "Post not found", "status": "failed"}
        if post.status == "posted":
            return {"error": "Cannot edit posted content", "status": "failed"}
        if req.hook is not None: post.hook = req.hook
        if req.body is not None: post.body = req.body
        if req.cta is not None: post.cta = req.cta
        if req.hashtags is not None: post.hashtags = req.hashtags
        if req.image_prompt is not None: post.image_prompt = req.image_prompt
        if req.scheduled_time is not None: post.scheduled_time = req.scheduled_time
        if req.reel_script is not None: post.reel_script = req.reel_script
        await session.commit()
        await session.refresh(post)
    return {"status": "success", "post": _post_to_dict(post)}


@router.put("/post/{post_id}/approve")
async def approve_post(post_id: str) -> dict[str, Any]:
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post: return {"error": "Post not found", "status": "failed"}
        post.status = "approved"
        await session.commit()
        await session.refresh(post)
    return {"status": "success", "post": _post_to_dict(post)}


@router.put("/post/{post_id}/reject")
async def reject_post(post_id: str) -> dict[str, Any]:
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post: return {"error": "Post not found", "status": "failed"}
        post.status = "rejected"
        await session.commit()
        await session.refresh(post)
    return {"status": "success", "post": _post_to_dict(post)}


@router.put("/post/{post_id}/draft")
async def revert_to_draft(post_id: str) -> dict[str, Any]:
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post: return {"error": "Post not found", "status": "failed"}
        if post.status == "posted": return {"error": "Cannot revert posted content", "status": "failed"}
        post.status = "draft"
        await session.commit()
        await session.refresh(post)
    return {"status": "success", "post": _post_to_dict(post)}


@router.post("/post/{post_id}/image")
async def generate_post_image(post_id: str, req: ImageRequest) -> dict[str, Any]:
    from src.tools.image_tools import generate_image
    from pathlib import Path
    import time

    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post: return {"error": "Post not found", "status": "failed"}

        # Use custom prompt if provided, otherwise use post's image_prompt directly
        # (skip C11 agent call — saves cost and avoids API credit issues)
        if req.prompt:
            final_prompt = req.prompt
        elif post.image_prompt:
            final_prompt = post.image_prompt
        else:
            # Auto-build prompt from post content (no AI call needed)
            ctx = get_project_context()
            final_prompt = (
                f"Social media marketing image for {ctx.get('vertical', 'service')}. "
                f"Theme: {(post.hook or '')[:100]}. "
                f"Vietnamese market context, professional and inviting. "
                f"Modern flat illustration, vibrant colors, clean design. "
                f"No text overlays, no watermarks, clean composition."
                f"Shot on a Canon EOS R5 with a 35mm lens, natural film grain, filmi look, dramatic lighting, 8k, detailed textures."
                f"Vietnamese handcraft"
            )

        content_type = getattr(post, "content_type", "post") or "post"
        style = "modern flat illustration, vibrant colors, clean design"
        aspect_ratio = "9:16" if content_type == "reel" else "16:9"

        if not final_prompt:
            return {"error": "No image prompt available", "status": "failed"}

        filename = f"{_project_id()}_{int(time.time())}"
        img_result = await generate_image(
            prompt=final_prompt,
            style=style,
            aspect_ratio=aspect_ratio,
            num_images=1,
            output_filename=filename,
        )

        if img_result.get("status") == "success" and img_result.get("image_paths"):
            abs_path = img_result["image_paths"][0]
            post.image_path = abs_path
            post.image_url = f"/images/{Path(abs_path).name}"
            post.image_prompt = final_prompt  # save the designed prompt
            await session.commit()
            await session.refresh(post)
            return {"status": "success", "post": _post_to_dict(post)}

        return {"status": "failed", "error": img_result.get("error", "Image generation failed")}


@router.post("/post/{post_id}/generate-video")
async def generate_post_video(post_id: str) -> dict[str, Any]:
    """Generate reel video from a post's reel_script."""
    from src.tools.reel_generator import generate_reel_video

    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            return {"error": "Post not found", "status": "failed"}

        reel_script = getattr(post, "reel_script", None)
        if not reel_script:
            return {"error": "Post has no reel_script", "status": "failed"}

        # If reel has no image yet, generate one from reel title/hook as background
        fallback_bg = getattr(post, "image_path", None)
        if not fallback_bg or not Path(fallback_bg).exists():
            from src.tools.image_tools import generate_image
            reel_title = reel_script.get("title", "") or getattr(post, "hook", "") or ""
            if reel_title:
                img_prompt = (
                    f"Cinematic background for short video about: {reel_title[:120]}. "
                    f"Vietnamese context, dramatic lighting, vertical 9:16, "
                    f"vibrant colors, no text, no watermarks."
                )
                img_result = await generate_image(prompt=img_prompt, aspect_ratio="9:16", num_images=1)
                if img_result.get("status") == "success" and img_result.get("image_paths"):
                    fallback_bg = img_result["image_paths"][0]
                    post.image_path = fallback_bg
                    post.image_url = f"/images/{Path(fallback_bg).name}"
                    await session.commit()

        video_result = await generate_reel_video(reel_script, fallback_bg_image=fallback_bg)

        if video_result.get("status") == "success":
            post.video_path = video_result["video_path"]
            post.video_url = f"/videos/{video_result['video_filename']}"
            await session.commit()
            await session.refresh(post)
            return {"status": "success", "post": _post_to_dict(post), "video": video_result}

        return {"status": "failed", "error": video_result.get("error", "Video generation failed")}


@router.post("/post/{post_id}/publish")
async def publish_post(post_id: str) -> dict[str, Any]:
    """Publish to Facebook + save performance tracking."""
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post: return {"error": "Post not found", "status": "failed"}
        if post.status == "posted": return {"error": "Already posted", "status": "failed"}

        full_message = f"{post.hook}\n\n{post.body}\n\n{post.cta}\n\n{' '.join(post.hashtags or [])}"

        try:
            if post.image_path and Path(post.image_path).exists():
                from src.tools.image_tools import upload_image_to_facebook
                fb_result = await upload_image_to_facebook(image_path=post.image_path, caption=full_message)
            else:
                from src.tools.marketing_tools import post_facebook
                fb_result = await post_facebook(message=full_message)
        except Exception as e:
            logger.error(f"Publish failed for {post_id}: {e}")
            return {"status": "failed", "error": str(e)}

        if fb_result.get("status") == "posted":
            post.status = "posted"
            post.fb_post_id = fb_result.get("post_id")
            post.post_url = fb_result.get("url")
            post.posted_at = _now_vn()
            await session.commit()
            await session.refresh(post)

            # Notify CEO via Telegram (non-blocking)
            try:
                from src.tools.notifications import send_telegram
                await send_telegram(
                    f"Đã đăng Facebook\n\n{(post.hook or '')[:60]}\n\nAngle: {post.angle}\n{post.post_url}"
                )
            except Exception:
                pass

            return {"status": "success", "post": _post_to_dict(post)}

        return {"status": "failed", "error": fb_result.get("error", "Publish failed")}


@router.delete("/post/{post_id}")
async def delete_post(post_id: str) -> dict[str, Any]:
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post: return {"error": "Post not found", "status": "failed"}
        if post.status == "posted": return {"error": "Cannot delete posted content", "status": "failed"}
        await session.delete(post)
        await session.commit()
    return {"status": "success"}


@router.put("/approve-all")
async def approve_all_week(week: str = "") -> dict[str, Any]:
    if not week:
        today = _now_vn()
        monday = today - timedelta(days=today.weekday())
        week = _week_label(monday.strftime("%Y-%m-%d"))
    elif "-W" not in week:
        week = _week_label(week)

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost).where(ScheduledPost.week_label == week).where(ScheduledPost.status == "draft")
        )
        posts = result.scalars().all()
        for p in posts:
            p.status = "approved"
        await session.commit()
    return {"status": "success", "approved_count": len(posts)}


# ═══════════════════════════════════════════════
# TELEGRAM 2-WAY APPROVAL
# ═══════════════════════════════════════════════


@router.post("/send-for-approval")
async def send_drafts_for_approval(week: str = "") -> dict[str, Any]:
    """Send all draft posts for a week to Telegram with approve/reject buttons."""
    from src.tools.notifications import send_batch_for_approval

    if not week:
        today = _now_vn()
        monday = today - timedelta(days=today.weekday())
        week = _week_label(monday.strftime("%Y-%m-%d"))
    elif "-W" not in week:
        week = _week_label(week)

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.week_label == week)
            .where(ScheduledPost.status == "draft")
            .order_by(ScheduledPost.scheduled_date, ScheduledPost.scheduled_time)
        )
        drafts = result.scalars().all()

    if not drafts:
        return {"status": "success", "message": "No drafts to send", "count": 0}

    posts_data = [
        {
            "id": p.id,
            "hook": p.hook or "",
            "body": p.body or "",
            "angle": p.angle or "",
            "scheduled_date": p.scheduled_date,
            "scheduled_time": p.scheduled_time or "10:00",
        }
        for p in drafts
    ]

    result = await send_batch_for_approval(posts_data)
    return {"status": "success", "sent": len(posts_data)}


@router.post("/telegram-webhook")
async def telegram_webhook(update: dict) -> dict[str, Any]:
    """Handle Telegram callback queries (button presses) for post approval.

    Telegram sends: {"callback_query": {"data": "approve:post_id", "message": {...}}}
    """
    from src.tools.notifications import update_telegram_message
    from src.config import TELEGRAM_BOT_TOKEN

    callback = update.get("callback_query")
    if not callback:
        return {"ok": True}

    callback_data = callback.get("data", "")
    callback_id = callback.get("id", "")
    message = callback.get("message", {})
    message_id = message.get("message_id")

    # Answer callback to remove loading state
    if TELEGRAM_BOT_TOKEN and callback_id:
        import httpx
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
                json={"callback_query_id": callback_id},
            )

    if callback_data.startswith("approve:"):
        post_id = callback_data.split(":", 1)[1]
        async with SessionLocal() as session:
            result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
            post = result.scalar_one_or_none()
            if post and post.status == "draft":
                post.status = "approved"
                await session.commit()
                if message_id:
                    await update_telegram_message(message_id, f"✅ *ĐÃ DUYỆT*\n\n{post.hook}\n_{post.scheduled_date} {post.scheduled_time}_")
                logger.info(f"Telegram: approved post {post_id}")
                return {"ok": True, "action": "approved"}

    elif callback_data.startswith("reject:"):
        post_id = callback_data.split(":", 1)[1]
        async with SessionLocal() as session:
            result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
            post = result.scalar_one_or_none()
            if post and post.status == "draft":
                post.status = "rejected"
                await session.commit()
                if message_id:
                    await update_telegram_message(message_id, f"❌ *ĐÃ TỪ CHỐI*\n\n~~{post.hook}~~\n_{post.scheduled_date}_")
                logger.info(f"Telegram: rejected post {post_id}")
                return {"ok": True, "action": "rejected"}

    elif callback_data == "approve_all":
        # Approve all current drafts
        async with SessionLocal() as session:
            today = _now_vn()
            monday = today - timedelta(days=today.weekday())
            week = _week_label(monday.strftime("%Y-%m-%d"))
            result = await session.execute(
                select(ScheduledPost).where(ScheduledPost.week_label == week).where(ScheduledPost.status == "draft")
            )
            drafts = result.scalars().all()
            count = len(drafts)
            for p in drafts:
                p.status = "approved"
            await session.commit()
            if message_id:
                await update_telegram_message(message_id, f"✅ *ĐÃ DUYỆT TẤT CẢ — {count} bài*")
            logger.info(f"Telegram: approved all {count} drafts")
            return {"ok": True, "action": "approved_all", "count": count}

    return {"ok": True}


@router.post("/telegram-poll")
async def telegram_poll() -> dict[str, Any]:
    """Poll Telegram for callback updates (for local dev without public webhook).

    Fetches pending updates, processes any callback_query, then acknowledges them.
    """
    import httpx
    from src.config import TELEGRAM_BOT_TOKEN

    if not TELEGRAM_BOT_TOKEN:
        return {"status": "skipped", "reason": "not_configured"}

    async with httpx.AsyncClient(timeout=10) as client:
        # Get updates
        resp = await client.get(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates",
            params={"timeout": 1, "allowed_updates": '["callback_query"]'},
        )
        if resp.status_code != 200:
            return {"status": "failed", "error": resp.text}

        data = resp.json()
        updates = data.get("result", [])

        if not updates:
            return {"status": "success", "processed": 0}

        processed = 0
        for update in updates:
            # Process via our webhook handler
            result = await telegram_webhook(update)
            if result.get("action"):
                processed += 1

        # Acknowledge all updates
        last_update_id = updates[-1].get("update_id", 0)
        await client.get(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates",
            params={"offset": last_update_id + 1},
        )

    return {"status": "success", "processed": processed, "total_updates": len(updates)}


# ═══════════════════════════════════════════════
# STAGE 5: Quarterly Stats — Real analytics + patterns + hypotheses
# ═══════════════════════════════════════════════


@router.get("/stats")
async def get_stats() -> dict[str, Any]:
    """Full quarterly view: post analytics + pattern library + hypothesis backlog."""
    async with SessionLocal() as session:
        # Posts
        result = await session.execute(select(ScheduledPost))
        all_posts = result.scalars().all()

        # Patterns
        result2 = await session.execute(select(Pattern).order_by(desc(Pattern.created_at)).limit(20))
        patterns = result2.scalars().all()

        # Hypotheses
        result3 = await session.execute(select(Hypothesis).where(Hypothesis.is_active == True).order_by(desc(Hypothesis.signal_score)))
        hypotheses = result3.scalars().all()

        # Audience insights count
        result4 = await session.execute(
            select(func.count(AudienceIntel.id)).where(AudienceIntel.experiment_id == _project_id())
        )
        insights_count = result4.scalar() or 0

    posted = [p for p in all_posts if p.status == "posted"]

    # Group by week
    by_week: dict[str, list] = {}
    for p in all_posts:
        wk = p.week_label or "unknown"
        by_week.setdefault(wk, []).append(p)

    # Group by angle
    by_angle: dict[str, int] = {}
    for p in posted:
        a = p.angle or "unknown"
        by_angle[a] = by_angle.get(a, 0) + 1

    # Engagement by angle
    engagement_by_angle: dict[str, dict] = {}
    for p in posted:
        a = p.angle or "unknown"
        if a not in engagement_by_angle:
            engagement_by_angle[a] = {"posts": 0, "impressions": 0, "engagements": 0}
        engagement_by_angle[a]["posts"] += 1
        engagement_by_angle[a]["impressions"] += p.impressions or 0
        engagement_by_angle[a]["engagements"] += p.engagements or 0

    # Top performing posts (sorted by engagement desc)
    posted_sorted = sorted(posted, key=lambda p: (p.engagements or 0) + (p.impressions or 0), reverse=True)

    return {
        "total_posts": len(all_posts),
        "total_posted": len(posted),
        "total_draft": sum(1 for p in all_posts if p.status == "draft"),
        "total_approved": sum(1 for p in all_posts if p.status == "approved"),
        "total_rejected": sum(1 for p in all_posts if p.status == "rejected"),
        "total_views": sum(p.impressions or 0 for p in posted),
        "total_reach": sum(p.reach or 0 for p in posted),
        "total_engagements": sum(p.engagements or 0 for p in posted),
        "total_clicks": sum(p.clicks or 0 for p in posted),
        "by_angle": by_angle,
        "engagement_by_angle": engagement_by_angle,
        "weeks": sorted(by_week.keys()),
        "by_week": {
            wk: {
                "total": len(posts),
                "posted": sum(1 for p in posts if p.status == "posted"),
                "impressions": sum(p.impressions or 0 for p in posts),
                "engagements": sum(p.engagements or 0 for p in posts),
            }
            for wk, posts in by_week.items()
        },
        # Posted posts with FB metrics
        "posted_posts": [
            {
                "id": p.id,
                "hook": (p.hook or "")[:80],
                "angle": p.angle,
                "scheduled_date": p.scheduled_date,
                "posted_at": p.posted_at.isoformat() if p.posted_at else None,
                "post_url": p.post_url,
                "views": p.impressions or 0,
                "reach": p.reach or 0,
                "engagements": p.engagements or 0,
                "clicks": p.clicks or 0,
                "comments": p.comments or 0,
                "shares": p.shares or 0,
                "reactions": p.reactions or 0,
                "image_url": f"/images/{Path(p.image_path).name}" if p.image_path else None,
            }
            for p in posted_sorted
        ],
        # Pattern Library
        "patterns": [
            {
                "id": p.id,
                "category": p.category,
                "title": p.title,
                "description": p.description[:200],
                "result": p.result,
                "confidence": p.confidence,
            }
            for p in patterns
        ],
        # Hypothesis Backlog
        "hypotheses": [
            {
                "id": h.id,
                "title": h.title,
                "tier": h.tier,
                "signal_type": h.signal_type,
                "signal_score": h.signal_score,
            }
            for h in hypotheses
        ],
        "hypothesis_summary": {
            "tier1": sum(1 for h in hypotheses if h.tier == 1),
            "tier2": sum(1 for h in hypotheses if h.tier == 2),
            "tier3": sum(1 for h in hypotheses if h.tier == 3),
        },
        # Intelligence
        "total_insights": insights_count,
    }


# ═══════════════════════════════════════════════════════════════
# PATTERN EXTRACTION — AI analyzes post performance → saves learnings
# ═══════════════════════════════════════════════════════════════


@router.post("/extract-patterns")
async def extract_patterns() -> dict[str, Any]:
    """AI analyzes posted content performance and extracts patterns.

    Compares posts by: angle, hook style, time posted, engagement rate.
    Saves winning/failed/emerging patterns to Pattern Library.
    """
    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.status == "posted")
            .where(ScheduledPost.fb_post_id.isnot(None))
        )
        posted = result.scalars().all()

    if len(posted) < 2:
        return {"status": "failed", "error": "Need at least 2 posted posts to extract patterns"}

    # Build post performance summary for AI
    post_summaries = []
    for p in posted:
        post_summaries.append(
            f"- Hook: {(p.hook or '')[:60]} | Angle: {p.angle} | "
            f"Date: {p.scheduled_date} Time: {p.scheduled_time or 'N/A'} | "
            f"Views: {p.impressions or 0} | Reach: {p.reach or 0} | "
            f"Engagements: {p.engagements or 0} | Clicks: {p.clicks or 0} | "
            f"Body preview: {(p.body or '')[:80]}"
        )
    posts_text = "\n".join(post_summaries)

    try:
        # Use Analytics Agent (A7: Pattern Extraction)
        agent_output = await _run_agent_task(
            agent_name="analytics",
            task=f"""Phân tích performance {len(posted)} bài Facebook đã đăng cho {get_project_context()['name']}.
So sánh và tìm PATTERNS: angle nào work, hook style nào, timing, content length.
Chỉ tạo patterns có evidence cụ thể từ data.

Trả về JSON object:
{{"patterns_discovered": [{{"category": "content/timing/angle/audience", "title": "tên pattern", "description": "mô tả chi tiết", "result": "win/fail/emerging", "confidence": 0.0-1.0, "recommendation": "khuyến nghị cụ thể"}}]}}""",
            input_data={"posts_performance": posts_text, "experiment_id": _project_id()},
            skill_code="A7",
            phase="extract",
        )

        # Extract patterns from agent output
        if isinstance(agent_output, dict):
            patterns_data = agent_output.get("patterns_discovered") or agent_output.get("patterns", [])
        elif isinstance(agent_output, list):
            patterns_data = agent_output
        else:
            patterns_data = None
        if not patterns_data or not isinstance(patterns_data, list):
            return {"status": "failed", "error": "AI returned invalid patterns"}

        # Save to DB
        saved = []
        async with SessionLocal() as session:
            for pat in patterns_data:
                p = Pattern(
                    id=str(uuid.uuid4()),
                    title=pat.get("title", ""),
                    category=pat.get("category", "content"),
                    description=pat.get("description", "") + "\n\nRecommendation: " + pat.get("recommendation", ""),
                    result=pat.get("result", "emerging"),
                    confidence=pat.get("confidence"),
                    experiment_id=_project_id(),
                )
                session.add(p)
                saved.append({
                    "id": p.id,
                    "title": p.title,
                    "category": p.category,
                    "result": p.result,
                    "confidence": p.confidence,
                    "description": p.description[:200],
                })
            await session.commit()

        return {"status": "success", "patterns": saved, "posts_analyzed": len(posted)}

    except Exception as e:
        logger.error(f"Pattern extraction failed: {e}")
        return {"status": "failed", "error": str(e)}


# ═══════════════════════════════════════════════════════════════
# FACEBOOK METRICS SYNC — Pull per-post performance from Graph API
# ═══════════════════════════════════════════════════════════════


@router.post("/sync-metrics")
async def sync_fb_metrics() -> dict[str, Any]:
    """Pull performance metrics from Facebook Graph API for all posted posts.

    Uses v21.0 API. Available metrics:
    - post_impressions_unique (reach)
    - post_clicks
    - post_reactions_like_total, post_reactions_love_total, etc.
    - likes/comments/reactions/shares via Object API
    """
    import httpx
    from src.config import FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID

    if not FACEBOOK_PAGE_ACCESS_TOKEN or not FACEBOOK_PAGE_ID:
        return {"status": "failed", "error": "Facebook credentials not configured"}

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.status == "posted")
            .where(ScheduledPost.fb_post_id.isnot(None))
        )
        posted = result.scalars().all()

    if not posted:
        return {"status": "success", "message": "No posted posts to sync", "synced": 0}

    synced = 0
    errors = []

    async with httpx.AsyncClient(timeout=20) as client:
        for post in posted:
            fb_id = post.fb_post_id
            if not fb_id:
                continue

            try:
                # Resolve the correct page-post ID for Insights API
                # Photo uploads may store photo_id; we need the actual post_id
                original_fb_id = fb_id
                if "_" not in str(fb_id) and FACEBOOK_PAGE_ID:
                    # This is likely a photo_id — try to find the real post_id
                    # by querying the photo object for its page_story_id
                    try:
                        r_photo = await client.get(
                            f"https://graph.facebook.com/v21.0/{fb_id}",
                            params={
                                "fields": "page_story_id",
                                "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                            },
                        )
                        photo_data = r_photo.json()
                        if "page_story_id" in photo_data:
                            fb_id = photo_data["page_story_id"]
                            logger.info(f"Resolved photo {original_fb_id} → post {fb_id}")
                            # Update stored fb_post_id so future syncs are faster
                            async with SessionLocal() as session:
                                res = await session.execute(
                                    select(ScheduledPost).where(ScheduledPost.id == post.id)
                                )
                                p = res.scalar_one_or_none()
                                if p:
                                    p.fb_post_id = fb_id
                                    await session.commit()
                        else:
                            fb_id = f"{FACEBOOK_PAGE_ID}_{fb_id}"
                            logger.warning(f"No page_story_id for photo {original_fb_id}, fallback: {fb_id}")
                    except Exception as e:
                        fb_id = f"{FACEBOOK_PAGE_ID}_{fb_id}"
                        logger.warning(f"Failed to resolve photo_id {original_fb_id}: {e}, fallback: {fb_id}")

                # 1. Object API: likes, comments, reactions, shares
                r1 = await client.get(
                    f"https://graph.facebook.com/v21.0/{fb_id}",
                    params={
                        "fields": "likes.summary(true),comments.summary(true),reactions.summary(true),shares",
                        "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                    },
                )
                obj = r1.json()
                if "error" in obj:
                    logger.warning(f"Object API error for {fb_id}: {obj['error'].get('message', '')}")
                    errors.append({"post_id": post.id, "fb_id": fb_id, "error": f"Object API: {obj['error'].get('message', '')}"})
                    continue
                likes = obj.get("likes", {}).get("summary", {}).get("total_count", 0)
                comments = obj.get("comments", {}).get("summary", {}).get("total_count", 0)
                reactions = obj.get("reactions", {}).get("summary", {}).get("total_count", 0)
                shares = obj.get("shares", {}).get("count", 0)

                # 2. Post Insights: views (impressions) + reach + clicks
                views = 0
                reach = 0
                clicks = 0
                insights_ok = False

                try:
                    r_insights = await client.get(
                        f"https://graph.facebook.com/v21.0/{fb_id}/insights",
                        params={
                            "metric": "post_impressions,post_impressions_unique,post_clicks",
                            "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                        },
                    )
                    ins_data = r_insights.json()

                    if "error" in ins_data:
                        logger.warning(f"Insights API error for {fb_id}: {ins_data['error'].get('message', '')} "
                                       f"(code: {ins_data['error'].get('code')})")
                    elif "data" in ins_data:
                        for metric in ins_data["data"]:
                            name = metric.get("name", "")
                            val = metric.get("values", [{}])[0].get("value", 0)
                            if name == "post_impressions":
                                views = val
                            elif name == "post_impressions_unique":
                                reach = val
                            elif name == "post_clicks":
                                clicks = val
                        insights_ok = True
                except Exception as e:
                    logger.warning(f"Insights fetch failed for {fb_id}: {e}")

                total_engagements = reactions + comments + shares

                # Update DB — only overwrite impressions/reach/clicks if Insights API succeeded
                async with SessionLocal() as session:
                    res = await session.execute(
                        select(ScheduledPost).where(ScheduledPost.id == post.id)
                    )
                    p = res.scalar_one_or_none()
                    if p:
                        if insights_ok:
                            p.impressions = views
                            p.reach = reach
                            p.clicks = clicks
                        p.engagements = total_engagements
                        p.comments = comments
                        p.shares = shares
                        p.reactions = reactions
                        await session.commit()

                synced += 1
                logger.info(f"Synced {post.id}: views={views}, reach={reach}, eng={total_engagements}, clicks={clicks}, insights_ok={insights_ok}")

            except Exception as e:
                errors.append({"post_id": post.id, "fb_id": fb_id, "error": str(e)})
                logger.error(f"Failed to sync metrics for {post.id}: {e}")

    return {
        "status": "success",
        "synced": synced,
        "total_posted": len(posted),
        "errors": errors,
    }


@router.get("/debug-fb-token")
async def debug_fb_token() -> dict[str, Any]:
    """Debug: check Facebook token permissions and test insights on first posted post."""
    import httpx
    from src.config import FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID

    if not FACEBOOK_PAGE_ACCESS_TOKEN:
        return {"error": "FACEBOOK_PAGE_ACCESS_TOKEN not set"}

    results: dict[str, Any] = {}

    async with httpx.AsyncClient(timeout=15) as client:
        # 1. Check token info + permissions
        r = await client.get(
            "https://graph.facebook.com/v21.0/me",
            params={"fields": "id,name", "access_token": FACEBOOK_PAGE_ACCESS_TOKEN},
        )
        results["token_check"] = r.json()

        # 2. Check token permissions
        r2 = await client.get(
            f"https://graph.facebook.com/v21.0/{FACEBOOK_PAGE_ID}",
            params={"fields": "id,name,access_token", "access_token": FACEBOOK_PAGE_ACCESS_TOKEN},
        )
        results["page_check"] = r2.json()

        # 3. Test insights on first posted post
        async with SessionLocal() as session:
            result = await session.execute(
                select(ScheduledPost)
                .where(ScheduledPost.status == "posted")
                .where(ScheduledPost.fb_post_id.isnot(None))
                .limit(1)
            )
            post = result.scalar_one_or_none()

        if post:
            fb_id = post.fb_post_id
            results["test_post_id"] = fb_id

            # Test Object API
            r3 = await client.get(
                f"https://graph.facebook.com/v21.0/{fb_id}",
                params={
                    "fields": "likes.summary(true),comments.summary(true),reactions.summary(true),shares,message",
                    "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                },
            )
            results["object_api"] = r3.json()

            # Test Insights API
            r4 = await client.get(
                f"https://graph.facebook.com/v21.0/{fb_id}/insights",
                params={
                    "metric": "post_impressions,post_impressions_unique,post_clicks",
                    "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                },
            )
            results["insights_api"] = r4.json()
        else:
            results["test_post"] = "No posted posts found"

    return results


# ═══════════════════════════════════════════════════════════════
# INTELLIGENCE TAB — Market scan, competitor scan, hypotheses
# ═══════════════════════════════════════════════════════════════


@router.post("/intel/scan-market")
async def intel_scan_market(req: ScanRequest | None = None) -> dict[str, Any]:
    """Full market scan: social listening + trend detection.
    Returns fresh pain phrases, signals, and market trends.
    Accepts optional custom_queries to override default search queries.
    """
    import os
    from src.tools.search_tools import web_search

    custom_queries = req.custom_queries if req else None
    results: dict[str, Any] = {"pain_phrases": [], "trends": [], "signals": []}

    # 1. Social listening (existing)
    try:
        pain = await _run_social_listening(custom_queries=custom_queries)
        results["pain_phrases"] = pain
    except Exception as e:
        logger.error(f"Market scan - social listening failed: {e}")

    # 2. Trend detection — dynamic queries from project.yaml (or custom)
    ctx = get_project_context()
    trend_queries = build_search_queries("trends", custom_queries)
    raw_trends = []
    for q in trend_queries:
        try:
            r = await web_search(q, num_results=5, location="Vietnam", lang="vi")
            for item in (r.get("results") or [])[:3]:
                raw_trends.append({"title": item.get("title", ""), "snippet": item.get("snippet", ""), "url": item.get("link", "")})
        except Exception:
            pass
    results["trends"] = raw_trends

    # 3. Signal detection — Research Agent (R1: Market Scanning)
    if raw_trends:
        try:
            trend_text = "\n".join([f"- {t['title']}: {t['snippet']}" for t in raw_trends[:10]])
            agent_output = await _run_agent_task(
                agent_name="research",
                task=f"""Xác định TÍN HIỆU THỊ TRƯỜNG (market signals) từ dữ liệu xu hướng.
5 loại: fragmentation, trust_gap, info_asymmetry, behavior_shift, opportunity.

Trả về JSON object:
{{"signals": [{{"type": "loại signal", "title": "tiêu đề ngắn", "evidence": "bằng chứng cụ thể", "strength": 1-5}}]}}""",
                input_data={"trends": trend_text, "vertical": ctx["vertical"], "geography": ctx["geography"]},
                skill_code="R1",
                phase="discover",
            )
            if isinstance(agent_output, dict) and "signals" in agent_output:
                results["signals"] = agent_output["signals"]
            elif isinstance(agent_output, list):
                results["signals"] = agent_output
        except Exception as e:
            logger.error(f"Signal detection failed: {e}")

    results["status"] = "success"
    results["scanned_at"] = _now_vn().isoformat()

    # Save to DB for history
    sig_count = len(results.get("signals", []))
    pain_count = len(results.get("pain_phrases", []))
    trend_count = len(results.get("trends", []))
    async with SessionLocal() as session:
        report = ScanReport(
            id=str(uuid.uuid4()),
            scan_type="market",
            data=results,
            summary=f"{sig_count} signals, {pain_count} pain phrases, {trend_count} trends",
        )
        session.add(report)
        await session.commit()

    return results


@router.post("/intel/scan-competitors")
async def intel_scan_competitors(req: ScanRequest | None = None) -> dict[str, Any]:
    """Scan competitor content and ads. Accepts optional custom_queries."""
    import os
    from src.tools.search_tools import web_search

    # Search for competitor activity — dynamic queries from project.yaml (or custom)
    ctx = get_project_context()
    custom_queries = req.custom_queries if req else None
    competitor_queries = build_search_queries("competitors", custom_queries)

    raw_results = []
    for q in competitor_queries:
        try:
            r = await web_search(q, num_results=5, location="Vietnam", lang="vi")
            for item in (r.get("results") or [])[:3]:
                raw_results.append({"title": item.get("title", ""), "snippet": item.get("snippet", ""), "url": item.get("link", "")})
        except Exception:
            pass

    if not raw_results:
        return {"status": "success", "competitors": [], "ads": [], "content_analysis": []}

    # Research Agent (R4: Competitive Intelligence)
    combined = "\n".join([f"- [{r['title']}] {r['snippet']} ({r['url']})" for r in raw_results[:15]])

    try:
        analysis = await _run_agent_task(
            agent_name="research",
            task=f"""Phân tích cạnh tranh trong thị trường kết nối {ctx['vertical'].lower()} tại {ctx['geography']}.
Giữ mỗi field ngắn gọn (tối đa 1 câu). Không dùng dấu ngoặc kép bên trong value string.

Trả về JSON object:
{{"competitors": [{{"name": "tên", "type": "app/platform/facebook_page", "strength": "điểm mạnh", "weakness": "điểm yếu", "content_strategy": "mô tả", "threat_level": "high/medium/low"}}],
"content_trends": [{{"trend": "xu hướng", "who_uses": "ai dùng", "effectiveness": "đánh giá"}}],
"gaps": [{{"gap": "lỗ hổng", "opportunity": "cơ hội cho {ctx['name']}"}}],
"ad_insights": [{{"observation": "nhận xét", "implication": "ý nghĩa cho {ctx['name']}"}}]}}""",
            input_data={"search_results": combined, "vertical": ctx["vertical"], "geography": ctx["geography"]},
            skill_code="R4",
            phase="discover",
        )

        if not analysis or not isinstance(analysis, dict):
            return {"status": "failed", "error": "Agent returned no analysis"}
        analysis["status"] = "success"
        analysis["scanned_at"] = _now_vn().isoformat()

        # Save to DB for history
        comp_count = len(analysis.get("competitors", []))
        gap_count = len(analysis.get("gaps", []))
        async with SessionLocal() as session:
            report = ScanReport(
                id=str(uuid.uuid4()),
                scan_type="competitor",
                data=analysis,
                summary=f"{comp_count} competitors, {gap_count} gaps",
            )
            session.add(report)
            await session.commit()

        return analysis
    except Exception as e:
        logger.error(f"Competitor analysis failed: {e}")
        return {"status": "failed", "error": str(e), "raw_results": raw_results}


@router.post("/intel/scan-audience")
async def intel_scan_audience(req: ScanRequest | None = None) -> dict[str, Any]:
    """Scan target audience: pain points, behaviors, language, gathering places.
    Accepts optional custom_queries (used for both supply and demand searches).
    """
    import os
    from src.tools.search_tools import web_search

    ctx = get_project_context()
    custom_queries = req.custom_queries if req else None
    results: dict[str, Any] = {"supply_profiles": [], "demand_profiles": [], "behaviors": [], "language_patterns": [], "gathering_places": []}

    # 1. Search for supply-side behaviors and pain points — dynamic from project.yaml (or custom)
    supply_queries = build_search_queries("audience_supply", custom_queries)

    # 2. Search for demand-side behaviors — dynamic from project.yaml (or custom)
    demand_queries = build_search_queries("audience_demand", custom_queries)

    raw_supply = []
    for q in supply_queries:
        try:
            r = await web_search(q, num_results=5, location="Vietnam", lang="vi")
            for item in (r.get("results") or [])[:3]:
                raw_supply.append({"title": item.get("title", ""), "snippet": item.get("snippet", ""), "url": item.get("link", "")})
        except Exception:
            pass

    raw_demand = []
    for q in demand_queries:
        try:
            r = await web_search(q, num_results=5, location="Vietnam", lang="vi")
            for item in (r.get("results") or [])[:3]:
                raw_demand.append({"title": item.get("title", ""), "snippet": item.get("snippet", ""), "url": item.get("link", "")})
        except Exception:
            pass

    all_raw = raw_supply + raw_demand
    if not all_raw:
        return {"status": "success", **results}

    # 3. Research Agent (R6: Customer Research + S2: Segmentation)
    supply_text = "\n".join([f"- {r['title']}: {r['snippet']}" for r in raw_supply[:12]])
    demand_text = "\n".join([f"- {r['title']}: {r['snippet']}" for r in raw_demand[:12]])

    try:
        analysis = await _run_agent_task(
            agent_name="research",
            task=f"""Xây dựng chân dung đối tượng khách hàng cho {ctx['name']} (KHÔNG demographics, chỉ HÀNH VI và JOBS-TO-BE-DONE).
Vertical: {ctx['vertical']} tại {ctx['geography']}.

Trả về JSON object:
{{"supply_profiles": [{{"segment_name": "tên theo hành vi", "job_to_be_done": "việc họ đang cố làm", "current_workaround": "cách hiện tại", "pain_points": ["nỗi đau"], "switching_trigger": "sự kiện tìm solution mới", "where_they_gather": ["nơi online"], "language_they_use": ["cụm từ"], "underservice_score": 1-5}}],
"demand_profiles": [cùng format],
"behaviors": [{{"behavior": "mô tả", "side": "supply/demand", "frequency": "daily/weekly/monthly", "implication": "ý nghĩa"}}],
"language_patterns": [{{"phrase": "cụm từ", "context": "khi nào dùng", "side": "supply/demand", "content_angle": "góc content"}}],
"gathering_places": [{{"platform": "nền tảng", "specific_place": "tên cụ thể", "side": "supply/demand", "activity_level": "high/medium/low"}}],
"content_recommendations": [{{"insight": "nhận xét", "content_idea": "ý tưởng", "target": "supply/demand/both", "angle": "{' / '.join(ctx['angles'])}"}}]}}""",
            input_data={"supply_data": supply_text, "demand_data": demand_text, "vertical": ctx["vertical"], "geography": ctx["geography"]},
            skill_code="R6",
            phase="discover",
        )

        if not analysis or not isinstance(analysis, dict):
            return {"status": "failed", "error": "Agent returned no analysis"}

        analysis["status"] = "success"
        analysis["scanned_at"] = _now_vn().isoformat()

        # Save to DB
        supply_count = len(analysis.get("supply_profiles", []))
        demand_count = len(analysis.get("demand_profiles", []))
        rec_count = len(analysis.get("content_recommendations", []))
        async with SessionLocal() as session:
            report = ScanReport(
                id=str(uuid.uuid4()),
                scan_type="audience",
                data=analysis,
                summary=f"{supply_count} supply profiles, {demand_count} demand profiles, {rec_count} recommendations",
            )
            session.add(report)
            await session.commit()

        # Also save language patterns as AudienceIntel for enriching content generation
        if analysis.get("language_patterns"):
            async with SessionLocal() as session:
                for lp in analysis["language_patterns"][:10]:
                    intel = AudienceIntel(
                        id=str(uuid.uuid4()),
                        experiment_id=_project_id(),
                        pain_phrase=lp.get("phrase", ""),
                        source_platform="audience_scan",
                        segment=lp.get("side", ""),
                        sentiment=lp.get("context", ""),
                        frequency=1,
                    )
                    session.add(intel)
                await session.commit()

        return analysis
    except Exception as e:
        logger.error(f"Audience scan failed: {e}")
        return {"status": "failed", "error": str(e)}


@router.post("/intel/synthetic-interview")
async def intel_synthetic_interview() -> dict[str, Any]:
    """Run full Synthetic Interview pipeline: signals → insights → personas → interview → decision map.

    Collects ALL available intelligence (market signals, competitor analysis,
    audience profiles, social pain phrases) from DB, then runs insight_engine agent
    through the full R8→R9→R10→A10→A11 pipeline.
    """
    ctx = get_project_context()
    experiment_id = _project_id()

    # 1. Gather all available data from DB
    async with SessionLocal() as session:
        # Pain phrases from audience_intel (social listening)
        pain_result = await session.execute(
            select(AudienceIntel)
            .where(AudienceIntel.experiment_id == experiment_id)
            .order_by(desc(AudienceIntel.frequency))
            .limit(50)
        )
        pain_rows = pain_result.scalars().all()

        # Latest MARKET scan report
        market_scan_result = await session.execute(
            select(ScanReport)
            .where(ScanReport.scan_type == "market")
            .order_by(desc(ScanReport.created_at))
            .limit(1)
        )
        latest_market_scan = market_scan_result.scalar_one_or_none()

        # Latest COMPETITOR scan report
        competitor_scan_result = await session.execute(
            select(ScanReport)
            .where(ScanReport.scan_type == "competitor")
            .order_by(desc(ScanReport.created_at))
            .limit(1)
        )
        latest_competitor_scan = competitor_scan_result.scalar_one_or_none()

        # Latest AUDIENCE scan report
        audience_scan_result = await session.execute(
            select(ScanReport)
            .where(ScanReport.scan_type == "audience")
            .order_by(desc(ScanReport.created_at))
            .limit(1)
        )
        latest_audience_scan = audience_scan_result.scalar_one_or_none()

        # Active hypotheses for enrichment
        hyp_result = await session.execute(
            select(Hypothesis).where(Hypothesis.is_active == True).limit(20)
        )
        hypotheses = hyp_result.scalars().all()

    # ── Build structured data from each source ──

    pain_phrases = [
        {
            "text": p.pain_phrase,
            "platform": p.source_platform,
            "frequency": p.frequency or 1,
            "sentiment": p.sentiment,
            "segment": p.segment,
        }
        for p in pain_rows
    ]

    # Market signals
    market_signals = []
    if latest_market_scan and latest_market_scan.data:
        scan_data = latest_market_scan.data if isinstance(latest_market_scan.data, dict) else {}
        market_signals = scan_data.get("signals", [])

    # Competitor signals
    competitor_data: dict[str, Any] = {}
    if latest_competitor_scan and latest_competitor_scan.data:
        cd = latest_competitor_scan.data if isinstance(latest_competitor_scan.data, dict) else {}
        competitor_data = {
            "competitors": cd.get("competitors", []),
            "content_trends": cd.get("content_trends", []),
            "gaps": cd.get("gaps", []),
            "ad_insights": cd.get("ad_insights", []),
        }

    # Audience signals
    audience_data: dict[str, Any] = {}
    if latest_audience_scan and latest_audience_scan.data:
        ad = latest_audience_scan.data if isinstance(latest_audience_scan.data, dict) else {}
        audience_data = {
            "supply_profiles": ad.get("supply_profiles", []),
            "demand_profiles": ad.get("demand_profiles", []),
            "behaviors": ad.get("behaviors", []),
            "language_patterns": ad.get("language_patterns", []),
            "gathering_places": ad.get("gathering_places", []),
            "content_recommendations": ad.get("content_recommendations", []),
        }

    if len(pain_phrases) < 3 and not market_signals and not competitor_data and not audience_data:
        return {
            "status": "insufficient_data",
            "message": f"Cần ít nhất 3 pain phrases HOẶC dữ liệu từ Market/Competitor/Audience scan. "
                       f"Hiện có {len(pain_phrases)} pain phrases, "
                       f"{len(market_signals)} market signals, "
                       f"{len(competitor_data.get('competitors', []))} competitors, "
                       f"{len(audience_data.get('supply_profiles', []) + audience_data.get('demand_profiles', []))} audience profiles. "
                       f"Chạy các Scan trước.",
            "pain_phrases_count": len(pain_phrases),
            "market_signals_count": len(market_signals),
            "competitor_count": len(competitor_data.get("competitors", [])),
            "audience_profiles_count": len(audience_data.get("supply_profiles", []) + audience_data.get("demand_profiles", [])),
        }

    # 2. Run insight_engine agent — full pipeline with ALL signals
    input_data = {
        "pain_phrases": pain_phrases,
        "market_signals": market_signals,
        "competitor_analysis": competitor_data,
        "audience_analysis": audience_data,
        "product_context": {
            "name": ctx.get("name", ""),
            "vertical": ctx.get("vertical", ""),
            "geography": ctx.get("geography", ""),
            "description": ctx.get("description", ""),
        },
        "existing_hypotheses": [
            {"id": h.id, "title": h.title, "tier": h.tier}
            for h in hypotheses
        ],
    }

    # Count all sources for logging
    total_market = len(market_signals)
    total_competitors = len(competitor_data.get("competitors", []))
    total_gaps = len(competitor_data.get("gaps", []))
    total_audience = len(audience_data.get("supply_profiles", []) + audience_data.get("demand_profiles", []))
    total_behaviors = len(audience_data.get("behaviors", []))

    logger.info(
        f"Starting Synthetic Interview pipeline: "
        f"{len(pain_phrases)} pain phrases, "
        f"{total_market} market signals, "
        f"{total_competitors} competitors, "
        f"{total_gaps} gaps, "
        f"{total_audience} audience profiles, "
        f"{total_behaviors} behaviors"
    )

    agent_output = await _run_agent_task(
        agent_name="insight_engine",
        task=f"""Chạy FULL Synthetic Interview pipeline cho dự án "{ctx.get('name', '')}".

Vertical: {ctx.get('vertical', '')}
Geography: {ctx.get('geography', '')}

Pipeline: R8 (Insight Structuring) → R9 (Persona Synthesis) → R10 (Synthetic Interview) → A10 (Decision Mapping) → A11 (Validation)

Dữ liệu input:
- {len(pain_phrases)} pain phrases (social listening)
- {total_market} market signals (xu hướng thị trường, tín hiệu thay đổi)
- {total_competitors} competitors (phân tích đối thủ, điểm mạnh/yếu)
- {total_gaps} market gaps (lỗ hổng thị trường, cơ hội)
- {total_audience} audience profiles (chân dung khách hàng supply + demand)
- {total_behaviors} audience behaviors (hành vi khách hàng)

Tạo 2-3 personas dựa trên TẤT CẢ dữ liệu trên. Interview mỗi persona. Extract Decision Map.
Personas phải phản ánh insights từ competitor gaps, audience pain points, VÀ market signals.

CRITICAL: Output PHẢI là pure JSON.""",
        input_data=input_data,
        skill_code=None,  # Full pipeline, no focus
        phase="discover",
    )

    if not agent_output or not isinstance(agent_output, dict):
        return {"status": "failed", "error": "Agent không trả về output hợp lệ"}

    # 3. Save to DB
    decision_map = agent_output.get("decision_map", {})
    personas = agent_output.get("personas", [])
    validation = agent_output.get("validation_summary", {})

    total_signals = total_market + total_competitors + total_gaps + total_audience

    insight_id = str(uuid.uuid4())
    async with SessionLocal() as session:
        di = DecisionInsight(
            id=insight_id,
            experiment_id=experiment_id,
            personas=personas,
            interviews=agent_output.get("interviews") or agent_output.get("interview_transcripts"),
            decision_map=decision_map,
            validation=validation,
            growth_actions=agent_output.get("top_growth_actions", []),
            source_pain_phrases_count=len(pain_phrases),
            source_signals_count=total_signals,
            total_personas=len(personas),
            total_interviews=agent_output.get("insights_summary", {}).get("total_interviews", len(personas)),
            verified_insights_count=validation.get("verified", 0),
            avg_confidence=_calc_avg_confidence(decision_map),
            pipeline_status=agent_output.get("pipeline_status", "complete"),
        )
        session.add(di)
        await session.commit()

    logger.info(f"Synthetic Interview complete: {len(personas)} personas, saved as {insight_id}")

    return {
        "status": "success",
        "insight_id": insight_id,
        "personas_count": len(personas),
        "decision_map_summary": {
            "buy_triggers": len(decision_map.get("buy_triggers", [])),
            "objections": len(decision_map.get("objections", [])),
            "deal_breakers": len(decision_map.get("deal_breakers", [])),
            "trust_drivers": len(decision_map.get("trust_drivers", [])),
            "price_sensitivity": len(decision_map.get("price_sensitivity", [])),
        },
        "sources_used": {
            "pain_phrases": len(pain_phrases),
            "market_signals": total_market,
            "competitors": total_competitors,
            "gaps": total_gaps,
            "audience_profiles": total_audience,
            "behaviors": total_behaviors,
        },
        "validation": validation,
        "output": agent_output,
    }


def _calc_avg_confidence(decision_map: dict) -> float | None:
    """Calculate average confidence score across all decision map entries."""
    scores = []
    for key in ["buy_triggers", "objections", "deal_breakers", "trust_drivers", "price_sensitivity", "switch_triggers"]:
        for item in decision_map.get(key, []):
            if isinstance(item, dict) and "confidence_score" in item:
                scores.append(item["confidence_score"])
    return sum(scores) / len(scores) if scores else None


@router.get("/intel/decision-map")
async def intel_get_decision_map() -> dict[str, Any]:
    """Get latest Decision Map from Synthetic Interview pipeline."""
    experiment_id = _project_id()

    async with SessionLocal() as session:
        result = await session.execute(
            select(DecisionInsight)
            .where(DecisionInsight.experiment_id == experiment_id)
            .order_by(desc(DecisionInsight.created_at))
            .limit(1)
        )
        di = result.scalar_one_or_none()

    if not di:
        return {
            "status": "no_data",
            "message": "Chưa chạy Synthetic Interview. Bấm 'Phỏng vấn sâu' để bắt đầu.",
        }

    return {
        "status": "success",
        "insight_id": di.id,
        "created_at": di.created_at.isoformat() if di.created_at else None,
        "pipeline_status": di.pipeline_status,
        "personas": di.personas or [],
        "decision_map": di.decision_map or {},
        "validation": di.validation or {},
        "growth_actions": di.growth_actions or [],
        "meta": {
            "source_pain_phrases": di.source_pain_phrases_count,
            "source_signals": di.source_signals_count,
            "total_personas": di.total_personas,
            "total_interviews": di.total_interviews,
            "verified_insights": di.verified_insights_count,
            "avg_confidence": di.avg_confidence,
        },
    }


@router.get("/intel/decision-map/history")
async def intel_decision_map_history(limit: int = 10) -> list[dict]:
    """Get history of Synthetic Interview runs."""
    experiment_id = _project_id()

    async with SessionLocal() as session:
        result = await session.execute(
            select(DecisionInsight)
            .where(DecisionInsight.experiment_id == experiment_id)
            .order_by(desc(DecisionInsight.created_at))
            .limit(limit)
        )
        rows = result.scalars().all()

    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "pipeline_status": r.pipeline_status,
            "total_personas": r.total_personas,
            "total_interviews": r.total_interviews,
            "verified_insights": r.verified_insights_count,
            "avg_confidence": r.avg_confidence,
            "buy_triggers_count": len((r.decision_map or {}).get("buy_triggers", [])),
            "objections_count": len((r.decision_map or {}).get("objections", [])),
        }
        for r in rows
    ]


@router.post("/intel/generate-hypotheses")
async def intel_generate_hypotheses(req: GenerateHypothesesRequest) -> dict[str, Any]:
    """AI synthesizes all intelligence into actionable hypotheses."""
    signals = req.signals
    pain_phrases = req.pain_phrases
    competitors = req.competitors
    gaps = req.gaps
    audience_profiles = req.audience_profiles
    content_recommendations = req.content_recommendations

    # Build context from provided data + DB
    context_parts = []
    # Track all source data for traceability
    source_summary = {"sources": [], "signal_count": 0, "pain_count": 0, "competitor_count": 0, "gap_count": 0}

    # Provided data
    if signals:
        context_parts.append("MARKET SIGNALS:\n" + "\n".join([f"- [{s.get('type')}] {s.get('title')}: {s.get('evidence')}" for s in signals]))
        source_summary["sources"].append("market_scan")
        source_summary["signal_count"] = len(signals)
        source_summary["signals"] = [{"type": s.get("type"), "title": s.get("title")} for s in signals]
    if pain_phrases:
        context_parts.append("PAIN PHRASES:\n" + "\n".join([f"- [{p.get('segment')}] {p.get('pain_phrase')} (freq: {p.get('frequency')})" for p in pain_phrases]))
        source_summary["sources"].append("pain_scan")
        source_summary["pain_count"] = len(pain_phrases)
        source_summary["pain_phrases"] = [p.get("pain_phrase", "") for p in pain_phrases[:5]]
    if competitors:
        context_parts.append("COMPETITORS:\n" + "\n".join([f"- {c.get('name')}: strength={c.get('strength')}, weakness={c.get('weakness')}" for c in competitors]))
        source_summary["sources"].append("competitor_scan")
        source_summary["competitor_count"] = len(competitors)
    if gaps:
        context_parts.append("MARKET GAPS:\n" + "\n".join([f"- {g.get('gap')}: {g.get('opportunity')}" for g in gaps]))
        source_summary["sources"].append("gap_analysis")
        source_summary["gap_count"] = len(gaps)
    if audience_profiles:
        context_parts.append("AUDIENCE PROFILES:\n" + "\n".join([
            f"- [{p.get('segment_name')}] Job: {p.get('job_to_be_done')}, Pain: {', '.join(p.get('pain_points', []))}, Trigger: {p.get('switching_trigger')}"
            for p in audience_profiles
        ]))
        source_summary["sources"].append("audience_scan")
    if content_recommendations:
        context_parts.append("CONTENT RECOMMENDATIONS FROM AUDIENCE SCAN:\n" + "\n".join([
            f"- [{r.get('angle')}] {r.get('insight')} → {r.get('content_idea')} (target: {r.get('target')})"
            for r in content_recommendations
        ]))
        source_summary["sources"].append("content_recommendations")

    # Also pull recent DB data (social listening insights)
    db_pain_phrases = []
    async with SessionLocal() as session:
        result = await session.execute(
            select(AudienceIntel)
            .order_by(desc(AudienceIntel.frequency), desc(AudienceIntel.created_at))
            .limit(10)
        )
        db_intel = result.scalars().all()
        if db_intel:
            context_parts.append("DB AUDIENCE INTEL (top pain phrases from social listening):\n" + "\n".join(
                [f"- [{i.segment}] {i.pain_phrase} (freq: {i.frequency})" for i in db_intel]
            ))
            source_summary["sources"].append("social_listening_db")
            db_pain_phrases = [{"phrase": i.pain_phrase, "segment": i.segment, "frequency": i.frequency} for i in db_intel]
            source_summary["db_pain_phrases"] = db_pain_phrases

    if not context_parts:
        return {"status": "failed", "error": "No intelligence data provided"}

    full_context = "\n\n".join(context_parts)

    try:
        # Strategy Agent (S7: Experiment Design) for hypothesis generation
        ctx = get_project_context()
        angles_str = " / ".join(ctx["angles"]) if ctx["angles"] else "Cái Uy / Sĩ Diện / Cơ Hội"
        angle_descriptions = ", ".join(f"{a['name']} ({a['description'][:30]})" for a in ctx["angle_details"]) if ctx["angle_details"] else angles_str

        # Step 1: Strategy Agent (S7) generates hypotheses — NO scoring here
        agent_output = await _run_agent_task(
            agent_name="strategy",
            task=f"""Dựa trên intelligence data, tạo 5-7 HYPOTHESES có thể test bằng content marketing.
Mỗi hypothesis phải: Falsifiable, Actionable, Specific.
Content angles: {angle_descriptions}.

Trả về JSON object:
{{"experiment_plan": [{{"title": "tiêu đề hypothesis",
"description": "IF [action] THEN [result] BECAUSE [reason]",
"signal_type": "pain_phrase/competitor_gap/trend/behavior_shift",
"suggested_angle": "{angles_str}",
"test_content": "mô tả bài test 1-2 câu",
"success_metric": "đo bằng gì"}}],
"thesis": "tổng hợp 1 câu về cơ hội thị trường",
"cvp": "giá trị cốt lõi {ctx['name']} mang lại",
"content_pillars": {json.dumps(ctx['angles'], ensure_ascii=False)}}}""",
            input_data={"intelligence_context": full_context},
            skill_code="S7",
            phase="define",
        )

        # Extract hypotheses from agent output
        if isinstance(agent_output, dict):
            hypotheses = agent_output.get("experiment_plan") or agent_output.get("hypotheses", [])
        elif isinstance(agent_output, list):
            hypotheses = agent_output
        else:
            hypotheses = None

        if not hypotheses or not isinstance(hypotheses, list):
            return {"status": "failed", "error": "AI returned invalid hypotheses"}

        # Save hypotheses immediately (A2 scoring skipped — use stress test for scoring later)
        scored_hypotheses = hypotheses

        # Step 2: Save to DB
        saved = []
        async with SessionLocal() as session:
            for h in scored_hypotheses:
                opp_score = h.get("opportunity_score", 0)
                priority = h.get("priority", "PARK")

                # Tier from A2 priority: HIGH→2, MEDIUM→1, PARK→1
                tier = 2 if priority == "HIGH" else 1

                hyp = Hypothesis(
                    id=str(uuid.uuid4()),
                    title=h.get("title", ""),
                    description=h.get("description", ""),
                    business_type=_project_id(),
                    tier=tier,
                    signal_type=h.get("signal_type", ""),
                    signal_score=opp_score,
                    source_agent="intelligence_tab",
                    source_data=source_summary,
                    is_active=True,
                )
                session.add(hyp)
                saved.append({
                    "id": hyp.id,
                    "title": hyp.title,
                    "description": hyp.description,
                    "signal_type": h.get("signal_type"),
                    "suggested_angle": h.get("suggested_angle"),
                    "test_content": h.get("test_content"),
                    "success_metric": h.get("success_metric"),
                    "signal_score": opp_score,
                    "priority": priority,
                    "scoring": h.get("scoring_detail", {}),
                    "tier": hyp.tier,
                    "source_data": source_summary,
                })
            await session.commit()

        return {"status": "success", "hypotheses": saved, "source_summary": source_summary}

    except Exception as e:
        logger.error(f"Hypothesis generation failed: {e}")
        return {"status": "failed", "error": str(e)}


@router.post("/intel/stress-test/{hypothesis_id}")
async def intel_stress_test(hypothesis_id: str) -> dict[str, Any]:
    """Devil's Advocate stress test for a hypothesis."""
    async with SessionLocal() as session:
        result = await session.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
        hyp = result.scalar_one_or_none()
        if not hyp:
            return {"status": "failed", "error": "Hypothesis not found"}

    try:
        # Devil's Advocate Agent (A1: Stress Testing)
        stress = await _run_agent_task(
            agent_name="devils_advocate",
            task=f"""STRESS TEST hypothesis này bằng 7 Stress-Test Questions.

HYPOTHESIS: {hyp.title}
DESCRIPTION: {hyp.description or ""}

Trả về JSON object:
{{"tests": [{{"name": "tên test", "finding": "phát hiện", "risk_level": "high/medium/low"}}],
"critical_weaknesses": [{{"weakness": "điểm yếu", "why_it_matters": "tại sao quan trọng", "severity": "high/medium/low"}}],
"unvalidated_assumptions": [{{"assumption": "giả định", "test_to_validate": "cách validate", "risk_if_wrong": "rủi ro"}}],
"competitive_vulnerability": "mô tả",
"kill_criteria": ["điều kiện kill"],
"verdict": "proceed/caution/more_evidence/kill",
"confidence": 0.0-1.0,
"reasoning": "lý do verdict"}}""",
            input_data={"data": {"hypothesis": hyp.title, "description": hyp.description}},
            skill_code="A1",
            phase="define",
        )

        if not stress or not isinstance(stress, dict):
            return {"status": "failed", "error": "AI returned invalid stress test"}

        # Normalize: agent may return "reasoning" instead of "recommendation"
        if "reasoning" in stress and "recommendation" not in stress:
            stress["recommendation"] = stress["reasoning"]
        # Normalize critical_weaknesses: may be list of dicts or strings
        cw = stress.get("critical_weaknesses", [])
        if cw and isinstance(cw[0], dict):
            stress["critical_weaknesses"] = [w.get("weakness", str(w)) for w in cw]
        # Normalize unvalidated_assumptions: same
        ua = stress.get("unvalidated_assumptions", [])
        if ua and isinstance(ua[0], dict):
            stress["unvalidated_assumptions"] = [a.get("assumption", str(a)) for a in ua]

        # Save stress test result to hypothesis
        async with SessionLocal() as session:
            result = await session.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
            hyp = result.scalar_one_or_none()
            if hyp:
                hyp.stress_test = stress
                # Promote to tier 2 if verdict is proceed
                if stress.get("verdict") == "proceed" and hyp.tier == 1:
                    hyp.tier = 2
                await session.commit()

        stress["status"] = "success"
        stress["hypothesis_id"] = hypothesis_id
        return stress

    except Exception as e:
        logger.error(f"Stress test failed: {e}")
        return {"status": "failed", "error": str(e)}


@router.put("/intel/hypothesis/{hypothesis_id}/promote")
async def intel_promote_hypothesis(hypothesis_id: str, tier: int = 2) -> dict[str, Any]:
    """Promote hypothesis to higher tier (CEO decision)."""
    async with SessionLocal() as session:
        result = await session.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
        hyp = result.scalar_one_or_none()
        if not hyp:
            return {"status": "failed", "error": "Not found"}
        hyp.tier = min(tier, 3)
        await session.commit()
    return {"status": "success", "tier": hyp.tier}


@router.delete("/intel/hypothesis/{hypothesis_id}")
async def intel_delete_hypothesis(hypothesis_id: str, hard: bool = False) -> dict[str, Any]:
    """Archive or permanently delete a hypothesis."""
    async with SessionLocal() as session:
        result = await session.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
        hyp = result.scalar_one_or_none()
        if not hyp:
            return {"status": "failed", "error": "Not found"}
        if hard:
            await session.delete(hyp)
        else:
            hyp.is_active = False
        await session.commit()
    return {"status": "success"}


@router.delete("/intel/pattern/{pattern_id}")
async def intel_delete_pattern(pattern_id: str) -> dict[str, Any]:
    """Permanently delete a pattern."""
    async with SessionLocal() as session:
        result = await session.execute(select(Pattern).where(Pattern.id == pattern_id))
        pat = result.scalar_one_or_none()
        if not pat:
            return {"status": "failed", "error": "Not found"}
        await session.delete(pat)
        await session.commit()
    return {"status": "success"}


@router.get("/intel/dashboard")
async def intel_dashboard() -> dict[str, Any]:
    """Get full intelligence state for the Intelligence tab."""
    async with SessionLocal() as session:
        # Active hypotheses
        result1 = await session.execute(
            select(Hypothesis).where(Hypothesis.is_active == True).order_by(desc(Hypothesis.tier), desc(Hypothesis.signal_score))
        )
        hypotheses = result1.scalars().all()

        # Recent insights
        result2 = await session.execute(
            select(AudienceIntel).order_by(desc(AudienceIntel.created_at)).limit(20)
        )
        insights = result2.scalars().all()

        # Patterns
        result3 = await session.execute(
            select(Pattern).order_by(desc(Pattern.created_at)).limit(10)
        )
        patterns = result3.scalars().all()

        # Scan history (last 10 scans)
        result4 = await session.execute(
            select(ScanReport).order_by(desc(ScanReport.created_at)).limit(10)
        )
        scans = result4.scalars().all()

    return {
        "hypotheses": [
            {
                "id": h.id,
                "title": h.title,
                "description": h.description,
                "tier": h.tier,
                "signal_type": h.signal_type,
                "signal_score": h.signal_score,
                "stress_test": h.stress_test,
                "created_at": h.created_at.isoformat() if h.created_at else None,
            }
            for h in hypotheses
        ],
        "insights": [
            {
                "id": i.id,
                "pain_phrase": i.pain_phrase,
                "segment": i.segment,
                "sentiment": i.sentiment,
                "frequency": i.frequency,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in insights
        ],
        "patterns": [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "result": p.result,
                "description": p.description[:200],
                "confidence": p.confidence,
            }
            for p in patterns
        ],
        "scan_history": [
            {
                "id": s.id,
                "scan_type": s.scan_type,
                "summary": s.summary,
                "data": s.data,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in scans
        ],
        "summary": {
            "total_hypotheses": len(hypotheses),
            "tier1": sum(1 for h in hypotheses if h.tier == 1),
            "tier2": sum(1 for h in hypotheses if h.tier == 2),
            "tier3": sum(1 for h in hypotheses if h.tier == 3),
            "total_insights": len(insights),
            "total_patterns": len(patterns),
            "total_scans": len(scans),
        },
    }


# ═══════════════════════════════════════════════════════════════
# WEEKLY REVIEW — Orchestrated chain: metrics → scoring → patterns → kill check
# ═══════════════════════════════════════════════════════════════


@router.post("/weekly-review")
async def weekly_review() -> dict[str, Any]:
    """Run full weekly review chain: A4 metrics → A6 CMF + A5 Traction → A7 Patterns → A1 Kill Check.

    Returns a unified weekly scorecard.
    """
    ctx = get_project_context()
    project = _project_id()

    # Step 0: Sync FB metrics first
    logger.info("Weekly review: syncing Facebook metrics...")
    sync_result = await sync_fb_metrics()

    # Collect this week's posted content
    today = _now_vn()
    monday = today - timedelta(days=today.weekday())
    week_start = monday.strftime("%Y-%m-%d")
    week_label = f"{monday.year}-W{monday.isocalendar()[1]:02d}"

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost).where(ScheduledPost.status == "posted")
        )
        all_posted = result.scalars().all()

    # Group by week for trend
    by_week: dict[str, dict] = {}
    for p in all_posted:
        wk = p.week_label or "unknown"
        if wk not in by_week:
            by_week[wk] = {"posts": 0, "impressions": 0, "reach": 0, "engagements": 0, "clicks": 0}
        by_week[wk]["posts"] += 1
        by_week[wk]["impressions"] += p.impressions or 0
        by_week[wk]["reach"] += p.reach or 0
        by_week[wk]["engagements"] += p.engagements or 0
        by_week[wk]["clicks"] += p.clicks or 0

    this_week = by_week.get(week_label, {"posts": 0, "impressions": 0, "reach": 0, "engagements": 0, "clicks": 0})
    weeks_sorted = sorted(by_week.keys())

    # Build performance summary for AI
    posts_summary = []
    for p in all_posted:
        posts_summary.append({
            "hook": (p.hook or "")[:60],
            "angle": p.angle,
            "date": p.scheduled_date,
            "time": p.scheduled_time,
            "views": p.impressions or 0,
            "reach": p.reach or 0,
            "engagements": p.engagements or 0,
            "clicks": p.clicks or 0,
            "week": p.week_label,
        })

    metrics_input = {
        "project": ctx["name"],
        "total_posts": len(all_posted),
        "this_week": this_week,
        "by_week_trend": {k: by_week[k] for k in weeks_sorted[-8:]},  # last 8 weeks
        "posts": posts_summary[-30:],  # last 30 posts
    }

    results = {"metrics_synced": sync_result.get("synced", 0)}

    # Step 1: A6 CMF Scoring
    logger.info("Weekly review: running CMF scoring (A6)...")
    try:
        cmf_output = await _run_agent_task(
            agent_name="analytics",
            task=f"""Tính Content-Market Fit (CMF) Score cho {ctx['name']} tuần {week_label}.

CMF Score = trung bình có trọng số của:
- Engagement Quality (chất lượng tương tác vs vanity metrics)
- Audience Relevance (đúng đối tượng mục tiêu: {ctx['vertical']} tại {ctx['geography']})
- Conversion Signal (tín hiệu chuyển đổi: clicks, CTA response)

Trả về JSON:
{{"cmf_score": 0.0-1.0, "engagement_quality": 0.0-1.0, "audience_relevance": 0.0-1.0, "conversion_signal": 0.0-1.0, "trend": "up|down|flat", "analysis": "phân tích ngắn", "top_performing": "mô tả content hiệu quả nhất", "improvement": "gợi ý cải thiện"}}""",
            input_data=metrics_input,
            skill_code="A6",
            phase="build_test",
        )
        results["cmf"] = cmf_output if isinstance(cmf_output, dict) else {"cmf_score": 0, "error": "invalid output"}
    except Exception as e:
        logger.error(f"CMF scoring failed: {e}")
        results["cmf"] = {"cmf_score": 0, "error": str(e)}

    # Step 2: A5 Traction Scoring (parallel concept, sequential execution)
    logger.info("Weekly review: running Traction scoring (A5)...")
    try:
        traction_output = await _run_agent_task(
            agent_name="analytics",
            task=f"""Tính Traction Score cho {ctx['name']} tuần {week_label}.

Traction Score dựa trên 3 signals:
- Acquisition Signal: khả năng thu hút users mới (reach growth, new followers)
- Activation Signal: users thực hiện hành động có giá trị (clicks, profile visits, messages)
- Retention Signal: users quay lại (repeat engagement, saves, shares)

Context: {ctx['name']} có {ctx.get('current_stats', {}).get('registered_contractors', 'N/A')} thợ đăng ký.

Trả về JSON:
{{"traction_score": 0.0-1.0, "acquisition_signal": 0.0-1.0, "activation_signal": 0.0-1.0, "retention_signal": 0.0-1.0, "trend": "up|down|flat", "analysis": "phân tích ngắn", "strongest_signal": "signal mạnh nhất", "weakest_signal": "signal yếu nhất cần cải thiện"}}""",
            input_data=metrics_input,
            skill_code="A5",
            phase="build_test",
        )
        results["traction"] = traction_output if isinstance(traction_output, dict) else {"traction_score": 0, "error": "invalid output"}
    except Exception as e:
        logger.error(f"Traction scoring failed: {e}")
        results["traction"] = {"traction_score": 0, "error": str(e)}

    # Step 3: A7 Pattern Extraction (depends on metrics)
    logger.info("Weekly review: extracting patterns (A7)...")
    try:
        patterns_output = await _run_agent_task(
            agent_name="analytics",
            task=f"""Rút patterns từ data tuần {week_label} cho {ctx['name']}.
So sánh angles, hook styles, timing, content type.

Trả về JSON:
{{"patterns_discovered": [{{"category": "content|timing|angle|audience", "title": "tên pattern", "description": "mô tả", "result": "win|fail|emerging", "confidence": 0.0-1.0, "recommendation": "gợi ý"}}], "top_insight": "insight quan trọng nhất tuần này"}}""",
            input_data=metrics_input,
            skill_code="A7",
            phase="build_test",
        )
        results["patterns"] = patterns_output if isinstance(patterns_output, dict) else {"patterns_discovered": []}

        # Save patterns to DB
        if isinstance(patterns_output, dict) and patterns_output.get("patterns_discovered"):
            async with SessionLocal() as session:
                for pat in patterns_output["patterns_discovered"]:
                    p = Pattern(
                        id=str(uuid.uuid4()),
                        title=pat.get("title", ""),
                        category=pat.get("category", "content"),
                        description=pat.get("description", ""),
                        result=pat.get("result", "emerging"),
                        confidence=pat.get("confidence"),
                        experiment_id=project,
                        business_type=ctx.get("business_type", "marketplace"),
                    )
                    session.add(p)
                await session.commit()
    except Exception as e:
        logger.error(f"Pattern extraction failed: {e}")
        results["patterns"] = {"patterns_discovered": [], "error": str(e)}

    # Step 4: A1 Kill Signal Check (depends on CMF + Traction)
    cmf_score = results.get("cmf", {}).get("cmf_score", 0) or 0
    traction_score = results.get("traction", {}).get("traction_score", 0) or 0

    logger.info("Weekly review: checking kill signals (A1)...")
    try:
        kill_output = await _run_agent_task(
            agent_name="devils_advocate",
            task=f"""Stress test tuần {week_label} cho {ctx['name']}.

Data:
- CMF Score: {cmf_score}
- Traction Score: {traction_score}
- Tuần đã chạy: {len(weeks_sorted)}
- Trend: CMF {results.get('cmf', {}).get('trend', 'N/A')}, Traction {results.get('traction', {}).get('trend', 'N/A')}

Kiểm tra kill signals:
1. CMF < 0.2 liên tục 3 tuần → KILL
2. Traction giảm 3 tuần liên tiếp → WARNING
3. Zero engagement growth 2 tuần → WARNING
4. Content không tạo conversion signal → CAUTION

Trả về JSON:
{{"kill_signals": [], "warnings": [], "verdict": "proceed|caution|more_evidence|kill", "confidence": 0.0-1.0, "critical_weaknesses": [], "recommendation": "gợi ý hành động"}}""",
            input_data={
                "cmf": results.get("cmf", {}),
                "traction": results.get("traction", {}),
                "weeks_active": len(weeks_sorted),
                "by_week_trend": {k: by_week[k] for k in weeks_sorted[-4:]},
            },
            skill_code="A1",
            phase="build_test",
        )
        results["kill_check"] = kill_output if isinstance(kill_output, dict) else {"verdict": "proceed", "error": "invalid output"}
    except Exception as e:
        logger.error(f"Kill signal check failed: {e}")
        results["kill_check"] = {"verdict": "unknown", "error": str(e)}

    # Build scorecard
    scorecard = {
        "week": week_label,
        "project": ctx["name"],
        "content_stats": this_week,
        "cmf_score": cmf_score,
        "cmf_trend": results.get("cmf", {}).get("trend", "flat"),
        "traction_score": traction_score,
        "traction_trend": results.get("traction", {}).get("trend", "flat"),
        "verdict": results.get("kill_check", {}).get("verdict", "unknown"),
        "top_insight": results.get("patterns", {}).get("top_insight", ""),
        "patterns_count": len(results.get("patterns", {}).get("patterns_discovered", [])),
        "warnings": results.get("kill_check", {}).get("warnings", []),
        "kill_signals": results.get("kill_check", {}).get("kill_signals", []),
    }

    # Save weekly metric to DB
    try:
        from src.db.models import WeeklyMetric
        async with SessionLocal() as session:
            metric = WeeklyMetric(
                id=str(uuid.uuid4()),
                experiment_id=project,
                week_number=len(weeks_sorted),
                engagement_quality=results.get("cmf", {}).get("engagement_quality"),
                audience_relevance=results.get("cmf", {}).get("audience_relevance"),
                conversion_signal=results.get("cmf", {}).get("conversion_signal"),
                cmf_score=cmf_score if cmf_score else None,
                acquisition_signal=results.get("traction", {}).get("acquisition_signal"),
                activation_signal=results.get("traction", {}).get("activation_signal"),
                retention_signal=results.get("traction", {}).get("retention_signal"),
                traction_score=traction_score if traction_score else None,
                raw_metrics=metrics_input,
                notes=f"Weekly review {week_label}",
            )
            session.add(metric)
            await session.commit()
    except Exception as e:
        logger.error(f"Failed to save weekly metric: {e}")

    return {
        "status": "success",
        "scorecard": scorecard,
        "details": results,
        "by_week_trend": {k: by_week[k] for k in weeks_sorted},
    }


@router.get("/weekly-scorecard")
async def get_weekly_scorecard() -> dict[str, Any]:
    """Get historical weekly metrics for scorecard display."""
    from src.db.models import WeeklyMetric

    async with SessionLocal() as session:
        result = await session.execute(
            select(WeeklyMetric)
            .where(WeeklyMetric.experiment_id == _project_id())
            .order_by(WeeklyMetric.week_number)
        )
        rows = result.scalars().all()

    return {
        "weeks": [
            {
                "week_number": r.week_number,
                "cmf_score": r.cmf_score,
                "traction_score": r.traction_score,
                "engagement_quality": r.engagement_quality,
                "audience_relevance": r.audience_relevance,
                "conversion_signal": r.conversion_signal,
                "acquisition_signal": r.acquisition_signal,
                "activation_signal": r.activation_signal,
                "retention_signal": r.retention_signal,
                "notes": r.notes,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ],
        "latest": {
            "cmf_score": rows[-1].cmf_score if rows else None,
            "traction_score": rows[-1].traction_score if rows else None,
        } if rows else None,
    }


@router.post("/batch-image")
async def batch_generate_images(week: str = "") -> dict[str, Any]:
    """Generate images for all draft/approved posts without images in a week."""
    if not week:
        today = _now_vn()
        monday = today - timedelta(days=today.weekday())
        week = f"{monday.year}-W{monday.isocalendar()[1]:02d}"

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost)
            .where(ScheduledPost.week_label == week)
            .where(ScheduledPost.image_path.is_(None))
            .where(ScheduledPost.status.in_(["draft", "approved"]))
        )
        posts = result.scalars().all()

    if not posts:
        return {"status": "success", "message": "No posts need images", "generated": 0}

    generated = 0
    failed = 0
    for post in posts:
        try:
            result = await generate_post_image(post.id, ImageRequest())
            if result.get("status") == "success":
                generated += 1
            else:
                failed += 1
        except Exception as e:
            logger.error(f"Batch image failed for {post.id}: {e}")
            failed += 1

    return {"status": "success", "generated": generated, "failed": failed, "total": len(posts)}
