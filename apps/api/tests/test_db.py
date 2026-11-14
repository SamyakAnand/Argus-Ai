import pytest

from nexus_api import db, main


def test_configured_database_engine_failure_does_not_switch_to_sqlite(monkeypatch):
    attempted_urls = []

    def fail_configured_database(url, **kwargs):
        attempted_urls.append(url)
        raise RuntimeError("configured database unavailable")

    monkeypatch.setattr(db, "DATABASE_URL", "postgresql+psycopg://db.example/argus")
    monkeypatch.setattr(db, "create_engine", fail_configured_database)

    with pytest.raises(RuntimeError, match="configured database unavailable"):
        db._get_engine()

    assert attempted_urls == ["postgresql+psycopg://db.example/argus"]


def test_configured_database_schema_failure_does_not_switch_to_sqlite(monkeypatch):
    configured_engine = object()
    attempted_engines = []

    def fail_schema_creation(*, bind):
        attempted_engines.append(bind)
        raise RuntimeError("configured database schema unavailable")

    monkeypatch.setattr(db, "engine", configured_engine)
    monkeypatch.setattr(db.Base.metadata, "create_all", fail_schema_creation)
    monkeypatch.setattr(
        db,
        "create_engine",
        lambda url, **kwargs: pytest.fail(f"unexpected fallback engine: {url}"),
    )

    with pytest.raises(RuntimeError, match="configured database schema unavailable"):
        db.init_db()

    assert attempted_engines == [configured_engine]


def test_application_restore_propagates_database_initialization_failure(monkeypatch):
    def fail_database_initialization():
        raise RuntimeError("database initialization failed")

    monkeypatch.setattr(main, "init_db", fail_database_initialization)

    with pytest.raises(RuntimeError, match="database initialization failed"):
        main._restore()
