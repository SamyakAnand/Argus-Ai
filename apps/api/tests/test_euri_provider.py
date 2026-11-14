import json

import httpx

from nexus_api.gateway import EuriGateway


def test_only_euri_configuration_can_enable_generation(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "ignored")
    monkeypatch.setenv("OPENAI_API_KEY", "ignored")
    monkeypatch.setenv("NVIDIA_API_KEY", "ignored")
    monkeypatch.setenv("EURI_API_KEY", "euri-test-secret")

    config = EuriGateway().get_active_provider()

    assert config == {
        "enabled": True,
        "provider": "euri",
        "model": "gpt-5.4-mini",
        "base_url": "https://api.euri.ai/v1",
    }


def test_euri_completion_uses_bearer_header_and_fixed_endpoint(monkeypatch):
    gateway = EuriGateway()
    gateway.api_key = "euri-test-secret"
    requests = []

    def respond(request):
        requests.append(request)
        return httpx.Response(200, json={
            "choices": [{"message": {"content": "A grounded response."}}],
            "usage": {"total_tokens": 42},
        })

    real_client = httpx.Client
    monkeypatch.setattr(
        "nexus_api.gateway.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs),
    )

    result = gateway.generate_chat_completion([{"role": "user", "content": "Question"}])

    assert result == ("A grounded response.", 42, None, "gpt-5.4-mini")
    assert str(requests[0].url) == "https://api.euri.ai/v1/chat/completions"
    assert requests[0].headers["Authorization"] == "Bearer euri-test-secret"
    payload = json.loads(requests[0].content)
    assert payload["max_completion_tokens"] == 1500
    assert "max_tokens" not in payload


def test_other_provider_keys_do_not_enable_generation(monkeypatch):
    monkeypatch.delenv("EURI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "ignored")
    monkeypatch.setenv("OPENAI_API_KEY", "ignored")

    config = EuriGateway().get_active_provider()

    assert config["enabled"] is False
    assert config["provider"] == "euri"
    assert "api_key" not in config
