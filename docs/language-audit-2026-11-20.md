# Language audit — 20 November 2026

## Verdict

The language selector was only partially implemented. The previous topic-button patch did not make a lesson fully multilingual. Interface labels and teaching content were being handled by different, inconsistent rules. The original courseware, added explanations, and Chinese glosses have no complete English or Traditional Chinese content editions. That content gap remains; it must not be described as resolved by translating headings.

## Evidence and scope

Current audit captured the local protected application with a dummy administrator account and the real packaged course/question-bank assets. It inspected all 27 displayed foundation units, eight primary navigation routes, landing, login, student management, and essay review. Screenshots and machine-readable observations are in `/tmp/tcf-language-audit/`. No production student data or credentials were used. No student records, submissions, permissions, or passwords were changed.

1. **Landing and login — healthy in inspected English state.** Controls and public text use the interface catalogue. Captures: `landing-final.jpg`, `login-after.jpg`.
2. **Foundation catalogue and lessons — interface repaired; content localization incomplete.** Every displayed unit originally had untranslated structural labels. Topic buttons were localized, but lesson names, audio captions, rule headings, table headers and return links were not consistently covered. Shared structural-label rules and catalogue entries now cover these surfaces. All 28 source material titles (including the merged alias), all 20 legacy course titles, and all 17 human-audio captions have English catalogue coverage. Original Chinese explanations and glosses remain Chinese. Captures: `01-grammar-before.jpg`, `grammar-final.jpg`; observations: `all-units-before.json`, `all-units-after.json`, `grammar-switch-check.json`.
3. **Review — regression repaired.** The page referenced the removed `courseCard` component and threw a ReferenceError even with no bookmarks. Restored a small card renderer without restoring the removed Review by topic section. Dynamic mistake/bookmark counts now follow the selected language. Capture: `review-final.jpg`.
4. **Listening and reading — inspected English controls healthy with assets loaded.** Checked question-bank selectors, progress cards, headings and completion/navigation controls. French stimuli/options remain learning content. Early captures on the older local server were invalid for bank inspection because it had not loaded bank assets; verification was repeated on the complete local server. Captures: `reading-final.jpg`, `listening-final.jpg`.
5. **Speaking and writing — French questions preserved; interface switching verified.** Switched English → Simplified Chinese → Traditional Chinese → English on writing and grammar screens. The writing draft, French prompt and timer remained present/unchanged. No submissions were made. Evidence: `writing-switch-check.json`, `grammar-switch-check.json`.
6. **Administration and essay review — inspected English controls healthy.** Original student writing, teacher comments and historical submission titles are records, not interface strings; they are preserved. Captures: `admin-after.jpg`, `submissions-after.jpg`.
7. **Content and sources — partial-word translations repaired.** The previous fallback could turn an unknown Chinese sentence into mixed fragments such as “原创Structure片段”. Dictionary replacement now requires Chinese phrase boundaries. Source filenames are explicitly protected, so a translated word no longer changes a displayed filename. Source metadata and assessment labels have explicit translations.

## Root causes

- The broad `.map-reading`/courseware translation exclusions blocked interface headings, captions and table headers alongside teaching text.
- Course headings and catalogue labels had additional blanket exclusions.
- The fallback replaced dictionary substrings inside unknown Chinese phrases. Recent additions of short grammar terms made the corruption more visible.
- There was no distinction in coverage checks between a translated interface and a multilingual course edition. Passing a few menu-string assertions was insufficient.
- Most explanations and glosses have only one Chinese source value. There is no complete locale-specific content data model for those fields. Some dates also still use a Chinese display locale; date formatting is a remaining consistency item.

## Changes made

- Added structural interface-label coverage while keeping original explanations, French examples, French examination prompts, student writing and feedback protected.
- Covered course titles, audio captions, lesson table headers, grammar section labels, question types, bank labels, counters, zoom accessibility labels and additional API error messages.
- Prevented partial replacements within unrecognized Chinese phrases.
- Protected source filenames from translation.
- Repaired the Review rendering regression.
- Added a regression check for title/audio coverage, structural labels, dynamic counters, French preservation and phrase-boundary behavior.

## Verification

Passed:

- `node scripts/check-language-boundaries.mjs`
- `node scripts/check-interface-languages.mjs`
- `node scripts/check-lesson-flow.mjs`
- `node scripts/check.mjs` (source PDF hashes, original source lines, reading flow, exercises and bank conversion)
- Full local build with bank assets
- Browser checks described above

## Remaining work and limits

A fully English or fully Traditional Chinese learning experience requires translated teaching-content fields, not more DOM word substitution. That includes original explanatory paragraphs, added rules, explanatory table cells, example glosses, pitfalls, exercise explanations and custom lesson-module prose. French learning material must remain French and original source editions must be retained. This audit does not claim that those translations exist or that every lesson is fully localized.

This is a language audit, not a full accessibility certification. Screen-reader language inheritance and keyboard behavior need a separate dedicated accessibility pass. Production authenticated pages were not tested using real student accounts; local dummy-account behavior was verified.
