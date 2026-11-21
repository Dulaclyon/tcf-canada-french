# OpenAI essay assessment

This integrates the OpenAI Responses API into the teacher’s Essay review page. It does not log into the Codex desktop app or use a ChatGPT/Codex browser session.

## Configure Render

1. Create a project API key at https://platform.openai.com/api-keys.
2. In Render, open the `tcf-canada-french` Web Service → Environment → Add Environment Variable.
3. Set `OPENAI_API_KEY` to the secret key. Keep it out of Git, frontend code, screenshots and chat.
4. Save and deploy. The teacher’s Essay review page enables AI assessment after the new process starts.

Optional variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_REVIEW_MODEL` | `gpt-5.4-mini` | A Responses model supporting strict Structured Outputs |
| `AI_REVIEW_MONTHLY_LIMIT` | `50` | Maximum provider requests started in a UTC calendar month; `0` stops new requests |
| `AI_REVIEW_ENABLED` | enabled when a key exists | Set `false` to stop new assessments |

OpenAI API usage can incur charges. Render’s hosting payment does not pay for the OpenAI API. This application’s request-count limit is not a dollar spending cap or a cap on usage by other applications sharing the key. Use a dedicated project key and review the project’s available billing controls too. Never share an administrator login with an AI service.

## Teacher workflow

Open an essay in Essay review, choose the feedback language, and click AI assessment. The question, supplied source documents and essay are sent to OpenAI. Account email, student ID, teacher comments and other students’ work are not sent as fields. Personal details written inside an essay are not automatically removed. Source documents are included only when the current question matches the stored submission prompt; absent documents are not invented.

The result is a private draft: task fulfilment, organization, language, strengths, priorities, representative corrections, a suggested French revision and a tentative CEFR estimate when evidence is sufficient. It is not an official TCF score. The student cannot retrieve this draft through the student submission endpoint.

Use as feedback draft copies the suggestions into the editable teacher-feedback box. Existing comments are preserved. Review/edit them, then click Publish feedback. Only this existing publication action makes the teacher’s feedback available to the student. There is no automatic publishing or background assessment of all students.

## Reliability and usage

- Saved assessments are reused for the same immutable submission and feedback language. Clicking/opening them again does not call OpenAI.
- A different submission version or feedback language is a separate assessment.
- At most two provider requests run concurrently. Duplicate requests for an assessment already in progress are rejected.
- All started requests, including failures and interrupted requests, count toward the monthly application limit because a failed response can still have incurred provider cost. No automatic retries.
- The provider request times out after 60 seconds and has a 5,000-output-token limit. Input size and returned structured fields are bounded.
- `store:false` is sent to the Responses API. This is not a claim of zero provider retention; the applicable OpenAI account/data policies still apply.
- Failed, refused, incomplete or invalid responses cannot publish feedback or replace the student’s essay. Corrections whose original quote is absent from the essay are discarded.
- API errors are sanitized; keys, prompts and raw provider error bodies are not logged or returned to the browser.
- Results, usage counters and status persist in the existing SQLite data directory. API keys remain environment-only. Interrupted requests are marked failed at restart and require an explicit retry.

## Validation

`npm run test:essay-ai` uses fake provider responses and temporary databases, never real student data or a live API key. It checks request shape, structured parsing, grounded quotes, caching, limits, concurrency, restart behavior, CSRF, administrator-only access, student isolation and manual publication. Browser checks use dummy essays and a mocked provider result to verify draft display, editing and publication. Live model quality and a real provider roundtrip require a working API key and billing/access on the owner’s OpenAI project.

References:
- https://developers.openai.com/api/docs/quickstart
- https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses
- https://developers.openai.com/api/docs/models/gpt-5.4-mini
- https://render.com/docs/configure-environment-variables
