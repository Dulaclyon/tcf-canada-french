export const SECTION_NOTE_LIMIT=2000;
export const SECTION_NOTE_KEYS=Object.fromEntries(['listening','reading','oral','writing'].map(kind=>[kind,`tcf-section-notes-${kind}-v1`]));
export const isSectionNoteKey=key=>Object.values(SECTION_NOTE_KEYS).includes(key);
export const validSectionNote=value=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===1&&typeof value.text==='string'&&value.text.length<=SECTION_NOTE_LIMIT;
