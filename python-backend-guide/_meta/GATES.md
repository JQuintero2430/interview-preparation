# GATES

Gates that block specific tasks (RUN.md §4.1).

## Condition gates (opened by sessions when verified)

- [x] **G0: Java syllabus exists.** Verified on 2026-11-02 by session S20261102-1138-antigravity. `../java-backend-guide/SYLLABUS.md` exists and lists 55 modules. Open.
- [ ] **T-uv: Toolchain uv installed.** Blocks P5 and all lab verification tasks (`uv run ...`). Install command for Jorge: `brew install uv` (or `curl -LsSf https://astral.sh/uv/install.sh | sh`).
- [ ] **T-docker: Docker / Colima running.** Optional condition gate. Tests needing Docker carry the `@pytest.mark.docker` marker. Run command for Jorge: `colima start`.

## Jorge's gates (only Jorge ticks)

- [ ] **G1: Syllabus and pilot approved.** The pilot is Module 14 (`fastapi-dependency-injection-and-execution`). After M14 is CLOSEd and REVIEWed (and FIX tasks done), no other `PLAN-Mxx` task may start until G1 is ticked.
