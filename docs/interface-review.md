# Interface review · 17 November 2026

Outcome: implemented and verified. The existing ivory/burgundy design is retained.

## Scope and evidence
Homepage → account entry → learning workspace → student management → essay review. Screenshots were captured and inspected during this review in the in-app browser, using local demonstration accounts. No production student records were edited. Before screenshots are from this run, not earlier design mockups.

1. **Homepage and account entry — healthy after adjustment.** Language uses the same right-aligned header container and consistent 44px control height. The password-change page no longer displays student-login instructions. Evidence: `/tmp/tcf-polish-audit/01-home-after.jpg`, `02-account-after.jpg`.
2. **Learning header — fixed.** Previously, language appeared in the middle because account links occupied the entire right side. Header actions now form one group at the right, with language last, an Account disclosure, and a directly visible Manage students shortcut for teachers. Backup, password change, essay review, home and logout remain available. Cloud-save status is retained inside Account; failure opens the notice and retry control. Evidence: `03-workspace-before.jpg`, `03-workspace-after.jpg`, `03-account-menu-after.jpg` in the same capture folder.
3. **Student management — fixed.** Registration input/action align as a compact desktop row. Review action aligns with the heading. Secondary reset/disable controls no longer compete with the primary registration action. Mobile student rows and section checkboxes reflow without sideways scrolling. Evidence: `04-admin-before.jpg`, `04-admin-after.jpg`, `07-mobile-admin-after.jpg`.
4. **Essay review — fixed.** Consistent wordmark and return navigation. Submission rows use title, secondary metadata and a review-status label instead of full-width primary-button blocks. Selected state remains visible, rows still open the original essay, and list dates change with interface language. Evidence: `05-review-before.jpg`, `05-review-after.jpg`.
5. **Small screens and keyboard — checked.** 390px and 320px workspace header checks; a 3px overflow at 320px was found and corrected. Account panel remains within viewport. Tab reaches menu links; Escape closes it and returns focus to the summary. Native language select retains its accessible label. Mobile controls have 44px heights, checkbox labels have 44px targets. Evidence: `06-mobile-header-after.jpg`, `08-narrow-header.jpg` (initial overflow evidence, resolved in DOM recheck).

## Verification
- Build and JavaScript syntax checks passed.
- Interface language / protected courseware checks passed.
- Student authentication, CSRF, session isolation, progress persistence and logout/reset revocation regression checks passed.
- Essay permissions, immutable versions, feedback and persistence regression checks passed.
- Real local browser checks: menu open/close, keyboard behavior, teacher shortcut, essay selection, English/Traditional switching, locale dates, unsaved feedback retained, draft autosave status and original draft restoration.
- A date-switching exception found during the review was fixed by storing ISO datetimes in time elements; repeated language switching in a fresh tab produced no console errors.

## Limits
This is a focused interface and interaction review, not a full accessibility certification. No screen-reader hardware session or complete 188-set audio playback audit was performed. Original teaching text, French prompts, recordings, account permissions and stored student data are unchanged.
