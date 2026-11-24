# In-app notifications

Teachers can send a title (120 characters) and message (2000 characters) to all active students or select accounts by @name/email. Account IDs resolve duplicate names. Notifications are private to recipients, with unread counts and read states. The latest 200 notices are retained in the existing SQLite database.

New essay submissions notify every active teacher/admin with student identity and a direct essay review link. Completing a writing draft through progress sync follows the same path. Draft autosaves and duplicate essay submissions do not generate alerts. Saved speaking practice records notify teachers with their notes; this is a practice record, not an uploaded audio file. Imported historical progress may create notices for records newly saved to the account.

Notifications appear in the website inbox; no email, SMS, push service, or additional paid storage is required. The header checks unread counts every minute while visible and when returning to the tab.

Validation: scripts/check-notifications.mjs covers recipient isolation, active accounts, selected/all delivery, read ownership, persistence, retention, submission linking and duplicate suppression.

Published feedback now creates an assessment-ready notice for the student (or Guest who submitted their own essay). It links to the writing question so the latest published feedback is displayed. Publication and notification are committed together. Draft assessments do not notify students.
