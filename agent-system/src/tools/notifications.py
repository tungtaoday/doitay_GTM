"""Notification service — Telegram alerts + event logging.

Sends alerts to CEO via Telegram for:
- Kill signals
- Gate approvals needed
- Weekly scorecard
- Experiment milestones
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from src.config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

logger = logging.getLogger(__name__)


async def send_telegram(message: str, parse_mode: str = "Markdown", reply_markup: dict | None = None) -> dict:
    """Send message to Telegram chat. Supports inline keyboard buttons."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram not configured, skipping notification")
        return {"status": "skipped", "reason": "not_configured"}

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload: dict[str, Any] = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": parse_mode,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            return {"status": "sent", "platform": "telegram", "message_id": data.get("result", {}).get("message_id")}
        logger.error(f"Telegram send failed: {resp.text}")
        return {"status": "failed", "error": resp.text}


async def send_post_for_approval(post_id: str, hook: str, body: str, angle: str, date: str, time: str) -> dict:
    """Send a post preview to Telegram with Approve/Reject inline buttons."""
    message = (
        f"📝 *Duyệt bài — {date} {time}*\n"
        f"Angle: _{angle}_\n\n"
        f"*{hook}*\n\n"
        f"{body[:300]}{'...' if len(body) > 300 else ''}\n\n"
        f"Bấm nút bên dưới để duyệt:"
    )

    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "✅ Duyệt", "callback_data": f"approve:{post_id}"},
                {"text": "❌ Từ chối", "callback_data": f"reject:{post_id}"},
            ]
        ]
    }

    return await send_telegram(message, reply_markup=reply_markup)


async def send_batch_for_approval(posts: list[dict]) -> dict:
    """Send all draft posts for the week to Telegram for approval."""
    results = []
    for p in posts:
        r = await send_post_for_approval(
            post_id=p["id"],
            hook=p.get("hook", ""),
            body=p.get("body", ""),
            angle=p.get("angle", ""),
            date=p.get("scheduled_date", ""),
            time=p.get("scheduled_time", "10:00"),
        )
        results.append(r)

    # Also send summary
    summary = f"📋 *{len(posts)} bài chờ duyệt*\nDuyệt từng bài ở trên hoặc bấm nút bên dưới:"
    summary_markup = {
        "inline_keyboard": [
            [{"text": "✅ Duyệt tất cả", "callback_data": "approve_all"}],
        ]
    }
    await send_telegram(summary, reply_markup=summary_markup)

    return {"status": "sent", "count": len(results)}


async def update_telegram_message(message_id: int, new_text: str) -> dict:
    """Edit an existing Telegram message (e.g., after approval)."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return {"status": "skipped"}

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "message_id": message_id,
        "text": new_text,
        "parse_mode": "Markdown",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload)
        if resp.status_code == 200:
            return {"status": "updated"}
        return {"status": "failed", "error": resp.text}


async def notify_ceo(
    alert_type: str,
    title: str,
    body: str,
    experiment_id: str | None = None,
    data: dict[str, Any] | None = None,
) -> dict:
    """Send CEO notification via all configured channels."""
    # Format message
    emoji_map = {
        "kill_signal": "🔴",
        "gate_approval": "🟡",
        "weekly_scorecard": "📊",
        "milestone": "🟢",
        "experiment_complete": "🎯",
        "alert": "⚠️",
    }
    emoji = emoji_map.get(alert_type, "📌")

    message = f"{emoji} *{title}*\n\n{body}"
    if experiment_id:
        message += f"\n\n_Experiment: {experiment_id}_"

    # Send to Telegram
    tg_result = await send_telegram(message)

    # Also log to event system
    from src.db.session import SessionLocal
    from src.db.models import EventLog
    from cuid2 import cuid_wrapper

    cuid = cuid_wrapper()
    async with SessionLocal() as session:
        event = EventLog(
            id=cuid(),
            event_type=f"notification:{alert_type}",
            experiment_id=experiment_id,
            payload={"title": title, "body": body, "data": data},
            processed=True,
        )
        session.add(event)
        await session.commit()

    return {"telegram": tg_result, "logged": True}


async def send_weekly_scorecard(scorecard: dict) -> dict:
    """Format and send weekly CEO scorecard."""
    lines = ["📊 *WEEKLY SCORECARD*\n"]

    # Portfolio health
    if "experiments" in scorecard:
        lines.append("*PORTFOLIO HEALTH:*")
        for exp in scorecard["experiments"]:
            trend = exp.get("trend", "→")
            lines.append(
                f"  {exp['name']} — {exp['phase']} — "
                f"CMF: {exp.get('cmf_score', 'N/A')} — "
                f"Traction: {exp.get('traction_score', 'N/A')} {trend}"
            )

    # Alerts
    if scorecard.get("alerts"):
        lines.append("\n*ALERTS (CEO attention needed):*")
        for alert in scorecard["alerts"]:
            lines.append(f"  ⚠️ {alert}")

    # Hypothesis backlog
    if "backlog" in scorecard:
        bl = scorecard["backlog"]
        lines.append(
            f"\n*HYPOTHESIS BACKLOG:* "
            f"Tier1: {bl.get('tier1', 0)} / "
            f"Tier2: {bl.get('tier2', 0)} / "
            f"Tier3: {bl.get('tier3', 0)}"
        )

    # Patterns
    if scorecard.get("new_patterns"):
        lines.append(f"\n*NEW PATTERNS:* {len(scorecard['new_patterns'])} learned this week")

    # No action
    if scorecard.get("no_action"):
        lines.append(f"\n_No action required: {', '.join(scorecard['no_action'])}_")

    message = "\n".join(lines)
    return await notify_ceo("weekly_scorecard", "Weekly Scorecard", message)


async def send_kill_signal_alert(
    experiment_id: str,
    cmf_score: float,
    traction_score: float,
    week: int,
    reason: str,
) -> dict:
    """Send kill signal alert to CEO."""
    body = (
        f"*Experiment:* {experiment_id}\n"
        f"*Week:* {week}\n"
        f"*CMF Score:* {cmf_score}\n"
        f"*Traction Score:* {traction_score}\n"
        f"*Reason:* {reason}\n\n"
        f"Action required: GO/NO-GO decision needed."
    )
    return await notify_ceo(
        "kill_signal",
        "KILL SIGNAL DETECTED",
        body,
        experiment_id=experiment_id,
    )
