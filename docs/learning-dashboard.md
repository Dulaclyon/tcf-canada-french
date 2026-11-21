# Student and teacher learning dashboards

Signing into the learning app opens Overview. Students see five progress cards: French Foundations, Listening, Reading, Writing and Speaking. Teachers see a searchable list of every registered student with the same five metrics, plus links to student management and essay review.

The protected endpoints `/api/learning-progress` and `/api/admin/learning-progress` use one shared calculation. Students can retrieve only their own summary; the teacher endpoint requires administrator access. Responses contain counts and access status, not essay text, speaking notes, answers or passwords.

Metrics:
- Foundations: unique answered exercises divided by the available foundation exercise count. Repeated attempts count once, and this is practice progress rather than a mastery score.
- Listening/Reading: manually completed groups divided by all available groups, including built-in practice. Groups with saved valid answers are shown as in progress.
- Writing: distinct submitted writing questions or drafts explicitly marked complete. Several submissions of the same question count once. Unsaved/unsubmitted drafts remain in progress.
- Speaking: distinct questions with saved practice records. Repeated practice sessions count once toward coverage.

Restricted sections remain visible as locked cards without exposing content totals or progress. Missing bank metadata produces an unavailable state rather than a fabricated zero. Percentages retain one decimal place so small amounts of progress remain visible. The app waits for pending account saves before fetching its dashboard and ignores late responses after the user navigates away.

The dashboard reads existing account records without modifying them. Speaking records created without the older optional checklist are accepted by the existing backup/progress validator.

Validation: `node scripts/check-learning-dashboard.mjs` covers aggregation, duplicate/stale IDs, submitted writing, permissions, student isolation and teacher/student agreement. Browser checks cover sign-in routing, five-section coverage, search, locale switching and mobile sizing.
