import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {renderGrammar} from '../grammar-layout.js';
import {soundGroups,renderSoundGroups,speechExamples,speechScript} from '../pronunciation-layout.js';
import {pronunciationCatalog} from './pronunciation-catalog.mjs';
const catalog=pronunciationCatalog(),manifest=JSON.parse(fs.readFileSync('pronunciation-audio/manifest.json','utf8'));
assert.equal(manifest.catalogVersion,2);
assert.deepEqual(Object.keys(manifest.clips).sort(),Object.keys(catalog).sort());
const normalize=s=>s.normalize('NFKC').toLocaleLowerCase('fr').replace(/[^\p{L}\p{N}]/gu,'');
for(const [key,expected] of Object.entries(catalog)){
 const clip=manifest.clips[key];assert.deepEqual(clip.examples,expected.examples,key+' must read displayed examples in order');assert.equal(clip.text,expected.text,key+' speech must not drift from lesson content');assert.equal(clip.fingerprint,expected.fingerprint);
 const bytes=fs.readFileSync('pronunciation-audio/'+clip.file);assert(bytes.length>1000);assert(clip.duration>.3);assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256,key+' file must match audited manifest');
 assert(clip.boundaries.length,key+' must contain synthesis word timings');assert.equal(normalize(clip.boundaries.map(b=>b.text).join(' ')),normalize(clip.text),key+' synthesis text must match exact requested words');
}
for(const [key,group] of Object.entries(soundGroups)){
 assert(group.audio,key+' needs a recording');const html=renderSoundGroups([key]);assert.equal((html.match(/data-phonics-audio/g)||[]).length,1);assert(html.includes(`/${group.audio}.mp3?v=`));assert(html.includes('preload="none"'));assert(!html.includes('autoplay'));
 const displayed=[...html.matchAll(/<dt lang="fr">([^<]*)<\/dt>/gu)].map(m=>m[1].replace(/&#39;/g,"'").replace(/&amp;/g,'&'));
 assert.deepEqual(speechExamples(displayed.map(fr=>({fr}))),manifest.clips[group.audio].examples,key+' recording and displayed word order must agree');
}
const groups=[['é; 单词末尾的 es; ez; er','e'],['et 在单字末尾，ai, è, ê; ei','open-e'],['i, î, y','i'],['oi','wa'],['tion 的发音','tion'],['发音部分 in, im','nasal-in'],['eau / au / aux','o'],['u / eux','eu'],['[j]','j'],['ou','ou']];
for(const [heading,key] of groups){const html=renderGrammar(heading+'\nexemple','发音');assert(html.includes('pronunciation-audio/'+key+'.mp3'),heading);}
assert.deepEqual(manifest.clips.eu.examples,['feu','peu','eux','heureux']);assert(!manifest.clips.eu.text.includes('Sœur'));
assert.deepEqual(manifest.clips.y.examples,['rue','roue']);assert.deepEqual(manifest.clips.sion.examples,['la décision']);assert(!manifest.clips.tion.examples.includes('la décision'));
console.log(`${Object.keys(soundGroups).length} sound groups and ${Object.keys(catalog).length} saved clips match displayed examples, synthesis word timings and audio hashes; missing [y]/[zjɔ̃] recordings are covered.`);
