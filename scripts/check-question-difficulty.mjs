import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {estimateDifficulty,CEFR_LEVELS,difficultyPath,difficultyKey,resumeDifficultyPath} from '../question-difficulty.js';
const simple={audio:'a.mp3',transcript:'Bonjour ! Je voudrais un café, s’il vous plaît. Merci, bonne journée !',options:[{text:'Un café.'},{text:'Une chambre.'},{text:'Un billet.'},{text:'Un livre.'}]};
assert.equal(estimateDifficulty('listening',simple).level,'A1');assert.deepEqual(estimateDifficulty('listening',{...simple,number:1}),estimateDifficulty('listening',{...simple,number:39}),'Question position cannot determine CEFR level');
assert.equal(estimateDifficulty('listening',{audio:'a.mp3',transcript:''}).level,null);assert.equal(estimateDifficulty('listening',{transcript:'Bonjour je voudrais un café merci.'}).level,null);
assert.equal(estimateDifficulty('reading',{body:'Bonjour je voudrais un café merci.'}).level,'A1');
const entries=[{setId:'s2',number:1,level:'B2',score:60},{setId:'s1',number:1,level:'A1',score:10},{setId:'s1',number:2,level:null,score:0},{setId:'s2',number:2,level:'A2',score:25}];
assert.deepEqual(difficultyPath(entries).map(q=>q.level),['A1','A2','B2',null]);assert.equal(difficultyPath(entries,{level:'B2'}).length,1);assert.equal(difficultyPath(entries,{level:'unassessed'}).length,1);assert.equal(difficultyPath(entries,{level:'C2'}).length,0);
const overrides={'s1:1':{level:'C2'},'s2:1':{level:null}};assert.deepEqual(difficultyPath(entries,{overrides}).map(q=>q.level),['A2','C2',null,null]);assert.equal(difficultyPath(entries,{overrides,level:'C2'})[0].basis,'teacher-reviewed');
assert.equal(resumeDifficultyPath(entries,{setId:'s1',number:2}),2);assert.equal(resumeDifficultyPath(entries,{setId:'missing',number:2}),0);
for(const kind of ['listening','reading']){
 if(!existsSync('dist/bank/difficulty-'+kind+'.json'))continue;
 const manifest=JSON.parse(await readFile('dist/bank/difficulty-'+kind+'.json','utf8'));const index=JSON.parse(await readFile('dist/bank/index.json','utf8'));const seen=new Set();
 for(const q of manifest.questions){const key=difficultyKey(q.setId,q.number);assert(!seen.has(key));seen.add(key);assert(q.level===null||CEFR_LEVELS.includes(q.level));assert.notEqual(q.level,'C2','Automatic text estimates cannot certify C2');assert(!('answer' in q)&&!('transcript' in q));}
 for(const set of index.sets.filter(s=>s.kind===kind))for(let n=1;n<=set.questionCount;n++)assert(seen.has(difficultyKey(set.id,n)),'Missing question label');
 const sorted=difficultyPath(manifest.questions);assert.equal(sorted.length,manifest.questions.length);assert.equal(new Set(sorted.map(q=>difficultyKey(q.setId,q.number))).size,sorted.length);
 for(let i=1;i<sorted.length;i++)assert((sorted[i-1].level?CEFR_LEVELS.indexOf(sorted[i-1].level):6)<=(sorted[i].level?CEFR_LEVELS.indexOf(sorted[i].level):6));
}
console.log('Question difficulty passed: source-based estimates independent of question numbering, missing sources, all questions covered once, level filters, global ordering, teacher overrides and stable resume identities.');
