import django
from django.conf import settings


def test_django_smoke() -> None:
    """Smoke test asserting Django configuration loads."""
    assert settings.SECRET_KEY is not None
    assert django.get_version() is not None
