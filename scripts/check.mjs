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
 assert(x.rules.length>0);assert(x.article.text.length>100);assert(x.article.translation.length>20);
 assert(x.source.file&&x.source.page,'source trace');
 assert.equal(x.exercises.length,10);
 for(const q of x.exercises){
  assert(!ids.has(q.id));ids.add(q.id);n++;
  assert(q.answers.length&&q.explanation&&q.pitfall);
  assert(!prompts.has(q.prompt),`duplicate prompt ${q.id}`);prompts.add(q.prompt);
  if(q.options) assert(q.answers.some(a=>q.options.includes(a)),`choice answer ${q.id}`);
 }
}
assert.equal(n,200); assert.equal(e.oral.length,90);assert.equal(e.writing.length,60);
for(const group of [e.oral,e.writing]) for(const q of group){assert(q.id&&q.prompt&&q.guide&&q.source);assert([1,2,3].includes(q.task));assert(!ids.has(q.id));ids.add(q.id);assert(!prompts.has(q.prompt));prompts.add(q.prompt);}
for(const group of [e.oral,e.writing])for(const t of [1,2,3])assert(group.some(x=>x.task===t));
for(const f of ['index.html','styles.css','manifest.webmanifest','icon.svg'])assert(fs.existsSync(f));
JSON.parse(fs.readFileSync('manifest.webmanifest'));
console.log(JSON.stringify({courses:c.length,articles:c.length,exercises:n,oral:e.oral.length,writing:e.writing.length,uniqueIds:ids.size,independentHumanReview:0},null,2));
