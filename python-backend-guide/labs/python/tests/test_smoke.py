import sys


def test_python_smoke() -> None:
    """Smoke test asserting Python version and basic execution."""
    assert sys.version_info >= (3, 13), f"Expected Python >= 3.13, got {sys.version_info}"
