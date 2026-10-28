# GATES

Decisions only Jorge can make. Each is a checkbox only Jorge ticks; sessions never tick them. When a box is ticked, the next session records it in STATE and LOG and the tasks it blocked become eligible (RUN.md §3 step 4).

## G1: Syllabus and pilot approved

- [ ] **G1 ticked**

Blocks: every `PLAN-Mxx` except `PLAN-M17` (RUN.md §4). EXTRACT, VERIFY, FIX and HOUSE tasks continue while G1 is open. Slugs become permanent at G1.

What to review:
- [SYLLABUS §1](../SYLLABUS.md#1-module-list): the 55 modules, their kinds, Q/Ex ceilings, prose caps, labs and prerequisites.
- [SYLLABUS §8](../SYLLABUS.md#8-size-projection): the size projection (1,444 Q, 182 Ex, 913,000 words at the ceilings; about 18 to 134 sessions depending on the row used).
- [SYLLABUS §10](../SYLLABUS.md#10-open-questions-for-g1): the open questions (module merges to cut cost, pilot choice, core cap 18,000 vs 15,000 words, whether the full Honeywell/Optum text exists elsewhere).
- The pilot module `modules/17-spring-transactions.md`, once `CLOSE-M17` and `REVIEW-M17` (and its FIX tasks) are done, against [QUALITY-BAR](QUALITY-BAR.md) and the Angular pilot it must match.

## G2: Source deletion and cross-guide link rewrite approved

- [ ] **G2 ticked**

Blocks: every `DELETE-<src>` task (and, by order, Phase D). Tick it only while no other guide session is running, because DELETE rewrites references in other guides (the "⇢" links in `angular-fullstack-guide/SYLLABUS.md`, the link in `react-full-stack-interview-guide/27-interview-execution.md`, the root `README.md`) and removes files at the repository root. Review first: [SOURCE-MAP](sources/SOURCE-MAP.md) and the ledgers, to confirm that every question of each source has a home.

## T1: Docker available (toolchain gate)

- [ ] **T1 ticked** (tick after `docker info` works)

T1 is informational, not a blocking gate in the RUN.md §4 sense: `needs: docker` tasks are decided by each session's own Docker probe. If the probe exits 0 while T1 is unticked, the session runs those tasks and its end message tells Jorge T1 can be ticked.

State on 2026-10-25: Docker Desktop was removed (`/usr/local/bin/docker` is a dangling symlink to the missing `/Applications/Docker.app`); Colima is installed (`/opt/homebrew/bin/colima`) but stopped. Nothing was installed or started by the job (RUN.md §10.1).

Fix options (either one):
- `brew install docker && colima start` (Docker CLI from Homebrew, daemon from Colima; the dangling `/usr/local/bin/docker` symlink may need removing so the Homebrew CLI is found first), or
- reinstall Docker Desktop.

Check: `perl -e 'alarm 20; exec @ARGV' docker info` exits 0.

Unblocks: `HOUSE-01` (re-run the two Docker smoke tests), `VERIFY-06` (Docker version), the docker-tagged tests of every lab (Testcontainers PostgreSQL and later Redis, Kafka, MongoDB, Cassandra), the `needs: docker` tasks, and the finish-line full build with Docker (RUN.md §13).
