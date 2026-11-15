import assert from 'node:assert/strict';import fs from 'node:fs';import {renderGrammar} from '../grammar-layout.js';
const groups=[['é; 单词末尾的 es; ez; er','e'],['et 在单字末尾，ai, è, ê; ei','open-e'],['i, î, y','i'],['oi','wa'],['tion 的发音','tion'],['发音部分 in, im','nasal-in'],['eau / au / aux','o'],['u / eux','eu'],['[j]','j'],['ou','ou']];
for(const [heading,key] of groups){const html=renderGrammar(heading+'\nexemple','发音');assert.ok(html.includes('pronunciation-audio/'+key+'.mp3'),heading);assert.ok(html.includes('preload="none"'));assert.ok(!html.includes('autoplay'));assert.ok(fs.statSync('pronunciation-audio/'+key+'.mp3').size>1000);}
console.log('Ten sound groups have saved, click-to-play audio; no autoplay or automatic audio downloads.');
