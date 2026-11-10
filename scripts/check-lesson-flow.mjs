import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildLessonFlow} from '../lesson-flow.js';
const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
const courses=JSON.parse(fs.readFileSync('src/data/courses.json','utf8'));
const compact=s=>s.replace(/\s/gu,'');let passages=0;
for(const m of materials){
 const {grammar,readings}=buildLessonFlow(m,courses.map(c=>c.article));
 const movedMaterials = (m.relocatedSections ?? []).map(item => materials.find(target=>target.id===item.target));
 assert(movedMaterials.every(Boolean), m.id+': relocated sections have a destination');
 const output=[...grammar,...readings,...movedMaterials.flatMap(item=>item.pages.flatMap(p=>p.sections))].map(b=>compact(b.text)).join('');
 for(const p of m.pages)for(const b of p.sections)for(const line of b.text.split('\n').filter(x=>x.trim()))assert(output.includes(compact(line)),`${m.id}: lost source line ${line}`);
 assert(grammar.length>0 || (m.contentOrigin==='authored'&&m.supplements.length>0),`${m.id}: grammar available`);
 assert(!grammar.some(b=>/^短文(?:\d+)?[：:]?$/.test(b.title)),`${m.id}: passages in reading stage`);
 assert.equal(new Set(readings.map(b=>compact(b.text))).size,readings.length,`${m.id}: no duplicate passages`);
 passages+=readings.length;
}
const season=buildLessonFlow(materials.find(m=>m.lesson===6),courses.map(c=>c.article));
assert(season.readings.some(b=>b.text.includes('Quand l\'hiver finit')),'Embedded seasons article extracted after grammar');
const ui=fs.readFileSync('app.js','utf8');assert(!ui.includes("['articles','▧','文章应用']"));assert(ui.includes('lesson-exercise-body'));
console.log(`${materials.length} lesson flows preserve source lines; ${passages} reading sections follow grammar; inline practice enabled.`);

const lessonEight=buildLessonFlow(materials.find(m=>m.lesson===8),courses.map(c=>c.article));
assert(lessonEight.grammar.some(b=>b.title==='发音'&&b.text.includes('eau / au / aux')));
assert(!lessonEight.readings.some(b=>b.text.includes('Phonic 发音')));
