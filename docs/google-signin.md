# Direct Google sign-in

Implemented 2026-11-04 for the explicit request to use Google instead of ChatGPT.

## Configuration

Google Cloud project: TCF Canada French Login (`prime-framing-513803-s7`). The owner confirmed using the current Google account as support/developer contact and explicitly confirmed Google's API User Data Policy and creation of the Web OAuth client.

Authorized origin: `https://tcf-canada-french-dulaclyon.dulaclyon07.chatgpt.site`.
Authorized redirect: `https://tcf-canada-french-dulaclyon.dulaclyon07.chatgpt.site/auth/google/callback`.

Client ID: `90019349064-a3aaj1cu3pdo6qerfv8avudrulb00ntv.apps.googleusercontent.com` (public identifier). No Google client secret is needed by this GIS ID-token flow or embedded in code. A separate random session-signing secret is configured as a secret in the Sites runtime.

Runtime: `AUTH_PROVIDER=google`, `GOOGLE_CLIENT_ID`, `GOOGLE_SESSION_SECRET`. The provider switch is applied on deployment. Public Site access remains public; the application itself checks its Google session server-side. ChatGPT identity headers do not authenticate a user when Google mode is active.

## Behavior

- Hero login goes to `/auth/google`, then the official Google Identity Services button.
- Google returns a POST to `/auth/google/callback`.
- Verify Google's RS256 signature using jose and Google's rotating JWKS, plus issuer, audience, expiry, issued-at and nonce.
- Compare GIS CSRF cookie and form token; bind the ID token to a short-lived random nonce cookie.
- On success, issue a signed 30-day session in a Secure/HttpOnly/SameSite=Lax `__Host-` cookie. Google ID tokens and signing keys are not stored in localStorage or logs.
- `POST /auth/logout` requires the same Origin and clears the session cookie.
- Browser Cookie deletion ends the session; local learning data is unchanged. Google login does not implement cloud sync or isolate pre-existing local learning records by account.
- `/privacy` describes the actual data handling and includes the support email the owner approved.

## Checks

`node scripts/check-google-auth.mjs` uses locally generated RSA keys to exercise real signature verification, rejection of wrong audience/issuer/expiry/nonce/tampering/unsigned tokens, CSRF failure, secure session creation, cookie tampering, logout origin protection, unavailable configuration and provider isolation. Tests do not contact Google or impersonate a production sign-in.

`node scripts/check.mjs`, `node scripts/check-auth.mjs`, and `node scripts/build-hosted.mjs` also pass. jose6.2.15 and esbuild0.28.2 are locked by pnpm; esbuild lifecycle scripts are disabled and its standard platform package is used. CI installs from the frozen lockfile before checks.

## Official references

Accessed 2026-11-04:
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- https://developers.google.com/identity/gsi/web/reference/html-reference

Production audience status and a first real account sign-in must be confirmed on the Google Console and deployed website before reporting end-to-end completion.

## Current disposition

The user subsequently chose to postpone login completely and allow anyone to enter. This integration is prepared but NOT activated. AUTH_PROVIDER=none is the production mode and default. Google Console remains Testing; no production-wide audience expansion was executed. Before enabling Google in future, add only owner-approved accounts and enforce that allowlist server-side as well as in Google configuration. Do not activate the current optional Google adapter for general users without that additional authorization policy.
