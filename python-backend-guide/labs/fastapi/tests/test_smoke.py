import fastapi


def test_fastapi_smoke() -> None:
    """Smoke test asserting FastAPI loads."""
    assert fastapi.__version__ is not None
