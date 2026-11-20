import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeExisting,getSetStatus,summarizeSets,firstUnfinished,sampleCompletedQuestions} from '../bank-progress.js';
const exam=JSON.parse(fs.readFileSync('src/data/exam.json','utf8'));
for(const kind of ['listening','reading'])for(const original of exam[kind]){
 const converted=normalizeExisting(kind,original);
 assert.equal(converted.id,original.id);assert.equal(converted.questions.length,original.questions.length);
 converted.questions.forEach((q,i)=>{assert.equal(q.options.find(o=>o.key===q.answer).text,original.questions[i].options[original.questions[i].answer]);assert.equal(q.explanation,original.questions[i].explanation||'');assert.equal(kind==='reading'?q.body:q.syntheticText,original.text);});
}
const sets=[{id:'a',questionCount:3},{id:'b',questionCount:39},{id:'c',questionCount:39}];
let progress={a:{1:{choice:'B'},2:{choice:'C'}},b:{0:{choice:'A'},40:{choice:'A'},1:{choice:'X'}}};let complete={c:'2026-11-14'};
assert.deepEqual(getSetStatus(sets[0],progress,complete),{answered:2,total:3,status:'in-progress'});
assert.equal(getSetStatus(sets[1],progress,complete).status,'not-started');assert.equal(getSetStatus(sets[2],progress,complete).status,'completed');
let board=summarizeSets(sets,progress,complete);assert.deepEqual(Object.values(board).map(x=>x.length),[1,1,1]);
complete.a='saved';assert.equal(getSetStatus(sets[0],progress,complete).status,'completed');assert.equal(firstUnfinished(sets,complete).id,'b');
delete complete.a;assert.equal(getSetStatus(sets[0],progress,complete).status,'in-progress');
const persisted=JSON.parse(JSON.stringify({progress,complete}));assert.deepEqual(summarizeSets(sets,persisted.progress,persisted.complete),summarizeSets(sets,progress,complete));
assert.equal(firstUnfinished(sets,{a:true,b:true,c:true}).id,'a');
console.log('Unified existing question conversion, answer keys, progress states, manual completion and resume selection passed.');

const sample=sampleCompletedQuestions(sets,{a:true,c:true},10,()=>0.5);
assert.equal(sample.length,10);assert(sample.every(q=>q.setId==='a'||q.setId==='c'));
assert.equal(new Set(sample.map(q=>q.setId+':'+q.index)).size,10);
assert.deepEqual(sampleCompletedQuestions(sets,{},10),[]);
assert.equal(sampleCompletedQuestions([sets[0]],{a:true},10).length,3);
assert(sample.every(q=>q.index>=0&&q.index<sets.find(s=>s.id===q.setId).questionCount));
console.log('Random review samples only completed groups, without duplicates, and handles small/empty pools.');
