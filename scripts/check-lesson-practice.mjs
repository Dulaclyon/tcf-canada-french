import fs from 'node:fs';
import assert from 'node:assert/strict';
const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
const courses=JSON.parse(fs.readFileSync('src/data/courses.json','utf8'));
const fallback={3:'grammar-04',10:'grammar-12',16:'grammar-09',21:'grammar-18',22:'grammar-19'};
const ids=new Set(courses.flatMap(c=>c.exercises.map(e=>e.id)));
let added=0;
for(const m of materials){
 const related=courses.filter(c=>c.courseware?.some(b=>b.file===m.file)||c.article?.sourceFile===m.file||c.id===fallback[m.lesson]);
 const exercises=[...related.flatMap(c=>c.exercises),...(m.exercises||[])];
 assert(exercises.length>=22,`${m.id}: at least 22 exercises`);
 const prompts=new Set();
 for(const q of exercises){assert(!prompts.has(q.prompt),`${m.id}: repeated prompt`);prompts.add(q.prompt);}
 for(const q of m.exercises||[]){
  assert(!ids.has(q.id),`${q.id}: duplicate ID`);ids.add(q.id);
  assert(q.answers.length&&q.explanation&&q.prompt,`${q.id}: complete question`);
  if(q.id.includes('-practice-expanded-')){
   added++;
   assert(q.options.length===3&&new Set(q.options).size===3,`${q.id}: three distinct choices`);
   assert(q.answers.length===1&&q.options.filter(o=>q.answers.includes(o)).length===1,`${q.id}: one answer`);
   assert(!/：Je ___/.test(q.prompt)||! /^[aeiouéèêâîôûh]/.test(q.answers[0]),`${q.id}: elision`);
  }
 }
}
assert.equal(added,323);
console.log(`${materials.length} lessons have at least 22 exercises; ${added} new questions have unique IDs, prompts and valid answer choices.`);

const ui=fs.readFileSync('app.js','utf8');
assert(ui.includes('link(lessonRoute(e.course.id)'));
assert(ui.includes('link(lessonRoute(ex.course.id)'));
assert(ui.includes("materials.some(m=>m.id===id)?'material/':'course/'"));
