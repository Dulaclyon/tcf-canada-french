# CEFR teaching estimates and progressive practice

Listening and reading questions display a CEFR teaching estimate, or Not yet assessed where source material is insufficient. The six-level filter and Easy → Hard mode work across original practice groups. Original groups and their numbering stay available. The path orders A1, A2, B1, B2, C1, C2, then unassessed questions; within a level it uses the text-complexity score with stable identity tie breaks. A question appears once per path. Saved answers, completion states and 100-character listening notes keep their original set/question keys. Each level path saves its own cursor so reopening resumes at the same question.

The initial labels are deterministic text estimates, not official TCF item classifications, calibrated CEFR measurements or student score predictions. The rubric uses transcript/passage length, answer-choice language, abstract vocabulary, discourse/subordinate structure and inference cues. Question position and the answer key are not classifier inputs. Listening recordings have not been reviewed for speed, accent, clarity or interaction, so an initial label cannot certify full listening difficulty. Missing transcript/audio is left unassessed. Automatic estimates stop at C1: C2 must be explicitly selected by teaching staff after review. Counts may therefore be zero for a level.

Owner, Administrator and Teacher accounts can correct a question's label or restore its automatic estimate. Corrections are stored in the existing database with reviewer and time, survive deployments, and affect subsequent paths. Guests can inspect the review controls but cannot change them; students cannot call the review endpoint. A teacher can also leave a question unassessed.

Build integration: scripts/build-bank-difficulty.mjs writes question-only metadata after local bank copying or production archive unpacking. No raw question archive or audio is rewritten. Metadata contains identities, features and estimates, not answer keys or transcripts.

References consulted:
- Council of Europe: https://www.coe.int/en/web/common-european-framework-reference-languages/listening-comprehension — item difficulty depends on both text and task characteristics.
- Council of Europe CEFR descriptor search: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search
- France Éducation international: https://www.france-education-international.fr/test/tcf-canada — progressive examination difficulty; not a published question-number-to-CEFR lookup.

Validation: scripts/check-question-difficulty.mjs checks estimate independence from question numbering, source sufficiency, complete unique catalogue coverage, level filtering, global ordering, overrides and stable resume. scripts/check-account-roles.mjs covers review endpoint permissions, invalid references/levels, C2/manual unassessed overrides and reset. Browser QA checks original mode, filtering, a cross-set path, saved answers/notes, resume and empty levels.
