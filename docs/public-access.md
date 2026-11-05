# Public learning access — 2026-11-04

The user explicitly changed the requested scope to postpone login and let anyone enter. Current mode is AUTH_PROVIDER=none, also the default when no provider is configured. Hero links directly to app.html#home; the app does not require Google or ChatGPT identity or cookies. Removed the sign-out UI and updated privacy text. No learning data, content IDs or local storage formats were changed.

The prepared Google OAuth client remains in Testing state. A production-wide Google audience change was rejected by automatic review; the user then chose a limited approved audience, then explicitly postponed all login. The production-wide change was cancelled and not executed. Google code/configuration is retained for future work but does not authorize or restrict current public access.

Tests cover anonymous app access, session reporting public/unsigned status, old auth links redirecting into the public app, retained optional provider verification, and the existing content checks. Real anonymous HTTP/browser navigation is checked on deployment before reporting completion.
