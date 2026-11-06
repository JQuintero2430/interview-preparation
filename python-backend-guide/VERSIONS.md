# VERSIONS

The versions this guide is written against. Checked on 2026-11-02 by session S20261102-1138-antigravity.

Rule: a later session that finds a newer version adds a new dated row. It never silently changes a version used by existing content.

Method: Package metadata was fetched from the PyPI JSON API (`https://pypi.org/pypi/<pkg>/json`). CPython lifecycle dates were retrieved from the Python Developer's Guide (`https://devguide.python.org/versions/`). Django release dates and support windows were retrieved from the official Django download table (`https://www.djangoproject.com/download/`).

Chosen Python version for labs: **Python 3.13** (specifically `3.13.x`).
- **Why:** Python 3.13 is the newest CPython officially supported by every pinned lab dependency. Dependencies such as `celery` 5.6.3, `gunicorn` 26.2.0, and `factory-boy` 3.3.3 list classifiers up to Python 3.13 and have not published 3.14 classifiers. On the lower bound, modern backend dependencies (`starlette` 1.10.0, `pydantic-settings` 2.16.2, `sqlalchemy` 2.1.6, `aiokafka` 0.15.0, `django-stubs` 6.1.2) mandate `requires_python: >=3.11`. Python 3.10 is past end-of-life (October 2026).
- **Binding dependency constraint:** `celery` 5.6.3 / `gunicorn` 26.2.0 (upper bound 3.13) and `starlette` 1.10.0 / `sqlalchemy` 2.1.6 / `django-stubs` 6.1.2 (lower bound 3.11).

---

## Status vocabulary

### Python / CPython (PEP statuses)
- **Feature (Mainstream):** In active feature development (e.g. main branch).
- **Bugfix:** Actively receiving bug and security fixes for the first 1-2 years after GA.
- **Security:** Receiving security fixes only until End of Life (EOL) (5 years total lifespan).
- **Provisional (PEP 411):** An API or feature included with deliberate latitude to adjust before stabilizing.
- **Experimental (e.g. PEP 703 Free-threaded CPython):** Early-stage feature explicitly opted into at build/runtime (`--disable-gil`, `python3.13t`); ABI and internal structures may change.
- **Deprecated / PendingDeprecation:** Emits `DeprecationWarning` or `PendingDeprecationWarning` when used; slated for removal in 2 subsequent minor versions.
- **Removed:** Removed from the runtime and standard library (e.g., `asyncore`, `asynchat` removed in 3.12).

### Django
- **Feature Release:** Supported for 8 months of mainstream bug fixes, followed by 8 months of security fixes (16 months total). Current: 6.1.x.
- **LTS (Long-Term Support):** Released every two years (every .2 release). Supported for 3 years of bug and security fixes. Current: 5.2 LTS (supported until April 2028).
- **Deprecation timeline:** Features deprecated in version N.0, warnings become errors or features removed in N.2.
- **Async status:** Async view handlers and Async QuerySet interfaces (`aget`, `afirst`, `acount`, `async for`) are stable. Database transactions (`transaction.atomic`) and model saves with certain relations remain synchronous and require `sync_to_async`.

### FastAPI / Starlette / Pydantic
- **FastAPI / Starlette:** Follows Semantic Versioning. Releases track Starlette minor bumps. Starlette 1.10.0 is the ASGI foundation.
- **Pydantic:** Pydantic v2.x architecture (core written in Rust via `pydantic-core`). Pydantic v1 is legacy/deprecated and accessed via `pydantic.v1` compatibility namespace. Settings management is factored into `pydantic-settings`.

### SQLAlchemy
- **SQLAlchemy 2.x:** The 2.0+ unified API (`select()`, `session.execute()`) with native async support (`AsyncSession`, `create_async_engine`). The legacy 1.x `Query` interface is deprecated/removed in 2.x.

### OpenTelemetry
- **Signal lifecycle:** Development, Stable, Deprecated, Removed. Traces and Metrics are Stable; Logs are Stable.

---

## CPython lifecycle table

| Branch | Status | First Release | End of Life | Notes | Source |
|---|---|---|---|---|---|
| 3.15 | bugfix | 2026-10-09 | 2031-10 | Feature complete, active bugfix | https://devguide.python.org/versions/ |
| 3.14 | bugfix | 2025-10-07 | 2030-10 | Active bugfix | https://devguide.python.org/versions/ |
| **3.13** | **security** | **2024-10-07** | **2029-10** | **Chosen lab version.** Introduces free-threaded build (`python3.13t`, PEP 703) | https://devguide.python.org/versions/ |
| 3.12 | security | 2023-10-02 | 2028-10 | Security fixes only | https://devguide.python.org/versions/ |
| 3.11 | security | 2022-10-24 | 2027-10 | Security fixes only | https://devguide.python.org/versions/ |
| 3.10 | end-of-life | 2021-10-04 | 2026-10 | EOL reached October 2026 | https://devguide.python.org/versions/ |

---

## Django release table

| Series | Status | Latest Release | End of Mainstream Support | End of Extended Support | Source |
|---|---|---|---|---|---|
| **6.1** | **Current Feature** | 6.1.2 | April 2027 | December 2027 | https://www.djangoproject.com/download/ |
| 6.0 | Previous Feature | 6.0.9 | August 2026 | April 2027 | https://www.djangoproject.com/download/ |
| **5.2 LTS** | **Current LTS** | 5.2.18 | December 3, 2025 | April 2028 | https://www.djangoproject.com/download/ |
| 5.1 | End of life | 5.1.8 | April 2025 | December 2025 | https://www.djangoproject.com/download/ |
| 4.2 LTS | End of life | 4.2.19 | August 2024 | April 2026 | https://www.djangoproject.com/download/ |

---

## Ecosystem packages table

Checked against PyPI JSON API on 2026-11-02.

| Package | Latest Stable | Requires Python | Python Classifiers | Release Date | Status & Role in Guide | Source |
|---|---|---|---|---|---|---|
| `fastapi` | 0.162.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-10-23 | Core framework; modern ASGI API development | https://pypi.org/pypi/fastapi/json |
| `starlette` | 1.10.0 | `>=3.11` | 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-24 | Core ASGI toolkit underlying FastAPI | https://pypi.org/pypi/starlette/json |
| `pydantic` | 2.14.2 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-29 | Core data validation and schema definition (v2 Rust core) | https://pypi.org/pypi/pydantic/json |
| `pydantic-settings` | 2.16.2 | `>=3.11` | 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-28 | Environment variables and settings management | https://pypi.org/pypi/pydantic-settings/json |
| `django` | 6.1.2 | `>=3.12` | 3.12, 3.13, 3.14 | 2026-10-20 | Core framework; full-stack backend, ORM, admin | https://pypi.org/pypi/django/json |
| `djangorestframework` | 3.18.3 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-06 | Core REST API toolkit for Django | https://pypi.org/pypi/djangorestframework/json |
| `channels` | 4.3.2 | `>=3.9` | 3.9, 3.10, 3.11, 3.12, 3.13, 3.14 | 2025-11-20 | WebSocket and ASGI support for Django | https://pypi.org/pypi/channels/json |
| `sqlalchemy` | 2.1.6 | `>=3.11` | 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-21 | Core ORM and SQL toolkit for FastAPI and standalone services | https://pypi.org/pypi/sqlalchemy/json |
| `alembic` | 1.20.1 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-22 | Database schema migrations for SQLAlchemy | https://pypi.org/pypi/alembic/json |
| `sqlmodel` | 0.0.48 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-10-06 | Unified Pydantic + SQLAlchemy model layer (Tiangolo) | https://pypi.org/pypi/sqlmodel/json |
| `uvicorn` | 0.54.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-09-25 | Standard ASGI web server implementation | https://pypi.org/pypi/uvicorn/json |
| `gunicorn` | 26.2.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13 | 2026-08-24 | Production WSGI server and ASGI process manager | https://pypi.org/pypi/gunicorn/json |
| `celery` | 5.6.3 | `>=3.9` | 3.9, 3.10, 3.11, 3.12, 3.13 | 2026-03-26 | Distributed task queue for Python | https://pypi.org/pypi/celery/json |
| `rq` | 3.0.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-28 | Redis Queue lightweight task worker | https://pypi.org/pypi/rq/json |
| `dramatiq` | 2.2.1 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-09-02 | Alternative fast background task processing library | https://pypi.org/pypi/dramatiq/json |
| `psycopg` | 3.3.6 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-09-18 | Modern PostgreSQL adapter for Python (sync and async) | https://pypi.org/pypi/psycopg/json |
| `redis` | 8.1.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-07-30 | Official Redis client (includes `redis.asyncio`) | https://pypi.org/pypi/redis/json |
| `pymongo` | 4.19.0 | `>=3.11` | 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-14 | Official MongoDB driver (sync and async) | https://pypi.org/pypi/pymongo/json |
| `motor` | 3.7.1 | `>=3.9` | 3.9, 3.10, 3.11, 3.12, 3.13 | 2025-05-14 | Official non-blocking MongoDB driver for asyncio | https://pypi.org/pypi/motor/json |
| `cassandra-driver` | 3.30.1 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-07-06 | Official DataStax Cassandra Python driver | https://pypi.org/pypi/cassandra-driver/json |
| `confluent-kafka` | 2.16.1 | `>=3.8` | (wheels provided) | 2026-10-28 | High-performance C-wrapper (`librdkafka`) client for Kafka | https://pypi.org/pypi/confluent-kafka/json |
| `aiokafka` | 0.15.0 | `>=3.11` | 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-28 | Actively maintained pure-Python asyncio client for Kafka | https://pypi.org/pypi/aiokafka/json |
| `kafka-python` | 3.0.12 | `>=3.8` | 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-10-26 | Pure-Python client for Kafka | https://pypi.org/pypi/kafka-python/json |
| `grpcio` | 1.85.1 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-30 | gRPC Python runtime | https://pypi.org/pypi/grpcio/json |
| `strawberry-graphql` | 0.339.1 | `>=3.11, <4.0` | (typed code-first) | 2026-10-31 | Modern code-first GraphQL library for Python | https://pypi.org/pypi/strawberry-graphql/json |
| `graphene` | 3.4.3 | None | 3.8, 3.9, 3.10, 3.11, 3.12, 3.13 | 2024-11-09 | Traditional schema-first GraphQL library | https://pypi.org/pypi/graphene/json |
| `pytest` | 9.2.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-27 | Primary test runner and framework | https://pypi.org/pypi/pytest/json |
| `pytest-django` | 4.14.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-08-10 | Django test integration plugin for pytest | https://pypi.org/pypi/pytest-django/json |
| `pytest-asyncio` | 1.4.1.post1 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-11-01 | Asyncio test support plugin for pytest | https://pypi.org/pypi/pytest-asyncio/json |
| `anyio` | 4.16.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-11-01 | Structured concurrency backend used by Starlette/FastAPI | https://pypi.org/pypi/anyio/json |
| `httpx` | 0.28.1 | `>=3.8` | 3.8, 3.9, 3.10, 3.11, 3.12 | 2024-12-06 | Async & sync HTTP client for FastAPI integration tests | https://pypi.org/pypi/httpx/json |
| `factory-boy` | 3.3.3 | `>=3.8` | 3.8, 3.9, 3.10, 3.11, 3.12, 3.13 | 2025-02-03 | Test fixtures and object factory library | https://pypi.org/pypi/factory-boy/json |
| `testcontainers` | 4.15.0 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-07-24 | Integration testing with real Docker containers | https://pypi.org/pypi/testcontainers/json |
| `django-stubs` | 6.1.2 | `>=3.11` | 3.11, 3.12, 3.13, 3.14 | 2026-10-05 | Mypy typing plugin and stubs for Django ORM | https://pypi.org/pypi/django-stubs/json |
| `mypy` | 2.4.1 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-28 | Static type checker with plugin ecosystem (django-stubs) | https://pypi.org/pypi/mypy/json |
| `pyright` | 1.1.414 | `>=3.7` | 3.7, 3.8, 3.9, 3.10, 3.11, 3.12 | 2026-09-10 | Fast type checker from Microsoft | https://pypi.org/pypi/pyright/json |
| `ruff` | 0.17.3 | `>=3.7` | 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-27 | Fast Python linter and formatter written in Rust | https://pypi.org/pypi/ruff/json |
| `opentelemetry-sdk` | 1.45.2 | `>=3.10` | 3.10, 3.11, 3.12, 3.13, 3.14 | 2026-10-29 | OpenTelemetry tracing and observability SDK | https://pypi.org/pypi/opentelemetry-sdk/json |
| `py-spy` | 0.4.2 | None | (wheels provided) | 2026-04-24 | Sampling profiler for Python programs | https://pypi.org/pypi/py-spy/json |
| `uv` | 0.13.6 | `>=3.8` | 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15 | 2026-10-27 | Extremely fast Python package and project manager | https://pypi.org/pypi/uv/json |
