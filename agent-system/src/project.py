"""Project context loader — reads project.yaml once, used everywhere."""
from __future__ import annotations

import yaml
from pathlib import Path
from functools import lru_cache

PROJECT_FILE = Path(__file__).parent.parent / "project.yaml"


@lru_cache(maxsize=1)
def load_project() -> dict:
    """Load project context from project.yaml."""
    with open(PROJECT_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_project_context() -> dict:
    """Get key project identifiers for dynamic query building."""
    p = load_project()
    trades = [t.split("(")[0].strip() for t in p.get("primary_audience", {}).get("trades", [])]
    competitors = [c.split("(")[0].strip() for c in p.get("competitors", [])]
    return {
        "name": p.get("name", ""),
        "tagline": p.get("tagline", ""),
        "description": p.get("description", ""),
        "geography": p.get("geography", ""),
        "website": p.get("website", ""),
        "vertical": p.get("primary_audience", {}).get("who", ""),
        "trades": trades,
        "competitors": competitors,
        "pain_points": p.get("primary_audience", {}).get("pain_points", []),
        "desires": p.get("primary_audience", {}).get("desires", []),
        "secondary_audience": p.get("secondary_audience", {}).get("who", ""),
        "secondary_pain_points": p.get("secondary_audience", {}).get("pain_points", []),
        "angles": [a["name"] for a in p.get("content_angles", [])],
        "angle_details": p.get("content_angles", []),
        "tone": p.get("tone", ""),
        "default_cta": p.get("default_cta", ""),
        "competitive_advantage": p.get("competitive_advantage", ""),
    }


def build_search_queries(scan_type: str, custom_queries: list[str] | None = None) -> list[str]:
    """Build search queries dynamically from project.yaml context.

    scan_type: 'social_listening' | 'trends' | 'competitors' | 'audience_supply' | 'audience_demand'
    custom_queries: if provided, used INSTEAD of auto-generated queries
    """
    if custom_queries:
        return custom_queries

    ctx = get_project_context()
    geo = ctx["geography"]
    trades_sample = ctx["trades"][:3]  # top 3 trades

    if scan_type == "social_listening":
        queries = []
        for trade in trades_sample:
            queries.append(f"{trade} {geo} than phiền")
        # Add generic pain-based queries
        for pain in ctx["pain_points"][:2]:
            clean = pain.strip('"').split("—")[0].strip()[:50]
            queries.append(f"{clean} {geo}")
        return queries[:5]

    elif scan_type == "trends":
        return [
            f"xu hướng {ctx['vertical']} {geo} 2025 2026",
            f"{trades_sample[0] if trades_sample else 'thợ'} mùa hè {geo} nhu cầu",
            f"nhu cầu tìm {ctx['vertical'].lower()} online",
        ]

    elif scan_type == "competitors":
        queries = [
            f"ứng dụng tìm {ctx['vertical'].lower()}",
            f"app đặt {trades_sample[0].lower() if trades_sample else 'thợ'} online",
            f"sàn kết nối {ctx['vertical'].lower()} quảng cáo",
        ]
        # Add known competitor names
        comp_names = " ".join(c.split("(")[0].strip() for c in ctx["competitors"][:4])
        if comp_names:
            queries.append(comp_names)
        queries.append(f"Facebook ads {ctx['vertical'].lower()} dịch vụ nhà")
        return queries[:5]

    elif scan_type == "audience_supply":
        queries = []
        for trade in trades_sample:
            queries.append(f"{trade} {geo} tìm việc khó khăn")
        queries.append(f"{trades_sample[0] if trades_sample else 'thợ'} freelance thu nhập 2025")
        queries.append(f"nhóm Facebook {ctx['vertical'].lower()} chia sẻ kinh nghiệm")
        return queries[:4]

    elif scan_type == "audience_demand":
        return [
            f"tìm {ctx['vertical'].lower()} uy tín {geo} ở đâu",
            f"khách hàng phàn nàn {ctx['vertical'].lower()} lừa đảo",
            f"cách chọn {ctx['vertical'].lower()} tốt",
            f"review dịch vụ {ctx['vertical'].lower()} {geo}",
        ]

    return []


def get_content_prompt_context() -> str:
    """Build a content generation context string from project.yaml."""
    p = load_project()

    angles = "\n".join(
        f"  - {a['name']}: {a['description']}" for a in p.get("content_angles", [])
    )
    pains = "\n".join(f"  - {x}" for x in p["primary_audience"]["pain_points"])
    avoid = "\n".join(f"  - {x}" for x in p.get("avoid", []))

    return f"""**Dự án:** {p['name']} — {p['tagline']}
**Mô tả:** {p['description']}
**Địa bàn:** {p['geography']}

**Đối tượng chính:** {p['primary_audience']['who']}
**Nỗi đau của thợ:**
{pains}

**3 Content Angles:**
{angles}

**Tone:** {p['tone']}

**TRÁNH:**
{avoid}

**CTA mặc định:** {p['default_cta']}
**Website:** {p['cta_link']}
**Số liệu thực:** {p['current_stats']['registered_contractors']}+ thợ, {p['current_stats']['appointments_created']}+ lượt đặt, {p['current_stats']['completed_projects']}+ dự án hoàn thành"""
