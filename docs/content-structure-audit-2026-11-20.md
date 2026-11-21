# Course content structure audit — 20 November 2026

## Verdict

The screenshot exposed a content-parsing defect, not merely unattractive styling. The generic PDF soft-wrap and glossary heuristics joined independent pronunciation groups, interpreted sound examples as pronoun/glossary mappings, and merged rows in pronoun charts. Restricting text width and adding cards could not repair those semantics.

## Steps and evidence

1. **Pronunciation — failed before; repaired.** Captured lesson-03 locally with a dummy administrator and compared it with the supplied screenshot. A narrow nested card combined examples from [ɛ], [i] and [wa] inside one misleading table. Pronunciation now uses explicit structured sound data. Every sound has a spelling heading, a short rule and individual French-word/meaning rows. Elision and liaison appear in a separate subsection. Synthetic sound controls are suppressed when an original human recording is present, including after switching topics. Original source editions and recordings remain stored unchanged.
2. **Other grammar topics — failed in several shared patterns; repaired.** Inspected all 26 displayed units, 129 topic views and 271 tables before changes. Direct/indirect object-pronoun charts had merged the first and second persons. They now have three distinct rows. Irregular participles now have 23 independent verb/form/meaning rows. Imparfait endings and named conjugations take priority over the generic glossary parser. Sentence rewrites are displayed as transformations. Indefinite/definite noun forms and their meaning have separate columns. Dictionary entries use one selected-language meaning column.
3. **Layout and language — repaired in checked views.** Content groups and tables share one container width; nested reference cards were flattened into sections with headings and dividers. Single lexical mappings use definition rows rather than repeated one-row table headers. Sound words use a two-column desktop grid and a single-column mobile layout. All 129 English topic views were rescanned: no visible Chinese remained. English, Simplified and Traditional switching preserves the French example words. Desktop and 390px mobile pronunciation screens were captured and inspected; the mobile page fits without horizontal overflow.
4. **Learning and access flows — healthy in regression checks.** Listening/reading random review still works, with no page errors. The new pronunciation module respects Basics permission. Source PDF hashes, stored source records, answer keys and learning-record structures remain intact.

## Evidence files

Accepted screenshots are saved in `qa-local/structure-review-2026-11-20/`: before.png, after-en.png, after-tw.png, mobile.png and pronouns.png. The before and after screenshots use the same local application, account type and desktop width. Machine-readable topic/table inventories are in `/tmp/tcf-structure-before.json` and `/tmp/tcf-structure-after.json`. Table count fell from 271 to 200 by removing false pronunciation tables and repeated single-row containers, not by deleting questions or source files.

## Validation and limits

Passed the source/content suite, the new content-structure regressions, course-language checks, section-permission tests and isolated browser flows. Pronunciation data and new glosses use the complete-phrase translation catalogue. The catalogue now contains 4,095 entries.

This is a review of course presentation and the observed parser defects, not independent teacher certification or a complete screen-reader audit. DOM structure was inspected across every topic; screenshots were inspected for the affected pronunciation, pronoun and responsive patterns. Production student accounts were not used, and their data was not changed. The in-app browser RPC was unavailable, so authorized Playwright checks used a fresh headless Chrome instance against the local dummy database.
