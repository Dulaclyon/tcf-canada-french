# Visual style reference · 17 November 2026

Scope: font family, font size/weight/line-height, text colors, field and surface fills, borders, control radii and state colors. The user explicitly requested keeping the current structure, navigation, content order and features. No HTML, application JavaScript, routes, content or database changes were made for this update.

## Live references inspected through the browser
- Udemy course page: https://www.udemy.com/course/french-for-beginners-a1/
- Coursera course page: https://www.coursera.org/learn/etudier-en-france

Computed-style samples and accepted screenshots: `/tmp/tcf-platform-benchmark/`.

Udemy sampled styles: Udemy Sans; 32px course title; 24px section heading; 14–16px ordinary text and controls; white fields with pale neutral borders; stronger weight for action labels. Coursera sampled styles: Source Sans Pro; 44px public course title; 20–30px section headings; 14–16px text; white/neutral fields and restrained colored states. These are measurements from the particular pages and viewport inspected, not universal claims about every screen on either platform.

## Applied visual system
- Source Sans 3, the open-source Source Sans family, self-hosted in two WOFF2 subsets covering French, punctuation and phonetic characters; combined 88,852 bytes. OFL license included. Udemy's proprietary font was not copied.
- Learning-interface body 16px; primary page headings 32px (28px mobile); section headings 24px (22px mobile); secondary text 13–14px; French examples 18–19px. Weight and line-height standardized.
- Dark charcoal text, muted slate secondary text, white fields, light grey borders, white course surfaces and a very light grey application canvas.
- Existing burgundy brand accent retained for primary actions, progress, selection and focus states. The approved architectural landing photograph, wordmark and hero composition are retained.
- Neutral table headers, topic-heading fills and secondary controls. Success/error states remain distinguishable.

## Verification
Same desktop route/state captured before and after at 1440 × 1000. Evidence: `07-ryan-before.jpg`, `08-ryan-after.jpg`; lesson `09-ryan-lesson.jpg`; fields `10-ryan-fields.jpg`; 320px mobile `11-ryan-mobile.jpg`.

Confirmed computed font Source Sans 3, body 16px, page heading 32px, field fill #ffffff, border #c5cbd4, application canvas #f7f8fa. New fonts loaded successfully. No horizontal overflow or browser errors in checked paths. Build, interface-language/protected-content checks, server syntax and student-authentication regression checks passed.

The only server change allows the two exact public font paths and assigns WOFF2 MIME type. Private lessons, audio, question banks, account isolation and stored progress are unchanged.
