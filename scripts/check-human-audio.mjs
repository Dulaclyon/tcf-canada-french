import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {recordings,originalLessonAudio} from '../human-audio.js';
import {buildLessonFlow} from '../lesson-flow.js';
import {combineBasicVerbs} from '../basic-verbs.js';
const materials=JSON.parse(await readFile('src/data/materials.json','utf8'));
const courses=JSON.parse(await readFile('src/data/courses.json','utf8'));
for(const r of recordings){
 const m=materials.find(m=>m.lesson===r.lesson);
 const flow=buildLessonFlow(m,courses.map(c=>c.article));
 const titles=[...combineBasicVerbs(m,flow.grammar),...flow.readings].map(x=>x.title);
 assert(titles.includes(r.title),`Missing topic ${r.lesson}: ${r.title}; actual: ${titles}`);
 assert((await stat(`human-audio/${r.file}`)).size>10000);
 if(r.visible===false)assert.equal(originalLessonAudio(r.lesson,r.title),'');else assert(originalLessonAudio(r.lesson,r.title).includes(r.file));
}
assert(originalLessonAudio(6,'短文&对话').includes('62.m4a'));
assert(originalLessonAudio(6,'现在时').includes('63.m4a'));
assert.equal(originalLessonAudio(99,'missing'),'');
console.log(`${recordings.length} human recording mappings verified against current lesson topics.`);
