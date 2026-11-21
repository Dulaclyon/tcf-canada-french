# Essay submission and feedback

Students submit from the editor using 提交作文 or the 完成并提交 checkbox. Both actions send the composition to the teacher. Autosaved drafts remain private to that student's progress; the teacher submission list does not read draft storage. Each submitted version is an immutable snapshot containing server-verified question ID, title, task and prompt. Revised submissions create a new version, retaining prior feedback. Identical consecutive submissions are rejected. Students can view their most recent 20 submitted versions per question and refresh feedback. A successful submission marks the current task complete only if the editor has not changed during the request.

Administrators open 作文批改 from student management or the learning header. They can filter submissions by student and pending review, load further pages, read the essay and save/update feedback. Saving marks that specific version reviewed. Students can see only their own submitted text and feedback; they cannot read administrator endpoints or edit feedback.

Records are stored in writing_submissions in the existing persistent students.sqlite database. New submissions require writing permission and a student role. Session, password-change and origin checks apply. Maximum essay text is 20,000 characters; feedback is 12,000. There is no automatic score or email notification. Existing non-empty student essays already marked completed are copied into teacher submissions by a one-time idempotent migration. Unfinished drafts are not submitted. Newly completed drafts from older clients are also submitted server-side on the progress update; subsequent autosaves do not create more versions.

Validation: scripts/check-writing-submissions.mjs checks permissions, CSRF, student isolation, immutable versions, metadata validation, filters, feedback and restart persistence. Disposable-browser preview checked teacher review and the student's resulting feedback display.

## Latest published assessment

Students see one latest published teacher assessment per writing question. `/api/writing/feedback?questionId=…` returns that assessment for the signed-in account only. Submission history retains original essay versions but redacts feedback belonging to earlier publications. A monotonic feedback publication version defines latest publication, rather than the submission date. Re-publishing an older essay supersedes feedback previously published on a newer essay version. Unpublished Codex drafts never replace the student-visible assessment.
