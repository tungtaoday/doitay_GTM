from __future__ import annotations

AGENT_CONTRACTS: dict[str, dict] = {
    "research": {
        "input_schema": {
            "type": "object",
            "required": ["vertical", "geography", "business_type"],
            "properties": {
                "vertical": {"type": "string"},
                "geography": {"type": "string"},
                "business_type": {
                    "type": "string",
                    "enum": ["digital", "service", "physical", "marketplace", "hybrid"],
                },
            },
        },
        "output_schema": {
            "type": "object",
            "required": ["signals", "audience_intel", "segments"],
            "properties": {
                "signals": {"type": "array"},
                "audience_intel": {
                    "type": "object",
                    "required": ["pain_phrases", "watering_holes"],
                },
                "segments": {"type": "array", "minItems": 1},
            },
        },
        "kpis": {
            "signal_quality": "% signals passing stress test",
            "audience_intel_depth": "# unique pain phrases per run",
            "segment_accuracy": "% segments surviving validation",
        },
    },
    "strategy": {
        "input_schema": {
            "type": "object",
            "required": ["signals", "segments"],
        },
        "output_schema": {
            "type": "object",
            "required": ["thesis", "cvp", "content_pillars", "experiment_plan"],
        },
        "kpis": {
            "thesis_survival": "% theses surviving 8-week experiment",
            "cvp_clarity": "CEO approval rate on first submission",
            "experiment_hit_rate": "% experiments achieving success_metric",
        },
    },
    "content": {
        "input_schema": {
            "type": "object",
            "required": ["pillars", "audience_intel"],
        },
        "output_schema": {
            "type": "object",
            "required": ["items"],
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["platform", "content_type", "body"],
                    },
                },
            },
        },
        "kpis": {
            "cmf_contribution": "Average CMF Score of content produced",
            "audience_language_usage": "% content using exact audience pain phrases",
            "approval_rate": "% content approved by CEO without edits",
        },
    },
    "distribution": {
        "input_schema": {
            "type": "object",
            "required": ["content"],
        },
        "output_schema": {
            "type": "object",
            "required": ["posted_ids", "engagement_actions"],
        },
        "kpis": {
            "post_success_rate": "% content posted without errors",
            "engagement_reply_rate": "% engagements that get replies",
            "schedule_adherence": "% posts published within window",
        },
    },
    "analytics": {
        "input_schema": {
            "type": "object",
            "required": ["experiment_id"],
        },
        "output_schema": {
            "type": "object",
            "required": ["cmf_score", "traction_score"],
            "properties": {
                "cmf_score": {"type": "number", "minimum": 0, "maximum": 1},
                "traction_score": {"type": "number", "minimum": 0, "maximum": 1},
            },
        },
        "kpis": {
            "score_accuracy": "Correlation predicted vs actual outcomes",
            "kill_signal_precision": "% kill signals CEO agreed with",
            "pattern_extraction_rate": "# patterns extracted per experiment",
        },
    },
    "devils_advocate": {
        "input_schema": {
            "type": "object",
            "required": ["data"],
        },
        "output_schema": {
            "type": "object",
            "required": ["critical_weaknesses", "unvalidated_assumptions", "verdict"],
            "properties": {
                "verdict": {
                    "type": "string",
                    "enum": ["proceed", "caution", "more_evidence", "kill"],
                },
            },
        },
        "kpis": {
            "weakness_hit_rate": "% weaknesses that materialized",
            "false_alarm_rate": "% kill recommendations CEO overrode",
        },
    },
    "product": {
        "input_schema": {
            "type": "object",
            "required": ["cvp"],
        },
        "output_schema": {
            "type": "object",
            "required": ["mvp_spec"],
        },
        "kpis": {
            "mvp_speed": "Days from spec to testable prototype",
        },
    },
    "insight_engine": {
        "input_schema": {
            "type": "object",
            "required": ["pain_phrases"],
            "properties": {
                "pain_phrases": {"type": "array", "minItems": 3},
                "signals": {"type": "array"},
                "audience_intel": {"type": "object"},
                "product_context": {"type": "object"},
            },
        },
        "output_schema": {
            "type": "object",
            "required": ["decision_map", "personas"],
            "properties": {
                "pipeline_status": {"type": "string", "enum": ["complete", "partial"]},
                "personas": {"type": "array", "minItems": 1},
                "decision_map": {
                    "type": "object",
                    "required": ["buy_triggers", "objections", "deal_breakers"],
                    "properties": {
                        "buy_triggers": {"type": "array"},
                        "objections": {"type": "array"},
                        "price_sensitivity": {"type": "array"},
                        "trust_drivers": {"type": "array"},
                        "deal_breakers": {"type": "array"},
                        "switch_triggers": {"type": "array"},
                    },
                },
                "validation_summary": {"type": "object"},
                "top_growth_actions": {"type": "array"},
                "hypothesis_enrichments": {"type": "array"},
            },
        },
        "kpis": {
            "insight_verification_rate": "% synthetic insights verified by real data",
            "decision_trigger_actionability": "% triggers converted to content/product actions",
            "persona_contradiction_depth": "Avg # contradictions per persona (target >= 1)",
            "hypothesis_enrichment_rate": "% hypotheses enriched with decision triggers",
        },
    },
    "social_poster": {
        "input_schema": {
            "type": "object",
            "required": ["content", "targets"],
            "properties": {
                "content": {
                    "type": "object",
                    "required": ["id", "body"],
                    "properties": {
                        "id": {"type": "string"},
                        "body": {"type": "string"},
                        "images": {"type": "array", "items": {"type": "string"}},
                        "content_type": {
                            "type": "string",
                            "enum": ["educational", "promotional", "entertainment", "community"],
                        },
                    },
                },
                "targets": {
                    "type": "object",
                    "properties": {
                        "facebook_groups": {"type": "array"},
                        "zalo_personal": {"type": "object"},
                        "zalo_groups": {"type": "array"},
                    },
                },
            },
        },
        "output_schema": {
            "type": "object",
            "required": ["session_summary", "facebook_groups_posted", "zalo_posted"],
            "properties": {
                "session_summary": {
                    "type": "object",
                    "required": ["content_id", "total_targets", "successful", "failed"],
                },
                "facebook_groups_posted": {"type": "array"},
                "zalo_posted": {"type": "object"},
            },
        },
        "kpis": {
            "post_success_rate": "% posts thành công / tổng targets",
            "content_variation_score": "% posts có unique adaptation",
            "anti_spam_compliance": "% sessions không trigger CAPTCHA/block",
            "group_engagement_rate": "% posts nhận interactions trong 24h",
        },
    },
}
