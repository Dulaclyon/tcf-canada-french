# Account roles

The original administrator becomes the Owner on first deployment of role support, preserving identity, password, sessions and submissions. The configured ADMIN_EMAIL selects that existing administrator when available. The Owner cannot be downgraded, disabled or reset through staff account routes. No additional bootstrap administrator is created on restart.

The Owner has full course, progress, assessment, notification and account access. Administrators manage students and assessments. Teachers view student progress and submissions, assess and publish feedback, and send notices; they cannot manage accounts or pair/revoke the shared Mac connector.

Guests have all normal student learning features: all courses and TCF sections, audio playback, exercise correctness feedback, their own notes, progress, speaking records and essay submissions. In addition, they can inspect student management, submissions, assessment drafts, student progress reports, notification history, and account roles. The management interface displays its usual controls disabled. Server-side authorization independently rejects management mutations, including attempts to run Codex, publish comments, change permissions, reset another account or elevate their own role. A Guest cannot delete or change another person's records.

The Owner creates Guest, Teacher or Administrator accounts at /roles.html, linked from student management and the learning header. Temporary passwords are shown once and must be changed at first login. Disabling or changing a staff/Guest role revokes existing sessions immediately. No production Guest account is created automatically.

Publishing feedback atomically creates a private assessment-ready notification for the submitting student/Guest, with a link to the writing question's latest published assessment. Drafting and AI generation do not send this notification. Republishing creates a new notification; older feedback remains hidden from student access.

Validation: scripts/check-account-roles.mjs and existing authentication, submission, notification, registration and student-name regressions use isolated test databases. Browser checks verify a Guest's own correct-answer feedback and disabled management controls, plus enabled Owner controls.


Owner can switch an existing non-owner account between Student, Guest, Teacher and Administrator in Accounts and roles. Identity, password, submissions and progress remain unchanged; sessions are revoked immediately. New student conversions start with Foundations only unless prior student section permissions exist. Student management controls section access. Existing student grants survive role changes. The 100-student and 50-staff/guest limits apply to conversions.
