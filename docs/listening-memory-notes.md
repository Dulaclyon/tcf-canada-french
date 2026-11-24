# Listening question memory notes

Every listening question has a compact memory-note textbox below its answer controls, limited to 100 Unicode characters. Notes are private to the signed-in account and keyed by practice-set ID and question number; the same note appears in random review. Notes are stored separately from answers and completion records in the existing progress database, with no new service.

Saving is automatic while typing, using the existing ordered progress-save queue. Empty notes remove their entry. The server enforces the length limit, bounded keys and listening access. A maximum of 5000 question notes covers the current listening bank. Reading questions remain unchanged.

Validation: scripts/check-listening-memory.mjs covers Unicode counting, 100/101-character boundaries, permissions, account isolation, persistence after server restart and clearing. Browser verification covers truncation, separate question notes and persistence after navigation/reload.
