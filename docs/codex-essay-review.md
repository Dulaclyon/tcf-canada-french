# Essay review with your Codex subscription

The teacher page now uses a Mac connector instead of the paid OpenAI API. No copying essays, downloading batches, or importing feedback is required.

## Start

1. Sign into Codex on your Mac using **ChatGPT**, not an API key.
2. Double-click `Start Codex Reviews.command` in the project folder.
3. The launcher opens the teacher Essay review page. Sign into the teacher account if necessary, then click **Connect this Mac**. Pairing is needed once, or again after disconnection/replacement.
4. Keep the connector window open and your Mac awake and online.
5. Open a submitted essay and click **Assess with Codex**. The private draft appears automatically with three parts: Estimated level, Suggested corrections and Suggested revision. “Use as feedback draft” includes all three parts, including the revised essay. Review/edit it and use the existing **Publish feedback** action.

To ask Codex to rewrite feedback, optionally enter **Rewrite instructions** and click **Rewrite with Codex**. The current text in Teacher feedback, the previous assessment and your instruction are sent with the original essay. Completed assessments are retained; a rewrite creates a new private version. Repeated clicks while it is queued reuse that request. Click **Replace feedback draft** to put the new three-part result in the editable box, then **Publish feedback** when ready. Published student feedback is unchanged until that explicit publication.

Control+C in the connector window stops it. Launch it again to resume. **Disconnect Mac** on the teacher page revokes its pairing credential. Pairing another Mac replaces the previous one.

The launcher finds Node on PATH or the Codex desktop bundled runtime. It defaults to the bundled Codex CLI in `/Applications/ChatGPT.app`. `CODEX_REVIEW_BINARY` can point to another installed CLI. `CODEX_REVIEW_SITE` defaults to the production Render origin; only HTTPS or local HTTP is accepted. There is no inbound local server, tunnel, or browser cross-origin request to localhost.

## Billing and privacy

The launcher checks `codex login status` and refuses API-key authentication. The spawned assessment process receives an allowlist of standard system variables; `OPENAI_API_KEY`, `CODEX_API_KEY`, website pairing credentials and teacher passwords are not passed. It uses existing ChatGPT-managed Codex login; subscription usage limits still apply. It does not purchase credits, switch to API billing, or fall back to the API. The legacy paid API request endpoint is disabled (HTTP 410), including for cached older teacher pages. Previously saved API drafts can still be read.

Only the selected question, associated source documents and essay are sent through the paired Mac to OpenAI. A teacher-requested rewrite also sends the current feedback, previous assessment and rewrite instructions. Account email and student IDs are not assessment fields. Personal information inside an essay remains part of the text. Codex receives a temporary empty working directory, ephemeral session mode, read-only sandbox, disabled shell/web search, ignored user configuration and a strict output schema. Temporary assessment files are removed after completion. Codex itself manages login and any platform-level retention.

The teacher must explicitly authorize pairing. The website stores only a SHA-256 hash of a random 256-bit pairing credential. The local credential stays in the ignored `.codex-review-connector` directory with owner-only permissions. Do not share it. Worker endpoints permit claiming queued work, reporting liveness and returning results; they cannot publish feedback, manage users or browse the student database.

## Reliability

The website keeps persistent queued requests. Only one assessment runs at a time; at most ten requests wait/run. Duplicate clicks reuse the same pending or completed review for that submission and language. Requests expire after ten minutes; interrupted work is marked failed and requires explicit retry. The worker has an eight-minute assessment timeout. Delivery retries reuse an existing result without re-running Codex. No automatic model retries or automatic student publication.

Saved API assessments and saved Codex assessments are separate. Original essays and existing teacher feedback are preserved.

## Verification

`npm run test:codex-review` checks hashed pairing, revocation, admin restrictions, student isolation, offline handling, source-document matching, queue leases, expiry, stale result rejection, output validation and manual publication. Browser tests cover pairing, automatic draft refresh, feedback editing, localization and mobile sizing using dummy submissions. A separate dummy essay can verify the installed ChatGPT-authenticated CLI end to end without any live student data.

Reference: https://learn.chatgpt.com/docs/non-interactive-mode
