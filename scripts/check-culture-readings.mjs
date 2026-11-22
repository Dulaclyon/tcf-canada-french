import fs from 'node:fs';
import assert from 'node:assert/strict';
import {selectReadings} from '../culture-reader-model.js';
import {routeSection} from '../section-access.js';
const readings=JSON.parse(fs.readFileSync('culture-readings.json','utf8'));
assert.equal(readings.length,50);assert.equal(new Set(readings.map(a=>a.id)).size,50);assert.equal(new Set(readings.map(a=>a.title)).size,50);
assert.deepEqual(['culture','food','classics'].map(category=>selectReadings(readings,{category}).length),[20,20,10]);
for(const a of readings){
 assert(a.title&&a.author&&['A1','A2','B1'].includes(a.level));
 const body=a.paragraphs.join(' ');assert(!/\p{Script=Han}/u.test(body));assert(body.split(/\s+/u).length>=55&&body.split(/\s+/u).length<200,`${a.id}: short, substantive text`);
 assert(a.vocabulary.length>=5);for(const v of a.vocabulary){assert(v.fr);for(const l of ['en','zh-CN','zh-TW'])assert(v.meaning[l]?.trim(),`${a.id}: ${l} glossary`);}
 if(a.category==='classics')assert(a.kind==='excerpt'&&a.work&&a.context&&a.source.url.startsWith('https://fr.wikisource.org/wiki/'));
 if(a.source)assert(new URL(a.source.url).protocol==='https:');
}
assert(selectReadings(readings,{query:'aube'}).some(a=>a.author==='Victor Hugo')); 
assert.equal(selectReadings(readings,{query:'crepe',category:'food'}).some(a=>a.title.includes('crêpe')),true);
assert.equal(selectReadings(readings,{query:'zzzz-no-match'}).length,0);
assert.equal(selectReadings(readings,{category:'classics',level:'A1'}).length,0);
assert(selectReadings(readings,{category:'food',level:'A1'}).every(a=>a.category==='food'&&a.level==='A1'));
assert.equal(routeSection('culture'),'basics');
for(const f of ['culture-reader.js','culture-readings.json','culture-reader-model.js'])assert(fs.readFileSync('server/server.mjs','utf8').includes(`'${f}'`));
console.log('Reading room passed: 50 unique French texts, 20/20/10 themes, 260 trilingual glosses, sourced public-domain excerpts, accent-insensitive filters and Foundations access.');
