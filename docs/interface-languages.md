# Interface languages and French preparation questions

The shared language selector offers English (default), 简体中文 and 繁體中文（台灣）. The choice is remembered in browser localStorage under tcf-interface-language-v1. It does not change account data or progress. All public/account/student/teacher pages load the same local translation module; no external translation API is used.

Interface text, dynamic progress labels, placeholders, accessible labels and confirmation prompts are translated. French question text, source courseware, student essays and teacher feedback are protected from interface translation. Original basic-course data remains unchanged. Taiwan Traditional translations were generated using OpenCC s2twp and reviewed for account, sign-in, access and password terminology.

All speaking and writing prompts use French. Fourteen former Chinese sample-question summaries now have French renderings of the same task; promptIsTranslation records this, and links/embedded documents still provide the original official source. These renderings are not presented as newly verified verbatim quotations. Existing French prompts are retained. Preparation question titles and topics use French, and word limits are shown in French. The imported 188 listening/reading sets were checked for Chinese and common English instruction phrases; their original French content is unchanged. Existing reading explanations are now French.

The translator keeps original DOM strings to support switching without reloading or modifying editor values. Courseware content blocks, French text and submission/feedback text are excluded. Dynamic interface updates are translated through a mutation observer. Backup remains in the account controls; the standalone learning-record navigation is absent.

Checks: scripts/check-interface-languages.mjs and existing content, authentication, permissions, writing-progress and submission tests. Browser preview verified English on a fresh login, English administrator controls, all three language choices, unchanged French prompts and unchanged editor content during switching.
