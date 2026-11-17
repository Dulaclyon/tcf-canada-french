# French with Ryan redesign QA

final result: passed

Selected visual truth: `/Users/renryansr./.codex/generated_images/01a19a26-abf8-7311-92ba-af5bf7570869/exec-169d8200-9b86-46cc-96b7-7cc5c30c732c.png` (second displayed concept).
Implementation: `http://localhost:4176/`.
Evidence: `/tmp/tcf-redesign-qa/comparison-final.jpg`, `/tmp/tcf-redesign-qa/landing-wide.jpg`, `/tmp/tcf-redesign-qa/landing-mobile.jpg`, `/tmp/tcf-redesign-qa/workspace-final.jpg`, `/tmp/tcf-redesign-qa/lesson-desktop.jpg`, `/tmp/tcf-redesign-qa/admin-desktop.jpg`, `/tmp/tcf-redesign-qa/login-desktop.jpg`, `/tmp/tcf-redesign-qa/writing-mobile.jpg`, `/tmp/tcf-redesign-qa/navigation-mobile.jpg`.

## Comparison and normalization
Public English landing, logged out. Source raster 1487 × 1058, normalized to 1440 × 1024. Browser desktop CSS viewport 1440 × 1023 at inherited zoom 110%; explicit capture clip compensates for IAB screenshot scaling. Captured raster 1585 × 1126; the 1440 × 1024 content area was extracted and compared beside the normalized source in one 1440 × 512 comparison image. No interface was rasterized for implementation. Mobile CSS viewport 390 × 844; full content was captured separately. No horizontal content overflow in landing or writing page.

## Findings and iteration history
- Initial P2: hero started too far down, supporting type and action too small. Revised desktop alignment, display size, italic proportion, action size, and topic spacing. Re-captured and compared in `comparison-final.jpg`; no actionable P0/P1/P2 difference remains.
- Initial P1: inherited dark sidebar group surfaces conflicted with the new pale sidebar and reduced link contrast. Removed those surfaces and set readable green links and selected states. Verified in workspace-final and lesson captures.
- Initial P2: supporting landing sentence wrapped at desktop. Gave the sentence a bounded single line at large widths while preserving mobile wrapping. Verified final comparison.
- Existing course titles containing Chinese were being partly translated by individual UI terms. Protected course titles and topic names so original teaching content remains intact.

## Required fidelity surfaces
- Typography: self-hosted DM Sans (regular/bold/extra-bold) and Cormorant Garamond italic. Clear bold two-line headline, italic French line, compact wordmark, readable forms and learning text. Font licenses included. Chinese explanations preserve original text and use system CJK fallback.
- Rhythm: asymmetric desktop hero, lower-right landscape notebook, one primary login action, restrained dividers, generous whitespace. Mobile stacks copy and image and preserves navigation controls.
- Colors: forest green #064b35, white, quiet pale-green learning surfaces, lime accent. Existing blue-grey course tokens harmonized without removing warning/error distinctions.
- Imagery: custom generated notebook/green fountain pen photograph matches selected reference subject, crop and light; 1420 × 819 JPEG, 274 KB. No image placeholders. Existing icon retained with updated palette.
- Copy: French with Ryan across public, account and learning pages; concise hero. Original courseware retained, French question prompts retained, English default and both Chinese interface choices retained. Tiny redundant invited-students footer sentence from the mock omitted because access is enforced by the existing server.

## Interaction checks
Local demonstration accounts only; no production student records modified. Tested hero login link, log out, valid login through to workspace, teacher student-management screen and access controls, lesson navigation, writing timer/progress/editor controls, mobile navigation open/close, language switch to Traditional Chinese and back. No browser error/warning logs in tested paths.

Automated: curriculum/source integrity, interface languages, student authentication, section permissions, essay-submission/version/feedback persistence all passed. Build passed. Public asset allowlist names only the new landing photograph, stylesheet, and four font files; private lessons, audio and question banks retain authentication.

## Follow-up polish
P3: browser text rendering and generated photographic details differ slightly from the raster concept; layout, hierarchy, identity and core composition are retained. Full 188-set bank playback was not repeated for this appearance-only change.
