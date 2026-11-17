# Essay submission and feedback

Students explicitly submit text from the writing editor using 提交作文. Autosaved drafts remain private to that student's progress; the teacher submission list does not read draft storage. Each submitted version is an immutable snapshot containing server-verified question ID, title, task and prompt. Revised submissions create a new version, retaining prior feedback. Identical consecutive submissions are rejected. Students can view their most recent 20 submitted versions per question and refresh feedback. A successful submission marks the current task complete only if the editor has not changed during the request.

Administrators open 作文批改 from student management or the learning header. They can filter submissions by student and pending review, load further pages, read the essay and save/update feedback. Saving marks that specific version reviewed. Students can see only their own submitted text and feedback; they cannot read administrator endpoints or edit feedback.

Records are stored in writing_submissions in the existing persistent students.sqlite database. New submissions require writing permission and a student role. Session, password-change and origin checks apply. Maximum essay text is 20,000 characters; feedback is 12,000. There is no automatic score or email notification. Existing saved drafts are not submitted automatically.

Validation: scripts/check-writing-submissions.mjs checks permissions, CSRF, student isolation, immutable versions, metadata validation, filters, feedback and restart persistence. Disposable-browser preview checked teacher review and the student's resulting feedback display.
