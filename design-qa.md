# French with Ryan · Editorial Academy

final result: passed

The user replaced the second design with the FIRST displayed concept. Visual truth: `/Users/renryansr./.codex/generated_images/01a19a26-abf8-7311-92ba-af5bf7570869/exec-eba882d4-25b3-46d5-ba11-28f7ad74b457.png`.
Implementation: `http://localhost:4176/`.

## Evidence and normalization
Source 1487 × 1058, normalized to 1440 × 1024. Local desktop CSS viewport 1440 × 1023 at inherited 110% zoom; screenshot clip compensates for IAB capture scaling, then extracts 1440 × 1024 content. Source and actual are composed side by side in `/tmp/tcf-redesign-qa/first-comparison.jpg`. Actual: `/tmp/tcf-redesign-qa/first-desktop.jpg`. Mobile tested at 429 × 929 and 390 × 844 CSS; `/tmp/tcf-redesign-qa/first-mobile.jpg`. Workspace at 1440 × 1024: `/tmp/tcf-redesign-qa/first-workspace.jpg`. Logged-out public landing compared to the selected logged-out concept. Page was re-captured after changes.

## Findings and comparison history
Initial P2: CTA and supporting text smaller than the selected reference. Increased desktop button to 30px/80px minimum height and supporting sentence to 30px. Re-captured and compared; no actionable P0/P1/P2 findings remain. Small differences in photographic details, exact serif metrics and selector corner treatment are P3.

## Required fidelity surfaces
- Fonts: Georgia serif display and wordmark, Cormorant Garamond italic accent, DM Sans controls/body with system CJK fallback. Two-line headline, burgundy period, clear supporting sentence and single action. Existing teaching text remains original.
- Layout: warm ivory full-height photograph with clear left area; architectural facade and burgundy foliage on the right; heading at mid-left, generous whitespace, footer bottom-left. Mobile moves photography below the readable hero, without text over the building or horizontal overflow. Shared course, login and administrator pages carry the restrained ivory/burgundy palette and serif headings.
- Colors: ivory #faf6ef, burgundy #741f2d, charcoal #302725, warm neutral dividers. Course table and topic styles harmonized; warning states retained.
- Image quality: dedicated generated 1440 × 1024 Paris photograph, JPEG 282 KB. Subject, focal placement and light match the first concept. No image placeholders or drawn substitutes.
- Copy: French with Ryan, Make French / part of your life., concise course description, Student login. English default, Simplified and Traditional Chinese controls retained. No extra feature inventory. Ryan Run ownership/non-commercial footer retained.

## Interactions and regression checks
Verified language switching, homepage-to-login, continue to workspace, readable navigation and teacher account links. Local demonstration accounts only; production student data untouched. No browser errors or warnings. Build, interface-language checks and student authentication/security regression checks passed after the switch. Earlier access-control and essay-submission checks passed for the same unchanged functionality. No courseware, question, progress or audio data changed. New public access is limited to the exact landing photograph path.

## Checklist
- Selected first concept implemented and compared: complete.
- Desktop/mobile readability and language controls: complete.
- Account and learning functionality preserved: complete.
- Original courseware and recordings retained: complete.

## Follow-up polish
P3 only: minor browser/font rasterization and generated foliage differences from the concept. No blocking gaps.

## Interface polish · 17 November 2026
Final result remains passed. Current audit and implementation notes: `docs/interface-review.md`.
Fresh before/after screenshots: `/tmp/tcf-polish-audit/`. Retained first-concept palette, typography, photographic asset and copy. Adjusted utility alignment and treatment, account disclosure, teacher form/list hierarchy, locale dates and mobile reflow. Fixed initial 320px overflow, then verified scrollWidth equals viewport width. Native disclosure keyboard behavior and unsaved feedback preservation passed. No remaining actionable P0/P1/P2 finding in the reviewed surfaces.
