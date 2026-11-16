# Original recording restoration

The previous originalLessonAudio implementation returned an empty string outside 127.0.0.1:4173. Its lesson-audio folder was also absent from the production build. This caused browser speech synthesis to appear in place of original recordings on Render.

human-audio/manifest.json now records each verified source and its current lesson/topic. The build copies the files, and matching human recordings suppress generated reading/pronunciation controls. Recordings retain their original bytes. The two new Penny Cres files were identified by their spoken opening: 62 is the weather dialogue; 63 is Les quatre saisons en France.

15 existing source recordings and 2 new recordings are connected. Identification used short French speech transcriptions checked against the course text; transcription output is not used as teaching content.

Unresolved: the old code references lesson-06-first-verbs.wav, lesson-06-second-verbs.wav and full readings for lessons 7, 9, 10, 12 and 13. Those named assets were not found in this workspace. They are not represented as restored. Additional source recordings whose content does not clearly match a current section remain unchanged in their source directories, including the lesson 16 recording (opening about a school meeting, unlike the current breakfast passage). The older seasons recording in source lesson 5 is retained; the newer requested Penny Cres 63 recording is preferred.
