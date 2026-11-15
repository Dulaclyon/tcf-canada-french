import assert from 'node:assert/strict';import fs from 'node:fs';import {buildLessonFlow} from '../lesson-flow.js';import {renderGrammar} from '../grammar-layout.js';
const m=JSON.parse(fs.readFileSync('src/data/materials.json')).find(m=>m.id==='lesson-06'),before=JSON.stringify(m);
const courses=JSON.parse(fs.readFileSync('src/data/courses.json')).filter(c=>c.article?.sourceFile===m.file);
const flow=buildLessonFlow(m,courses.map(c=>c.article));assert.equal(JSON.stringify(m),before);
for(const title of ['名词','动词','形容词','疑问词','副词','方位','发音'])assert.equal(flow.grammar.filter(b=>b.title===title).length,1,title+' must have a single dedicated tab');
const nouns=renderGrammar(flow.grammar.find(b=>b.title==='名词').text,'名词');
for(const word of ['le temps','le ciel','la neige','le vent','décembre','le printemps','les feuilles']){assert.ok(nouns.includes(word));}
assert.ok(nouns.includes('天气')&&nouns.includes('天空')&&nouns.includes('十二月'));
assert.ok(!nouns.includes('the weather le ciel'));
assert.equal((nouns.match(/<tbody>/g)||[]).length,1,'noun entries must be one consistent table');
assert.ok(renderGrammar(flow.grammar.find(b=>b.title==='发音').text,'发音').includes('nasal-an.mp3'));
console.log('Season vocabulary: one word per row, Chinese meanings, unique topic tabs, separate directions and phonics.');
