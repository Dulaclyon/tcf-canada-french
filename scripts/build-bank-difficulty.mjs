import {readFile,writeFile} from 'node:fs/promises';
import {estimateDifficulty} from '../question-difficulty.js';
import {normalizeExisting} from '../bank-progress.js';
const index=JSON.parse(await readFile('dist/bank/index.json','utf8')),exam=JSON.parse(await readFile('dist/src/data/exam.json','utf8'));
for(const kind of ['listening','reading']){
 const questions=[];
 for(const entry of index.sets.filter(s=>s.kind===kind)){
  const set=JSON.parse(await readFile('dist/bank/sets/'+entry.id+'.json','utf8'));
  for(const q of set.questions)questions.push({setId:set.id,number:q.number,...estimateDifficulty(kind,q)});
 }
 for(const passage of exam[kind]||[]){const set=normalizeExisting(kind,passage);for(const q of set.questions)questions.push({setId:set.id,number:q.number,...estimateDifficulty(kind,q)});}
 await writeFile('dist/bank/difficulty-'+kind+'.json',JSON.stringify({version:1,kind,method:'text-estimate-v1',questions}));
 console.log(kind+' difficulty estimates:',JSON.stringify(Object.fromEntries(['A1','A2','B1','B2','C1','C2','unassessed'].map(l=>[l,questions.filter(q=>(q.level||'unassessed')===l).length]))));
}
