# Student accounts

Implemented in the project; not yet deployed to a public server. GitHub Pages is not an authentication host. Do not publish this build as a static-only site.

## Local preview

Requires Node 24. Run `npm run build`, then `node scripts/start-student-local.mjs`. Open http://127.0.0.1:4174/ . Administrator credentials are generated once in `.student-data/admin-first-login.json` (private, ignored by Git). No production password is in source. Change that password through the login page. The file contains the original password only; after changing it, the database is authoritative.

The full bank requires `python3 scripts/unpack-bank.py` after building (or `TCF_BANK_LOCAL=1 npm run build` when the local imported bank is available).

The hero links to student login. Administrators see “管理学生” in the learning header, or can visit `/admin.html`. Add an email, then share its generated temporary password through your chosen channel. Passwords appear once; resetting creates a new one. Students must change temporary passwords. Disable/reset invalidates existing sessions. Accounts are limited to 100 students. Email is the username; no Google account authorization is involved. No automatic email delivery.

## Hosting

`render.yaml` prepares one Node web service with a persistent disk. Use a paid disk-capable service, not ephemeral/free storage. Set PUBLIC_ORIGIN to the exact HTTPS origin (no trailing slash), ADMIN_EMAIL, and a random ADMIN_PASSWORD of at least 12 characters. Bootstrap environment variables create the administrator only on an empty database. Do not store them in Git. Set HOST=0.0.0.0 behind the host's HTTPS proxy. HTTPS PUBLIC_ORIGIN enables Secure cookies. The SQLite database, password hashes, sessions, rate limits and individual progress live in DATA_DIR, outside the served dist directory.

Build: `npm run build && python3 scripts/unpack-bank.py`. Start: `npm start`. Do not use the old Sites Worker or a plain static file server. Database backups must use SQLite's backup API or a stopped service; encrypt backups and test restoration. SQLite needs a single service instance with its attached persistent disk. Protect the hosting/admin account with MFA. Admin recovery requires server/database access; there is no public reset-by-email flow.

Before announcing private access: deploy the server, test HTTPS login and all audio, then disable GitHub Pages and address the public repository's learning assets (including bank-pack and history). This server protects its own files, but cannot revoke previously public downloads or secure another live public copy. Previous browser-cached content can also remain accessible on devices that already downloaded it. The private app disables its service worker and clears its own old caches.

## Progress

Authenticated storage reads each user's server records before lessons load and serializes writes. Bank and lesson IDs stay stable. Existing anonymous browser progress is not automatically assigned to a student. Lesson JSON backups can be imported deliberately through 学习档案. Two simultaneous devices can overwrite the same progress category (last saved category wins); use one active study session at a time. Save failures remain visible with a retry button; wait for “云端已保存” before leaving. This release does not provide an administrator progress dashboard.

## Verification

`npm run test:students` checks anonymous content denial, administrator-only creation, CSRF, forced password change, separate student records, progress restored in a second session, reset/disable/logout revocation. `npm run check` validates existing course content.
