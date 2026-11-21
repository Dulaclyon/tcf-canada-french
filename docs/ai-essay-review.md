# Essay assessment

The teacher page uses the [Codex subscription Mac connector](codex-essay-review.md). It does not require an OpenAI API key or separate API credit purchases.

The earlier paid OpenAI API request route is disabled (HTTP 410), including for older cached teacher pages. Existing API assessment drafts remain stored separately and the teacher can still retrieve them through the protected legacy read endpoint. Original essays and published feedback are preserved.

Follow the Mac connector guide to start, pair, assess and publish feedback. Remove any unused `OPENAI_API_KEY` from Render if you no longer need it elsewhere; no active website assessment route uses it.
