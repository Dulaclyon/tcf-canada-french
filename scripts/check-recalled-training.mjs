import assert from 'node:assert/strict';import fs from 'node:fs';
const exam=JSON.parse(fs.readFileSync('src/data/exam.json','utf8')),all=[...exam.writing,...exam.oral],map=new Map(all.map(q=>[q.id,q]));
const newQuestions=all.filter(q=>q.preparedAt==='2026-11-22');assert.equal(newQuestions.length,17);
assert.equal(exam.writing.filter(q=>newQuestions.includes(q)).length,8);assert.equal(exam.oral.filter(q=>newQuestions.includes(q)).length,9);
const ranges={1:[60,120],2:[120,150],3:[120,180]};
for(const q of newQuestions){
 assert.equal(q.source,'user-recalled');assert.equal(q.promptLanguage,'fr');assert.equal(q.adapted,true);assert(!/[\u3400-\u9fff]/u.test([q.title,q.prompt,q.topic,...q.documents].join(' ')),q.id);
 assert(!q.sourceUrl,'No invented original source URL');assert(!q.verifiedAt,'Do not claim verification of recalled wording');
 if(exam.writing.includes(q)){assert.deepEqual([q.minWords,q.maxWords],ranges[q.task]);assert(q.prompt.includes(String(q.minWords))&&q.prompt.includes(String(q.maxWords)));if(q.task===3){assert.equal(q.documents.length,2);assert(q.documents.every(d=>d.split(/\s+/u).length>=45));assert(q.materialsNote);assert.equal(q.recallCompleteness,'theme-only');}}
 else{assert.equal(q.preparationSeconds,q.task===2?120:0);assert.equal(q.answerSeconds,{1:120,2:210,3:270}[q.task]);}
}
const groups=JSON.parse(fs.readFileSync('docs/exam-recall-2026-11-22.json','utf8')).collections.filter(c=>['recall-1102','recall-1118','recall-work-travel'].includes(c.id));assert.equal(groups.length,3);
for(const group of groups){assert.equal(group.questionIds.length,6);assert.equal(new Set(group.questionIds).size,6);assert(group.questionIds.every(id=>map.has(id)));const qs=group.questionIds.map(id=>map.get(id));for(const kind of ['writing','oral'])assert.deepEqual(qs.filter(q=>exam[kind].includes(q)).map(q=>q.task).sort(),[1,2,3]);}
assert(groups.find(g=>g.id==='recall-1102').questionIds.includes('w2-04'),'Reuse existing colocation exercise');
assert.equal(new Set(all.map(q=>q.prompt.normalize('NFKC').replace(/\s+/gu,' ').trim())).size,all.length,'No duplicated prompts');
console.log('Recalled training passed: 17 new French-only exercises, 18 task slots across three sets, original documents identified, realistic word/time limits, no duplicate prompts or claimed original wording.');
