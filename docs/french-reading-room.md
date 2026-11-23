# French reading room

The new `#culture` collection contains 50 French readings: 20 cultural scenes, 20 food readings and 10 public-domain literary selections. It is an independent sidebar destination under the existing Foundations entitlement. Teacher access settings and direct server requests both enforce this entitlement.

## Editorial policy

The 40 original readings are teaching texts with fictional everyday scenes; they are not quotations or accounts of actual visits. Cultural references appear where specific factual background is used. The 10 literary selections preserve their source wording, with layout whitespace and footnote markers tidied. Every literary selection identifies its author, work and source edition. The B1 tag is an editorial guided-reading suggestion, not an official CEFR certification; older vocabulary and literary tenses are explicitly indicated.

All 10 excerpts were checked against downloaded Wikisource source texts, normalized only for whitespace and footnote markers. The sources are works by La Fontaine, Perrault, Daudet, Verne, Hugo and Rimbaud. No original course PDFs or Google Docs were edited.

Each reading has five or six vocabulary entries, totaling 260. English, simplified Chinese and traditional Chinese definitions are stored explicitly; French texts and titles remain French. No machine conversion or runtime translation service is required.

## Design and behavior

An extension of the existing burgundy brand, with ivory reading paper, Georgia serif titles and prose, fine warm borders and a restrained existing Paris editorial image. A compact two-column index becomes a single column at narrower widths. The article body is constrained for comfortable line length, with the glossary directly below the text. No dropdown hides the reading or vocabulary.

Theme buttons, a level selector and accent-insensitive French search work together. Back navigation preserves the in-memory filters; previous/next links follow collection order. No new personal data, progress tables, paid API, remote font or image request is introduced. All reading content is static.

## Validation

- `scripts/check-culture-readings.mjs`: 50 unique readings, category counts, French-only body, lengths, glossary translations, source metadata, combined filters and entitlement mapping.
- `scripts/check-section-permissions.mjs`: direct JSON/module access is denied when Foundations is disabled and allowed when enabled.
- Full existing `scripts/check.mjs` passed.
- In-app browser: desktop index and article, 10-classic filter, accent-insensitive search, English/simplified/traditional switching, previous/back navigation, and 390px mobile layout with no horizontal page overflow. No browser console errors observed.
- Screenshots: `/tmp/french-reading-room.jpg`, `/tmp/french-reading-article.jpg`.

## Per-reading artwork

All 50 articles have distinct built-in ImageGen watercolor illustrations, each paired with a compressed 240px thumbnail. Original PNGs remain outside the deployed project; 960px JPEGs and thumbnails live under `assets/readings/`. Directory thumbnails load lazily. Full article plates preserve the complete 3:2 composition without cropping. French alternative text describes each scene; the short illustration caption follows the interface language. Exact generation prompts are recorded in `docs/reading-illustrations.json`. No API-key workflow or paid image-hosting service is required. The image directory follows the Foundations permission.
