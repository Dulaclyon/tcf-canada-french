# Candidate-recall training additions — received 22 November 2026

17 new exercises cover 18 task slots across three recollections: 8 writing and 9 speaking, with the existing writing question `w2-04` reused for the colocation experience. Its prompt and ID are unchanged. All 178 previous writing/speaking question objects are unchanged; their submissions, bookmarks and progress references remain valid. New totals: 77 writing and 118 speaking exercises.

The screenshot month/day labels do not establish an examination year. The batch receipt date is not an assertion about when the exam occurred. No question is attributed to an official FEI source or presented as exact recalled wording. `source=user-recalled` and `adapted=true` identify reconstructed training. Incomplete topics use `recallCompleteness=theme-only` and a distinct “Topic practice” selector label.

## Coverage

| Recollection | Writing 1 | Writing 2 | Writing 3 | Speaking 1 | Speaking 2 | Speaking 3 |
|---|---|---|---|---|---|---|
| 11.02 Vancouver | Sports victory | Colocation (`w2-04`, reused) | Urban expansion/environment | Weekend plans | Roommate hosting friends | Animals/happiness |
| 11.18 GB | Friend caring for a pet | Nature cleanup | Starting university young/later | Studies/career | Canadian acquaintance’s weekends | Managing stress |
| Undated work/travel screenshot | New job | Study abroad | Helping people in poverty | Daily work duties | Daily life in Canada | Value of tourism |

The urban/environment topic, the university-age topic and animals/happiness were incompletely remembered. The three writing Task 3 document pairs are original training materials, not reconstructed original exam documents. The unidentified first speaking Task 3 topic in the Vancouver screenshot cannot be recreated.

The 11.21 Montreal screenshot describes venue/procedure and general impressions but contains no concrete listening/reading questions. No invented listening clips or reading questions were added from it. Claims about reused audio or answer order were not incorporated into exam guidance.

Writing ranges follow the existing task format: 60–120, 120–150 and 120–180 words. Speaking metadata retains the existing 2-minute Task 1, 2-minute preparation/3-minute-30-second Task 2, and 4-minute-30-second Task 3. FEI reference: https://www.france-education-international.fr/test/tcf-canada (primary-source search extract checked; direct page access was bot-blocked).

`exam-recall-2026-11-22.json` maps all source-task slots to stable question IDs. It stays in docs instead of the served exam dataset so disabled sections do not expose a collection of locked question IDs through the general exam response.

Checks: full project and interface-language checks, the targeted recalled-training validator, submission permissions/isolation/persistence, section permissions, old/new question-object equality, and browser traversal of all 17 new pages. French prompts, two original documents per new writing Task 3, timers, selected-language provenance notes and light sidebar separators were inspected.
