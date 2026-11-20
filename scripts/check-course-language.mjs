import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const rows=JSON.parse(await readFile('translations/course-content.json','utf8'));
const catalogue=new Map(rows.map(row=>[row.source,row]));
assert.equal(catalogue.size,rows.length,'Every source phrase is unique');
for(const row of rows){
 assert(row.en&&row['zh-TW'],row.source);
 assert(!/[\u3400-\u9fff]/u.test(row.en),'Untranslated Chinese in English: '+row.source);
}
const key=value=>String(value).replace(/\s+/gu,' ').trim().normalize('NFC');
let exercises=0;
for(const file of ['materials','courses'])for(const course of JSON.parse(await readFile(`src/data/${file}.json`,'utf8')))for(const exercise of course.exercises||[]){
 exercises++;
 for(const field of ['prompt','explanation','pitfall'])if(/[\u3400-\u9fff]/u.test(exercise[field]||''))assert(catalogue.has(key(exercise[field])),`${exercise.id}: ${field}`);
 for(const option of exercise.options||[])if(typeof option==='string'&&/[\u3400-\u9fff]/u.test(option))assert(catalogue.has(key(option)),exercise.id+': option');
}
assert.equal(catalogue.get('pouvoir、vouloir、devoir 后直接接不定式；只变位第一个动词。').en,'pouvoir, vouloir and devoir take an infinitive directly after them. Conjugate only the first verb.');
assert(catalogue.get('pouvoir、vouloir、devoir 后直接接不定式；只变位第一个动词。')['zh-TW'].includes('不定詞'));
assert(catalogue.get('直接 + 不定式').en.includes('infinitive'));
console.log(`${rows.length} complete English/Traditional phrase entries; all Chinese fields in ${exercises} exercises have translations.`);
