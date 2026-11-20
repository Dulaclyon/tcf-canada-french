# Full course localization — 20 November 2026

## Current result

The scope now includes teaching content, following the request to translate complete explanations rather than interface labels alone. The original source data and PDFs remain unchanged. A catalogue of 3,934 complete phrases provides English and Traditional Chinese editions of rules, explanatory table cells, glosses and exercise feedback. French examples, questions, answer values, audio links, student writing and teacher feedback are preserved.

The catalogue is compiled locally during the normal build. It uses no runtime translation API or paid service. The generated module requires the same Basics permission as other foundation assets. Switching back to Simplified Chinese restores original markup, with explicit clean-label overrides.

## Verification

- All 27 current units and 131 topic views inspected locally in English, with no visible Chinese remaining in the inspected course blocks.
- All Chinese prompt, explanation, pitfall and string-option fields across 556 exercises have catalogue coverage.
- Twenty legacy course routes inspected; two final omissions identified and translated.
- English / Traditional / Simplified roundtrip preserves French conjugations, audio URLs and answer values.
- Actual exercise feedback checked in English and Traditional using a dummy local account.
- Language-boundary, interface-language, full content/source, build and section-permission checks passed.
- Unauthenticated users cannot fetch the catalogue; students without Basics permission receive a denial.

Coverage checks do not constitute independent pedagogical review of every translation. Production authenticated behavior was not tested with real student credentials. Earlier interface-only audit findings are superseded by this full-content implementation. No production student data was modified.
