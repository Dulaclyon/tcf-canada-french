import assert from 'node:assert/strict';
import {transitionVerbs as verbs,transitionPrepositions as prep,transitionPhrases as phrases} from '../transition-content.js';
import {prepositionGroups} from '../transition-prepositions.js';
import {transitionPhraseGroups} from '../transition-phrases.js';
const languages=['en','zh-CN','zh-TW'];
assert.equal(verbs.length,53);assert.equal(new Set(verbs.map(v=>v.id)).size,verbs.length);
for(const v of verbs){for(const l of languages)assert.ok(v.meaning[l],`${v.id}: ${l}`);for(const tense of ['present','past','imperfect','pluperfect','future','conditional']){assert.equal(v.forms[tense].length,6);for(const form of v.forms[tense])assert.ok(form&&!/undefined|\p{Script=Han}/u.test(form),`${v.id}: ${tense}`);}}
const get=id=>verbs.find(v=>v.id===id).forms;
assert.equal(get('acquérir').future[0],'acquerrai');assert.equal(get('dire').present[4],'dites');
assert.equal(get('commencer').imperfect[3],'commencions');assert.equal(get('manger').imperfect[4],'mangiez');
assert.equal(get('se concentrer').present[4],'vous concentrez');assert.equal(get('se lever').pluperfect[0],'m’étais levé(e)');
assert.equal(get('s’habiller').present[0],'m’habille');assert.equal(get('sortir').past[0],'suis sorti(e)');
assert.equal(get('faire').pluperfect[3],'avions fait');
assert.equal(get('se souvenir').past[0],'me suis souvenu(e)');
assert.equal(get('s’efforcer').present[3],'nous efforçons');
assert.equal(get('se brosser les dents').past[5],'se sont brossé les dents');
assert.equal(prep.length,39);assert.equal(phrases.length,100);
for(const [rows,groups] of [[prep,prepositionGroups],[phrases,transitionPhraseGroups]]){
 assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);assert.equal(new Set(rows.map(r=>r.phrase)).size,rows.length);
 for(const r of rows){assert.ok(groups.some(g=>g.id===r.group));assert.equal(r.examples.length,3);for(const l of languages){assert.ok(r.meaning[l]);if(rows===prep)assert.ok(r.note[l]);}for(const e of r.examples)assert.ok(e.length>10&&!/\p{Script=Han}/u.test(e));}
}
for(const phrase of ['à côté de','près de','au bout de','le long de','au centre de','autour de','au coin de','afin de','avec','à cause de','grâce à','en raison de','faute de','à force de','compte tenu de'])assert.ok(prep.some(p=>p.phrase===phrase),phrase);
assert.ok(prep.find(p=>p.phrase==='faute de').examples.some(e=>e.includes('Faute de temps')));
assert.ok(prep.find(p=>p.phrase==='à force de').examples.some(e=>e.includes('À force d’efforts')));
console.log('Transition checks passed: 53 verbs × 6 tenses, pronoun/auxiliary/spelling regressions, 39 dedicated prepositions with 117 examples, and all 100 original phrases retained.');
