import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildLessonFlow} from '../lesson-flow.js';
const materials=JSON.parse(fs.readFileSync('src/data/materials.json'));
const units=materials.filter(m=>!m.id.startsWith('grammar-sounds-'));assert.equal(units.length,27);const unit=units[7];assert.equal(unit.id,'lesson-present-routines');assert.equal(units[6].id,'lesson-08');assert.equal(units[8].id,'lesson-09');assert.equal(unit.lesson,31,'Stable source key is distinct from display position');
const compact=t=>t.replace(/\s+/gu,'');const input=compact(fs.readFileSync('docs/new-foundation-unit-source.txt','utf8'));const output=compact(unit.pages.flatMap(p=>p.sections.map(s=>s.text)).join(''));assert.deepEqual([...output].sort(),[...input].sort(),'Every extracted source character retained');
const flow=buildLessonFlow(unit);assert.equal(flow.readings.length,2);assert(flow.readings.every(r=>r.glossary.length>=8));assert.equal(unit.exercises.length,24);assert.equal(new Set(unit.exercises.map(e=>e.id)).size,24);for(const e of unit.exercises){assert(e.options.includes(e.answers[0]));assert(e.explanation);}
for(const n of [67,68])assert(fs.statSync('human-audio/penny-cres-'+n+'.m4a').size>10000);
console.log('New Unit 8 passed: 27 catalogue units, stable existing IDs/order, full source coverage, two readings with vocabulary, 24 exercises and two original audio files.');
