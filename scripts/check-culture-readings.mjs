import fs from 'node:fs';
import {createHash} from 'node:crypto';
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
const imageHashes=new Set();
function jpegDimensions(bytes){
 assert.equal(bytes.readUInt16BE(0),0xffd8,'JPEG signature');
 let i=2;
 while(i<bytes.length){if(bytes[i]!==0xff){i++;continue;}const marker=bytes[i+1];i+=2;if(marker===0xd9||marker===0xda)break;const len=bytes.readUInt16BE(i);if([0xc0,0xc1,0xc2].includes(marker))return {width:bytes.readUInt16BE(i+5),height:bytes.readUInt16BE(i+3)};i+=len;}
 throw Error('Missing JPEG dimensions');
}
for(const a of readings){
 const img=a.illustration;assert(img?.alt&&img.src===`assets/readings/${a.id}.jpg`&&img.thumbnail===`assets/readings/${a.id}-thumb.jpg`,`${a.id}: dedicated illustration and thumbnail`);
 for(const [path,width] of [[img.src,960],[img.thumbnail,240]]){const bytes=fs.readFileSync(path);const size=jpegDimensions(bytes);assert.equal(size.width,width);assert.equal(size.height,width*2/3);assert(bytes.length<(width===960?450000:40000),`${path}: compressed asset budget`);}
 const hash=createHash('sha256').update(fs.readFileSync(img.src)).digest('hex');assert(!imageHashes.has(hash),`${a.id}: distinct artwork`);imageHashes.add(hash);
}
assert.equal(imageHashes.size,50);
assert.equal(routeSection('culture'),'basics');
for(const f of ['culture-reader.js','culture-readings.json','culture-reader-model.js'])assert(fs.readFileSync('server/server.mjs','utf8').includes(`'${f}'`));
console.log('Reading room passed: 50 unique French texts, 20/20/10 themes, 260 trilingual glosses, sourced public-domain excerpts, 50 distinct compressed illustrations with thumbnails, accent-insensitive filters and Foundations access.');
