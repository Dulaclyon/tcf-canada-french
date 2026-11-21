# Pronunciation audio alignment audit — 20 November 2026

All 26 displayed foundation units were checked in the browser. Seven contain pronunciation sections. Thirteen sound groups and three combined sentence-example tracks now have saved audio (16 clips total).

The previous standalone generator maintained a separate list of phrases, so its recordings diverged from the visible examples. In particular, the [ø] clip included sœur and heure, which use [œ], while those words were absent from its example list. The [y] and décision [zjɔ̃] groups had no assigned recording. A section-level human recording also caused all group playback controls in that section to be removed.

Changes:
- `soundGroups` and the displayed supplement examples are the source of the synthesis scripts. Words and phrases are spoken in display order; IPA annotations and translations are not read.
- [ø] reads feu, peu, eux, heureux. [y] reads rue, roue. décision has its own [zjɔ̃] track, separate from the [sjɔ̃] examples.
- All existing sound-group clips were regenerated to include precisely the displayed lists. Example-sentence tracks include the complete merged unit examples, including glide exceptions and elision/liaison examples.
- Legacy pronunciation renderers use the same groups, and full human recordings no longer hide their exact example players. The original human audio bytes are preserved and clearly labeled as original lesson recordings.
- Audio URLs include a fingerprint of their spoken examples to avoid stale playback after a lesson edit.
- The manifest stores exact examples, synthesis text, word timing metadata, duration and SHA-256 for each file. `scripts/check-pronunciation.mjs` rejects mismatched words/order, missing clips or changed audio bytes.

Generation uses the existing French Denise neural voice at -8% rate, prepared offline with edge-tts and mutagen. The deployed site plays static MP3 files; it does not call a synthesis API. Regenerate with `NODE_BINARY=/path/to/node python scripts/generate-pronunciation.py`. It stages all selected recordings before replacing existing files.

Browser validation checked every rendered clip's served bytes and decoded duration, confirmed all shipped clips are used, checked the [y] player on mobile, and confirmed full human and group players coexist in lessons 3, 5 and 6. These are text/asset/decoder checks, not a claim that every phoneme was independently reviewed by a human phonetician.
