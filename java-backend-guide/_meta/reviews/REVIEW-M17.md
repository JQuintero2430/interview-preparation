# REVIEW-M17

- Route: fresh read-only subagent (general-purpose, model sonnet), launched by S20261101-1328-claudecode; it received only `modules/17-spring-transactions.md`, `_meta/modules/M17.md`, `_meta/QUALITY-BAR.md`, `STYLE-GUIDE.md` and `labs/spring-transactions/src/` (RUN.md §4). The writing contexts of module 17 ran on claude-opus-5-5.
- Date: 2026-11-01. Module state: CLOSEd by CLOSE-M17 (same session, main context), 22,722 prose words (cap 23,000, SYLLABUS §9 decision 12).
- H1/H2 (Maven) are not run by the reviewer; the main session's CLOSE-M17 run: full `verify` with Docker → exit 0 (spring-transactions 31 suites, 177 tests, skipped 0).
- **Verdict: CHANGES_REQUIRED** (5 MAJOR). Findings → FIX-M17-01 to FIX-M17-06 in TASKS.md.

## Items

| Item | Result | Evidence |
|---|---|---|
| A1 | PASS | header order per §2.1; Applies-to = VERSIONS.md (HikariCP gap: finding 8) |
| A2 | PASS | both prerequisites "whole module" |
| A3 | PASS | 4 sections, 5 questions, Summary |
| A4 | PASS | 19 Contents links = 20 H2 − 1 |
| A5 | PASS | NIT: §5 uses REQUIRED before §6 defines it |
| A6 | PASS | `grep -c 'TASK:'` → 0 |
| B1 | PASS | 7 subsections × 14 |
| B2 | PASS | each problem opens with a concrete failure |
| B3 | PASS | 6 mermaid (§2, 3, 5, 6, 7, 11), each with "What to notice"; NIT: no diagram for §10 deadlock, §13 starvation |
| B4 | PASS | a "why" per section |
| B5 | PASS | NIT: test excerpts at :1055, :1152 without approach |
| B6 | FAIL | finding 4 |
| B7 | FAIL | findings 3, 5 |
| B8 | PASS | 4 callouts (§2, 3, 9, 12) |
| B9 | PASS | 6 Version notes; no Java 27 |
| B10 | PASS | 8 Production scenario callouts |
| B11 | PASS | load behaviour or reason per section |
| B12 | PASS | defaults tagged; deployment in §7, §13 |
| B13 | PASS | 9 Security items |
| B14 | PASS | NIT: SQLSTATE (:48), Objenesis (:418), dirty checking (:966) undefined at first use |
| B15 | PASS | delegated topics linked |
| C1 | PASS | Lab 109, Src 140, Doc 74, Unverified 0; 22 claims sampled (weak ones: finding 9) |
| C2 | PASS | 9/9 Output IDs tested; 9 answers diffed against assertions |
| C3 | PASS | 15 "in the lab" hits, every test and method exists |
| C4 | FAIL | finding 6 |
| C5 | PASS | HikariCP row gap: finding 8 |
| C6 | PASS | 0 Unverified |
| C7 | FAIL | findings 1, 2 (49 java blocks: 20 Complete equal, 4 Complete differ, 21 Excerpt ok, 11 unmarked: 9 Output, 2 Bug hunt) |
| C8 | PASS | 74 URLs in SOURCES.md |
| C9 | PASS | 44 ledger IDs; 6 rows read; architect-md-01-12 partly answered (finding 10) |
| C10 | PASS | one sleep is the behaviour under test; invariants and permitted sets elsewhere |
| C11 | PASS | numbers tagged or worded as lab observations |
| C12 | n/a | no JMM claims |
| D1 | PASS | 32 × 5 |
| D2 | FAIL | finding 7 |
| D3 | PASS | 7 tags, max 28% |
| D4 | PASS | section order |
| D5 | PASS | no duplicates |
| D6 | PASS | every Q17 ID linked; Drills lines |
| D7 | PASS | anchors above headings |
| D8 | PASS | no flags |
| D9 | PASS | weak point: finding 9 |
| E1 | PASS | all labels × 4 |
| E2 | PASS | 12 criteria ↔ tests |
| E3 | PASS | repair → pool → concurrency → integration |
| E4 | PASS | no `@Autowired`, ≤ 4 params, no method over 20 lines |
| E5 | n/a | |
| F1 | PASS | 3 paragraphs, nothing new |
| F2 | PASS | 6 prompts |
| F3 | PASS | 8 flashcards |
| F4 | PASS | 4 groups with reasons |
| G1 | PASS | 22,722 ≤ 23,000; NIT: M17.md line 5 still says 22,000 |
| G2 | PASS | 16 checklist rows mapped |
| H1, H2 | main session | see above |
| H3 | PASS | all links resolve |
| H4 | PASS | no flags |
| H5 | PASS | Testcontainers files ⊆ docker-tagged |
| H6 | PASS | caveat: declared file list not given to the reviewer |

## Findings

1. MAJOR · C7 · :2576-2598, :2650-2657, :2714-2724, :2784-2793 · the four exercises' starting-code blocks carry `<sub>Source:` (Complete) but are not equal to their files (no package/imports; Ex17.2–17.4 are method bodies) → make each an Excerpt (`// Excerpt of labs/…/broken/….java` first line, drop `<sub>Source:`), or paste the whole file. → FIX-M17-01
2. MINOR · C7 · :1795-1810 (Q17.07), :2539-2546 (Q17.32) unmarked under Bug hunt (allowed only under Output) → add `// Excerpt of …` (outputs/Q17_07.java, s14/TicketOffice.java); :2444-2464 (Q17.29) joins two classes with an editorial `// in Invoices, another bean` comment not in the lab file → mark the omission or split the block. → FIX-M17-01
3. MAJOR · B7 · :397 "Once true: until Spring Framework 5.3. Now: …" lacks a status marker or basis tag and the cut-over (6.0) → "[Changed in Spring Framework 6.0: …]" with a Doc/Src tag. → FIX-M17-02
4. MAJOR · B6 · :1084 "Set `timeout` as a backstop …" has no "because" → add it (it bounds only statements, §8). → FIX-M17-02
5. MINOR · B7 · :154, 284, 526, 645, 1091, 1092, 1190, 1191, 1303, 1305 · traps without why the myth exists → one clause each. → FIX-M17-02
6. MAJOR · C4 · :1208 (first mention), :1290, :1296, :2349 · `DeadlockLoserDataAccessException`, `CannotSerializeTransactionException` deprecated since 6.0.3 without the §4.2 marker; :1210 `RetryTemplate`/`@Retryable` lack `[Added in Spring Framework 7.0]` → add markers at first mention, verified in the tagged sources. → FIX-M17-03
7. MAJOR · D2 · :1876 (Q17.09), :1908 (Q17.10), :2024 (Q17.14), :2172 (Q17.19), :2400 (Q17.27) · Output short answers lack the 1–2 reasoning sentences → append one each. → FIX-M17-04
8. MINOR · C5/A1 · :6, :805-806, :1480 · HikariCP 7.0.2 cited but absent from VERSIONS.md and the header → add the VERSIONS.md row (Boot-managed version) and the header entry, or tag the first citation "managed by Spring Boot 4.1.2". → FIX-M17-05
9. MINOR · C1/D9 · :1519 rolling restart rolls back in-flight transactions has no basis tag; :1482 "blocks vacuum" only covered by the monitoring-stats citation; :2522 Q17.31 evidence "access logs" with no concrete query → add Doc tags and a concrete duplicate-finding query. → FIX-M17-05
10. MINOR · C9 · :2509-2530 · architect-md-01-12 ("why is 'just disable retries' wrong?") only partly answered → add a Q17.31 follow-up. → FIX-M17-06
11. NIT · C9 · :1658 (Q17.03), :1997 (Q17.14) lack `<!-- ledger: -->` lines (architect-md-01-07 is homed at Q17.03) → add them. → FIX-M17-06 (with the NITs of A5, B14, G1 where they cost no prose)
