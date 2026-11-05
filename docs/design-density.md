# Focused density review and simplification

Date: 2026-11-01 (America/Toronto). Scope: the public Hero, learning overview, course entry, practice, and writing controls. This is a focused visual and interaction review, not a full accessibility certification.

## 1. Hero — simplified

Current-run captures: `qa-local/density/02-hero-desktop-before.jpg` and `04-hero-desktop-after.jpg`, captured at the same 1280×900 requested viewport (1265 CSS px content width). Before: a headline, several explanatory lines, a detailed nested lesson preview, decorative badge, slogan, and multiple content sections competed for attention. Some supporting copy was very small and low contrast.

After: one centered headline, one short explanation, one primary sign-in action. Removed the preview mockup, floating decoration, repeated closing CTA, separate five-stat strip, and long feature lists. Below the fold are three concise learning stages and three expandable questions. Real content counts, exam scope, provenance, local persistence and AI status remain accessible. Kept the existing palette and genuine ChatGPT sign-in contract.

## 2. Learning overview — simplified

Captures: `03-dashboard-before.jpg` and `05-dashboard-after.jpg`. Before: a large decorative panel, four statistics, three feature cards, three repeated course cards and a backup note appeared together.

After: one next-lesson task, three plain learning links, and optional learning statistics behind a disclosure. Grouped sidebar navigation, removed ornamental navigation symbols and the repeated course recommendations. Next lesson and statistics still come from the actual content and local records.

## 3. Practice — focused

Capture: `08-practice-before.jpg`, plus DOM evidence of 200 exercise articles rendered at once. After: exactly one exercise article is rendered, with current/total count, previous/next buttons and knowledge-point filtering. Capture: `07-exercise-phone-after.jpg`. No exercises were removed. Answer feedback, open-expression self-assessment, favorites and wrong-answer records use the original data paths. Wrong-answer next navigation accounts for a just-corrected item leaving the queue.

## 4. Course and writing — more gradual disclosure

Course objectives/prerequisites are expandable; core rules and examples remain visible. Course directory starts collapsed at narrower sizes. Larger reading type, more line space, fewer columns and more separation improve scanning. Writing and oral guidance, self-check lists and contextual notices expand when needed; input, timer, drafts and self-check state are retained.

## Verification and limits

- Inspected and saved current-run screenshots; read back the saved before/after Hero captures.
- Desktop comparison and 390×844 simulated phone viewport; phone clientWidth/scrollWidth both375, no page overflow in Hero or practice.
- Single-question count, correct counter changes, previous/next buttons, topic filter and grading verified through actual browser controls.
- Writing recovered its existing local draft and notes; self-check disclosure and timer start/pause operated successfully. Course core rule stayed visible while objectives collapsed.
- Keyboard drawer Escape/close behavior checked. New login control has a 44px minimum target. Text contrast and larger body type were improved, but no full WCAG audit or screen-reader test was performed.
- Content and auth checks/build passed. No changes to the curriculum JSON, record format, identity policy or public audience.
- Source screenshots are internal QA artifacts, ignored by Git and excluded from deployment; no user drafts are included in the screenshot handoff.

## Further Hero simplification — 2026-11-04

The user found the previous simplified landing page still crowded. Scope was limited to landing.html/landing.css: replaced the multi-section page with a single-screen entrance. One short heading, one description and one primary action; removed top navigation, secondary action, learning-path sections and FAQ. Kept only understated source/privacy links in the footer. Existing learning content remains inside the app. No auth, progress format, curriculum, or learning-page changes.

Current-run desktop and 390×844 phone screenshots were saved under qa-local/hero-minimal. Phone scrollWidth/clientWidth both390; title stays on one line, description intentionally wraps into two lines, and the Start link enters app.html#home. Hosted build passed. These are simulated browser viewports, not physical device tests.
