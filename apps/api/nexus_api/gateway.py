"""Single EURI chat-completions client. Credentials stay server-side."""

from __future__ import annotations

import logging
import os
import time
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

logger = logging.getLogger("argus.euri")
EURI_BASE_URL = "https://api.euri.ai/v1"
EURI_MODEL = "gpt-5.4-mini"


class EuriGateway:
    def __init__(self) -> None:
        self.reload_config()

    def reload_config(self) -> None:
        self.api_key = os.getenv("EURI_API_KEY", "").strip()
        self.timeout = float(os.getenv("MODEL_TIMEOUT_SECONDS", "25"))
        self.max_retries = max(0, int(os.getenv("MODEL_MAX_RETRIES", "2")))

    def get_active_provider(self) -> dict[str, Any]:
        return {
            "enabled": bool(self.api_key),
            "provider": "euri",
            "model": EURI_MODEL,
            "base_url": EURI_BASE_URL,
        }

    def generate_chat_completion(
        self,
        messages: list[dict[str, str]],
        json_mode: bool = False,
        temperature: float = 0.2,
        max_tokens: int = 1500,
    ) -> tuple[str | None, int, float | None, str]:
        if not self.api_key:
            return None, 0, None, EURI_MODEL

        body: dict[str, Any] = {
            "model": EURI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_completion_tokens": max_tokens,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(
                        f"{EURI_BASE_URL}/chat/completions",
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json=body,
                    )
                    response.raise_for_status()
                    data = response.json()
                choice = data["choices"][0]
                content = choice.get("message", {}).get("content")
                usage = data.get("usage", {})
                return content, int(usage.get("total_tokens", 0)), usage.get("cost_usd"), EURI_MODEL
            except Exception as exc:
                response = getattr(exc, "response", None)
                logger.warning(
                    "EURI request attempt %d failed (%s, status=%s)",
                    attempt + 1,
                    type(exc).__name__,
                    getattr(response, "status_code", None),
                )
                if attempt < self.max_retries:
                    time.sleep(attempt + 1)

        return None, 0, None, EURI_MODEL


gateway = EuriGateway()
