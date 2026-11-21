# Foundation practice audit — 21 November 2026

The lesson UI previously assembled practice from every grammar course linked to a lesson source file. Eight grammar sets were linked to multiple lessons, causing 90 repeated question placements across the visible units. Units 6 and 7 both pulled the quantity-expression set.

Each grammar set now has an explicit `practiceUnit`. The shared practice catalogue gives every question one visible unit, including pronunciation questions merged into Units 1 and 11. Legacy grammar links and the practice filter lead to those visible units. Source links used for teaching text remain unchanged.

69 new contextual questions fill the affected units: modal verbs (10), articles (10), reflexive verbs/quantities/negation (9), past participles in sentences (10), numbers/fractions/percentages (10), compound relative pronouns (10), and future-in-the-past/polite requests (10). New explanations have English and Traditional Chinese translations.

All 556 previous questions and IDs are unchanged. Together with the additions, there are 625 questions, each appearing in exactly one of 26 visible units. Every unit has at least 22 questions. Saved answers, bookmarks and progress retain their existing IDs; the progress denominator includes the 69 additions.

Validation: full project checks, complete exercise translation coverage, cross-unit normalized prompt uniqueness, actual UI selection against shared-source links, browser traversal of all practice questions, and old/new question-object comparison. French near-duplicate comparison also found no cross-unit prompts at or above 88% token similarity after removing instruction annotations. Similar grammar structures remain intentionally practiced through distinct contexts.
