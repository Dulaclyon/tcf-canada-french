import {createHash} from 'node:crypto';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
for(const f of ['app.js','sw.js']) execFileSync(process.execPath,['--check',f]);
const c=JSON.parse(fs.readFileSync('src/data/courses.json','utf8'));
const e=JSON.parse(fs.readFileSync('src/data/exam.json','utf8'));
assert.equal(c.length,20,'20 courses');
let ids=new Set(),prompts=new Set(),n=0;
for(const x of c){
 assert(!ids.has(x.id)); ids.add(x.id);
 for(const key of ['title','level','objectives','source','rules','article','exercises']) assert(x[key],`${x.id}: ${key}`);
 assert(x.rules.length>0);assert(x.courseware?.length>0,`${x.id}: original grammar`);for(const b of x.courseware){assert(b.text.length>20&&b.file&&b.node&&b.page===1,`${x.id}: courseware trace`);}assert(x.article.text.length>40);assert.equal(x.article.source,"用户课件");assert.equal(x.article.sourceFile,x.source.file);assert(x.article.sourceNode&&x.article.sourcePage);
 assert(x.source.file&&x.source.page,'source trace');
 assert.equal(x.exercises.length,10);
 for(const q of x.exercises){
  assert(!ids.has(q.id));ids.add(q.id);n++;
  assert(q.answers.length&&q.explanation&&q.pitfall);
  assert(!prompts.has(q.prompt),`duplicate prompt ${q.id}`);prompts.add(q.prompt);
  if(q.options) assert(q.answers.some(a=>q.options.includes(a)),`choice answer ${q.id}`);
 }
}
assert.equal(n,200); assert.equal(e.oral.filter(q=>q.source==='original').length,90);assert.equal(e.writing.filter(q=>q.source==='original').length,60);
assert.equal(e.oral.filter(q=>q.source==='official').length,11);assert.equal(e.writing.filter(q=>q.source==='official').length,3);
for(const q of [...e.oral,...e.writing].filter(q=>!['original','user-recalled'].includes(q.source)))assert(q.sourceUrl?.startsWith('https://')&&q.verifiedAt&&['zh-CN','fr'].includes(q.promptLanguage));
for(const group of [e.oral,e.writing]) for(const q of group){assert(q.id&&q.prompt&&q.guide&&q.source);assert([1,2,3].includes(q.task));assert(!ids.has(q.id));ids.add(q.id);assert(!prompts.has(q.prompt));prompts.add(q.prompt);}
for(const group of [e.oral,e.writing])for(const t of [1,2,3])assert(group.some(x=>x.task===t));
for(const f of ['index.html','styles.css','manifest.webmanifest','icon.svg'])assert(fs.existsSync(f));
JSON.parse(fs.readFileSync('manifest.webmanifest'));
console.log(JSON.stringify({courses:c.length,articles:c.length,exercises:n,oral:e.oral.length,writing:e.writing.length,uniqueIds:ids.size,independentHumanReview:0},null,2));
const words=s=>s.trim().split(/\s+/u).filter(t=>/[\p{L}\p{N}]/u.test(t)).length;
for(const task of e.writingTasks)for(const example of task.examples){assert.equal(words(example.text),example.wordCount,example.title);assert(example.wordCount>=task.minWords&&example.wordCount<=task.maxWords,example.title);assert(e.writing.some(q=>q.id===example.questionId));}
for(const course of c){assert(["课件原文","课件例句","课件对话"].includes(course.article.kind));assert.notEqual(course.comparison,course.rules[0].explanation);for(const id of [...course.prerequisites,...course.related])assert(c.some(x=>x.id===id),id);}
console.log('Courseware attribution, reading types, prerequisite links and writing sample ranges validated.');

const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
const originals=materials.filter(m=>m.contentOrigin!=='authored');
assert.equal(originals.length,22);assert.equal(new Set(materials.map(x=>x.file)).size,materials.length);
assert.deepEqual(originals.map(x=>x.lesson),[2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24]);
for(const m of materials){assert(m.pages.length&&m.id&&m.file);for(const p of m.pages){const text=p.sections.map(x=>x.text).join('').replace(/\s+/g,'');assert.equal(text.length,p.characters);assert.equal(createHash('sha256').update(text).digest('hex'),p.textSha256,`${m.id}: text integrity`);}}
console.log('All 22 original PDF text records and page integrity hashes validated.');

const supplementIds=new Set();let supplements=0;
for(const m of materials){assert(m.supplements?.length>=3,`${m.id}: supplement coverage`);for(const b of m.supplements){assert(!supplementIds.has(b.id));supplementIds.add(b.id);assert(b.title&&b.rule&&b.pitfall&&b.status);assert(b.examples.length>=2&&b.examples.every(x=>x.fr&&x.zh));assert(/^https:\/\//.test(b.sourceUrl));if(b.table)assert(b.table.rows.every(r=>r.length===b.table.headers.length));supplements++;}}
console.log(`${supplements} supplemental topics and ${supplements*2} bilingual examples validated separately from original PDF text.`);

execFileSync(process.execPath,['scripts/check-grammar-layout.mjs'],{stdio:'inherit'});

for(const m of materials){const sections=m.pages.flatMap(p=>p.sections);for(const b of m.supplements){assert(b.anchor===null||sections.some(s=>s.title===b.anchor),`${b.id}: integrated topic anchor`);}}
assert(!fs.readFileSync('app.js','utf8').includes('非课件原文'),'Reader-facing editorial labels removed');

assert(!fs.readFileSync('app.js','utf8').includes('<summary>完整内容</summary>'),'Duplicate full-content panel removed');

execFileSync(process.execPath,['scripts/check-lesson-flow.mjs'],{stdio:'inherit'});

for (const kind of ['listening','reading']) {
 assert(e[kind].length >= 3);
 for (const passage of e[kind]) {
  assert(passage.id && passage.text && ['本站原创训练','回忆主题拓展'].includes(passage.source));
  assert(!ids.has(passage.id)); ids.add(passage.id);
  assert(passage.questions.length >= 3);
  for (const q of passage.questions) {
   assert(q.prompt && q.explanation && q.options.length >= 3);
   assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
  }
 }
}
console.log('Listening and reading passages, choices and answer keys validated.');

for(const m of materials.filter(m=>m.contentOrigin==='authored')){
 assert(m.supplements.length>=3 && m.pages.some(page=>page.sections.some(section=>section.glossary?.length>=3)));
 assert(m.exercises.length>=3);
 for(const e of m.exercises){assert(!ids.has(e.id));ids.add(e.id);assert(e.answers.length&&e.options.includes(e.answers[0])&&e.explanation);}
}
console.log('New grammar lessons contain topics, readings, vocabulary lists and answerable exercises.');

for(const m of materials)for(const e of m.exercises||[]){
 assert(e.options.includes(e.answers[0])&&e.explanation);
}

execFileSync(process.execPath,['scripts/check-lesson-practice.mjs'],{stdio:'inherit'});
