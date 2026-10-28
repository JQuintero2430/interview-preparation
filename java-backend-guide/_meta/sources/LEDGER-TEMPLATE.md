# Ledger template

Copy this file to `_meta/sources/<src-slug>.md` (slug from [INVENTORY](INVENTORY.md)) when the first `EXTRACT-<src>-<nn>` task of a source runs; change the title and keep the table. One row per distinct question or topic of the chunk, per RUN.md §10.2. Questions are written in the guide's own words, never copied (PDFs are third-party material).

# Ledger: `<src-slug>` (`<source file name>`)

Chunks done: none. Last updated: never.

| ID | Question (normalized) | Location | Dedup key | duplicate-of | Target | Status | Notes |
|---|---|---|---|---|---|---|---|

Column rules:
- **ID:** `<chunk-id>-<nn>`, for example `architect-md-01-07`. A task rewrites only the rows whose ID starts with its chunk ID.
- **Question (normalized):** the question or topic in your own words. A page with no interview content (cover, index, advertisement, out-of-scope desktop GUI) gets one row saying "no interview content (<reason>)".
- **Location:** the source file and page (PDF) or section and line (Markdown).
- **Dedup key:** a short lowercase phrase naming the underlying question (for example `transactional-self-invocation`). Search every ledger for it (`grep -ri "<key>" java-backend-guide/_meta/sources/`) before adding a row.
- **duplicate-of:** the ID of the existing row in any ledger when it is the same underlying question; otherwise empty.
- **Target:** module number and slug, and section or question if known (provisional until SYLLABUS-REVISE), for example `17 spring-transactions § propagation`.
- **Status:** `mapped` (has a target) or `written` (answered in a CLOSEd module; set by CLOSE tasks); a row may also be `no interview content`.
- **Notes:** errors spotted in the source, uncertainty, cross-references.
