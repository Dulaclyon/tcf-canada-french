# Listening and reading collection import

The supplied “002 TCF阅读听力188” collection contains 95 listening papers (42 Réussir, 53 Opal), 93 reading papers (42 Réussir, 51 Opal), 95 listening transcript documents and 3,778 audio files. All 188 papers contain 39 questions, for 7,332 questions total.

Listening activities include matching spoken statements to pictures, selecting responses to short questions, and understanding conversations, announcements, interviews and longer recordings. These categories were identified from the supplied instructions and transcript samples, rather than assigned as official exam classifications.

The site imports question wording, four answer options, supplied answers, pictures, question-level recordings and transcripts. Original files are preserved locally. The folder's marketing text is omitted from the learning interface. Source question documents are recorded in each set's JSON metadata.

Recordings are deduplicated by source-byte SHA-256, then converted to mono AAC at 32 kbps for browser playback. All 3,705 listening questions have a matching audio asset. There are 1,818 unique recordings after deduplication. The 34 whole-test recordings are not duplicated on the site: the question-level recordings provide the practice content.

One source limitation is retained explicitly: Opal listening set 189 has 38 answer letters for 39 questions, so the entire set is unscored to avoid shifting the answer key. Its question 17 also has no transcript text in the supplied document. No missing answer or transcript is invented.

The bank archive is split into 20 MB parts for GitHub's web uploader. The build verifies SHA-256 hashes for each part and the full archive, extracts regular files under `dist/bank`, and validates all sets, choices and referenced assets before publication. Audio is loaded on demand and excluded from the service worker cache. Browser progress is stored separately from existing course records under `tcf-bank-progress-v1`.

## Unified learning and progress

Listening and reading each use one shared page with series, set and question dropdowns. Existing thematic exercises are normalized into the same four-choice renderer without changing their answers or explanations. Older bank and thematic URLs remain supported.

The progress board summarizes the selected series as not started, in progress and completed, with clickable previews and an overall completion count. Completion is explicitly chosen using “本组已完成” and saved in `tcf-bank-completed-v1`; answering all questions does not silently mark a set complete. The next-set button becomes available after marking the current set complete. Unchecking restores the appropriate started/unstarted state without deleting answers.
