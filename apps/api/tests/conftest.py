import pytest

from nexus_api.gateway import gateway


@pytest.fixture(autouse=True)
def keep_tests_off_live_euri(monkeypatch):
    monkeypatch.setattr(gateway, "api_key", "")
