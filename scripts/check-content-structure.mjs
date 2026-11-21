import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildLessonFlow} from '../lesson-flow.js';import {renderGrammar} from '../grammar-layout.js';
const materials=JSON.parse(fs.readFileSync('src/data/materials.json'));
const blocks=id=>materials.find(m=>m.id===id).pages.flatMap(p=>p.sections);
const sound=buildLessonFlow(materials.find(m=>m.id==='lesson-03')).grammar.find(b=>b.title==='发音');
const phonics=renderGrammar(sound.text,'发音');
for(const key of ['open-e','i','wa'])assert(phonics.includes(`data-sound="${key}"`));
for(const word of ['faire','un père','une île','moi','toi','la loi'])assert(phonics.includes(`>${word}</dt>`));
assert(!phonics.includes('<table'),'Pronunciation word rows must not be guessed as a grammar table');
assert(!phonics.includes('>je</'),'Do not turn pronunciation correspondences into a pronoun chart');
for(const title of ['直接宾语代词','间接宾语代词']){
 const html=renderGrammar(blocks('lesson-18').find(s=>s.title===title).text,title);
 const chart=html.match(/<tbody>([\s\S]*?)<\/tbody>/u)[1];
 assert.equal((chart.match(/<tr>/gu)||[]).length,3,title+' must keep all three persons separate');
 for(const person of ['第一人称','第二人称','第三人称'])assert(chart.includes(person));
}
const past=blocks('lesson-15').find(s=>s.title==='不规则过去分词');const html=renderGrammar(past.text,past.title);
const tbody=html.match(/<tbody>([\s\S]*?)<\/tbody>/u)[1];
assert.equal((tbody.match(/<tr>/gu)||[]).length,23,'One row per irregular past participle');
assert(html.includes('>tenir</th><td>tenu</td>')&&html.includes('>venir</th><td>venu</td>'));
const dictionary=renderGrammar('le temps (n.) - the weather\nle ciel (n.) - the sky','名词');
assert(dictionary.includes('>天气</td>')&&!dictionary.includes('the weather'),'One localized meaning column rather than duplicate translations');
console.log('Pronunciation grouping, three-person pronoun charts, 23 independent participles and single-meaning dictionaries passed.');
