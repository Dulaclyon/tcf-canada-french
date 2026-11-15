import assert from 'node:assert/strict';import fs from 'node:fs';import {buildLessonFlow} from '../lesson-flow.js';import {renderSeparatedLessonRecap} from '../lesson-recaps.js';import {renderGrammar} from '../grammar-layout.js';
const materials=JSON.parse(fs.readFileSync('src/data/materials.json'));let phonics=0;
for(const material of materials){const before=JSON.stringify(material);const flow=buildLessonFlow(material);assert.equal(JSON.stringify(material),before);for(const section of flow.grammar){if(/^(?:发音|phonics)$/iu.test(section.title)){phonics++;continue;}assert.ok(!/^(?:发音部分(?:[^\n]*)?|Phonics?\s+发音(?:[^\n]*)?|tion 的发音|\[j\])\s*$/imu.test(section.text),material.id+' still mixes pronunciation into '+section.title);}}
for(const id of ['lesson-03','lesson-05','lesson-07','lesson-08']){const flow=buildLessonFlow(materials.find(m=>m.id===id));const block=flow.grammar.find(b=>b.title==='发音');assert.ok(block,id+' has its own pronunciation topic');assert.ok(renderGrammar(block.text,'发音').includes('data-phonics-audio'),id+' keeps pronunciation playback');}
assert.ok(renderSeparatedLessonRecap('lesson-03','课件内容').includes('Qui es-tu'));
assert.ok(renderSeparatedLessonRecap('lesson-07','否定').includes('Je ne veux rien oublier.'));
console.log(`All ${materials.length} units audited: ${phonics} pronunciation blocks separated; remaining grammar explanations expanded.`);
