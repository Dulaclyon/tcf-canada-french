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
 assert(x.rules.length>0);assert(x.article.text.length>40);assert.equal(x.article.source,"用户课件");assert.equal(x.article.sourceFile,x.source.file);assert(x.article.sourceNode&&x.article.sourcePage);
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
const words=s=>s.trim().split(/\s+/u).filter(t=>/[\p{L}\p{N}]/u.test(t)).length;
for(const task of e.writingTasks)for(const example of task.examples){assert.equal(words(example.text),example.wordCount,example.title);assert(example.wordCount>=task.minWords&&example.wordCount<=task.maxWords,example.title);assert(e.writing.some(q=>q.id===example.questionId));}
for(const course of c){assert(["课件原文","课件例句","课件对话"].includes(course.article.kind));assert.notEqual(course.comparison,course.rules[0].explanation);for(const id of [...course.prerequisites,...course.related])assert(c.some(x=>x.id===id),id);}
console.log('Courseware attribution, reading types, prerequisite links and writing sample ranges validated.');
