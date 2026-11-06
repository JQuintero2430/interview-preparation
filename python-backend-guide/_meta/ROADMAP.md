# ROADMAP

Module execution order and milestone phases for the Python Backend Interview Guide (RUN.md §2).

## Phase 0: Bootstrap & Foundations
- Bootstrap steps P1–P9 (planning, syllabus, style guide, toolchain scaffolding, state).
- Toolchain verification (`T-uv` installation).

## Phase 1: Pilot Module (FastAPI DI & Execution)
- **Pilot:** `14-fastapi-dependency-injection-and-execution`
  - Deep-dive into FastAPI dependency injection (`Depends`), yield fixtures, dependency caching.
  - Sync vs async route handlers, threadpool offload vs event loop execution.
  - Spring Boot IoC comparisons and where the analogy breaks.
  - Review and close.
- **Milestone Gate G1:** Jorge approves SYLLABUS, STYLE-GUIDE, QUALITY-BAR, and pilot Module 14.

## Phase 2: Python Language Foundations & Concurrency (Parts A & B)
1. `01-python-data-model-and-dunders`
2. `02-python-memory-and-gc`
3. `03-python-classes-mro-and-descriptors`
4. `04-python-functions-closures-decorators`
5. `05-python-generators-and-iterators`
6. `06-python-typing-and-dataclasses`
7. `07-python-exceptions-and-context-managers`
8. `08-python-stdlib-functools-itertools-logging`
9. `09-python-concurrency-gil-threads-processes`
10. `10-asyncio-event-loop-and-tasks`
11. `11-asyncio-advanced-taskgroups-and-patterns`

## Phase 3: FastAPI Ecosystem & SQLAlchemy (Parts C & D)
12. `12-fastapi-foundations-and-starlette`
13. `13-pydantic-validation-and-settings`
15. `15-fastapi-routing-middleware-and-lifespan`
16. `16-fastapi-security-auth-and-openapi`
17. `17-fastapi-testing-and-project-structure`
18. `18-sqlalchemy-core-and-async-engine`
19. `19-sqlalchemy-orm-and-unit-of-work`
20. `20-sqlalchemy-relationships-and-loading-strategies`
21. `21-alembic-migrations-and-sqlmodel`

## Phase 4: Django Framework & DRF (Parts E & F)
22. `22-django-architecture-and-request-lifecycle`
23. `23-django-models-and-queryset-laziness`
24. `24-django-orm-n-plus-one-and-prefetching`
25. `25-django-orm-aggregations-f-q-expressions`
26. `26-django-transactions-and-concurrency`
27. `27-django-migrations-and-schema-management`
28. `28-django-database-connections-and-pooling`
29. `29-django-middleware-and-signals`
30. `30-django-auth-permissions-and-admin`
31. `31-django-async-views-and-async-orm`
32. `32-drf-serializers-and-validation`
33. `33-drf-viewsets-routers-and-negotiation`
34. `34-drf-auth-permissions-and-throttling`
35. `35-django-channels-and-websockets`

## Phase 5: Distributed Systems, Messaging & Protocols (Parts G, H, I)
36. `36-python-redis-and-caching-patterns`
37. `37-python-mongodb-and-motor`
38. `38-python-cassandra-driver`
39. `39-celery-architecture-and-task-queues`
40. `40-celery-retries-idempotency-and-beat`
41. `41-python-lightweight-workers-rq-dramatiq`
42. `42-python-kafka-clients-and-concurrency`
43. `43-python-grpc-services`
44. `44-python-graphql-strawberry-and-graphene`

## Phase 6: Testing & Production Operations (Parts J & K)
45. `45-pytest-fundamentals-and-fixtures`
46. `46-python-mocking-and-test-doubles`
47. `47-django-and-fastapi-integration-testing`
48. `48-python-wsgi-asgi-servers-gunicorn-uvicorn`
49. `49-python-docker-and-production-containers`
50. `50-python-observability-logging-and-opentelemetry`
51. `51-python-profiling-cprofile-py-spy-and-tuning`
52. `52-django-vs-fastapi-vs-flask-architectural-tradeoffs`
53. `53-python-backend-system-design-and-production-incidents`

## Phase 7: Finish Line (RUN.md §13)
- Cross-module consistency review.
- `QUESTION-INDEX.md`, `GLOSSARY.md`, `CHEATSHEET.md`, `MOCK-INTERVIEWS.md`, `README.md`.
- Final `VERSIONS.md` refresh and repo-root link.
