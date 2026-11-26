# Reading room design QA

Scope: new reading-room extension within the existing French with Ryan product, retaining the current navigation, burgundy palette and editorial imagery. This is not a reproduction of a new external mockup.

Verified the current interface and screenshots at desktop and 390px mobile widths. Fine borders, compact index entries and serif reading typography maintain the existing product identity while differentiating longer reading content. Article header background was corrected to match the ivory page. Verse hyphenation was disabled; natural narrow-screen wrapping remains available. No horizontal page overflow was observed. Theme, level and search controls, glossary language switching and back/adjacent links were exercised. All text and glossary content remains visible without disclosure controls. No P0, P1 or P2 issues remain.

final result: passed

## Illustrated collection QA

50 subject-specific watercolor illustrations and 50 matching thumbnails verified for unique content hashes, dimensions, compressed size budgets and metadata. Culture, food and fable scenes checked in the existing ivory/burgundy interface. The 390px article view scales artwork proportionally (309 × 206 px), with no horizontal overflow. The index retains all 50 entries and compact thumbnails. English and traditional Chinese captions verified. Text/glossary comparison confirms no changes to the 50 source readings. Browser console: no errors. Direct image requests tested under granted and denied Foundations permissions. Screenshots: `/tmp/illustrated-reading-index.jpg` and `/tmp/illustrated-reading-article.jpg`.

final result: passed

## November 23 — learning clarity and notifications

Simplified shared post-reading vocabulary notes into unboxed, aligned word/meaning rows with secondary part-of-speech labels; preserved complex grammar tables. Verified semantic source coverage across 46 reading passages. Removed remaining human phonics players while retaining one synthesized player per pronunciation category. Added six reading paper palettes and recolored 18 illustrations with natural subject-specific colors.

Implemented teacher @name recipient selection and all-student notices, private student inboxes, unread badges, and automatic teacher submission alerts. Verified the teacher notification preview and essay deep link; isolated integration tests cover authorization and duplicate prevention. No production student messages were sent during testing.


## November 25 — consolidated practice controls

Grouped mode, level, set and question selectors into one practice settings panel shared by Listening and Reading. Replaced the mode dropdown with quiet underline tabs, grouped review/help actions in the panel footer, and combined question context and progress into one compact header. Preserved original question identifiers, answers, notes and difficulty estimates. Checked both modes, question selection and desktop/mobile wrapping; mobile top navigation now wraps rather than forcing horizontal overflow. Automated build and checks passed.


## November 25 — unified account roles

Replaced tall account cards with compact identity/action rows. All roles, including students, share one directory with name/email search and one role filter; account creation stays collapsed initially. Preserved existing brand styling. Verified search, student filter, student role option, Chinese reload, and mobile width (390px viewport and document). Isolated API tests verify student-only dashboard membership, identity/progress/feedback retention and section-grant preservation through conversions. No production accounts or grants were modified.


## November 25 — verb teaching categories and exercise restoration

Added four mutually exclusive teaching categories to the existing 200-verb reference, retaining alphabetical ordering and existing progress identities. Pronominal structures take precedence; regular -ir membership requires the nous -issons pattern. Added teaching notes for spelling changes and traditional conjugation groups. Foundation exercise cards now restore the latest submitted choice/text and feedback; pending open responses persist through self-assessment. Verified a submitted answer remains checked and graded after a full browser reload using a dummy localhost account. Build/main checks and rendering regressions passed; no production records were changed.


## November 25 — French writing characters

Added a compact character palette beside the writing draft, stacking below it on small screens. Character buttons insert at the current selection, dispatch the existing input event for autosave, support keyboard activation, and expose plain-text drag data for native textarea drops. Added uppercase accents and French punctuation. Verified selection replacement (ecole → école), uppercase insertion, caret position, and saved text after reload in the isolated localhost preview.


## November 25 — timed section access

Added a duration control and expiry status beside each section checkbox, plus an initial Foundations duration when creating a student. Existing grants default to Keep current expiry; no production authorizations were edited. Local dummy-student grant verified two-month expiry display and renewal controls. Unit tests cover legacy preservation, calendar clamping, exact expiry boundary and renewal; account integration tests verify protected API/assets deny expired access and recover after renewal. Registration and main checks pass.
