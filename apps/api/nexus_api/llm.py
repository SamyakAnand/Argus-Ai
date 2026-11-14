"""ARGUS generation helpers backed exclusively by EURI."""

from __future__ import annotations

import json
from typing import Any

from .gateway import gateway


def get_configured_provider() -> dict[str, Any]:
    return gateway.get_active_provider()


def call_llm(
    messages: list[dict[str, str]], json_mode: bool = False
) -> tuple[str | None, int, float | None]:
    content, tokens, cost, _ = gateway.generate_chat_completion(messages, json_mode=json_mode)
    return content, tokens, cost


def synthesize_with_llm(
    question: str,
    findings: list[dict[str, Any]],
    profile: dict[str, Any],
    stats_summary: dict[str, Any],
) -> tuple[str | None, int, float | None]:
    system = (
        "You are ARGUS, an evidence-grounded data analyst. Summarize only the verified findings and "
        "calculated metrics supplied below. Never invent values. State important caveats plainly."
    )
    user = json.dumps({
        "question": question,
        "verified_findings": [item.get("detail", "") for item in findings],
        "dataset_profile": {
            "row_count": profile.get("row_count"),
            "column_count": profile.get("column_count"),
        },
        "calculated_metrics": stats_summary,
    }, ensure_ascii=False)
    content, tokens, cost = call_llm([
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ])
    return content.strip() if content else None, tokens, cost
