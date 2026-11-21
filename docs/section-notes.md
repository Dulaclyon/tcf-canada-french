# Private TCF section notebooks

Listening, reading, speaking (`oral`) and writing each have one reusable notebook, mounted immediately below the page heading. A collapsed summary keeps the question interface concise. Each note has a 2,000-character textarea limit and live count; the same bound is enforced server-side using the textarea's UTF-16 counting convention.

Notes use four explicit progress keys in the existing SQLite `progress` table. Each value must contain only a string `text`; extra fields and unknown section keys are rejected. Upserts overwrite the previous value, so there is no version history, attachment storage or additional paid service. There are at most four bounded note rows per account.

The existing authenticated progress API scopes notes to the signed-in account. Teacher dashboards and essay submissions do not include them. They are separate from writing drafts and speaking practice records. Notes persist across devices and server restarts. Existing course backup files retain their existing scope; these notebooks are stored separately from that course-state export.

Input is kept in an in-memory draft while a 600ms debounce reduces writes; blur saves immediately. Drafts survive question redraws and same-page section navigation. The shared storage queue reports success/failure to the notebook. Failed saves retain the text and offer Retry. Wait for “Notes saved” before closing the page. Notes are set through textarea.value, never interpreted as HTML.

Verification: server checks for limits, malformed values, replacement, clearing, CSRF, session isolation, second-session and restart persistence; existing auth/project checks; browser checks for all four notebooks, redraws, reloads, a 2,001-character paste, English/Traditional controls and a 390px viewport.
