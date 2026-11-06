import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderGrammar,renderArticle} from '../grammar-layout.js';
const plain=html=>html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const canonical=s=>s.replace(/[\s→←–—\-•·]/gu,'');
const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
let checked=0;
for(const m of materials)for(const p of m.pages)for(const b of p.sections){
 const rendered=canonical(plain(renderGrammar(b.text,b.title)));
 const lines=b.text.split('\n').map(x=>x.trim()).filter(Boolean);
 if(lines[0]===b.title.trim())lines.shift();
 for(const line of lines){assert(rendered.includes(canonical(line)),`${m.id} / ${b.title}: lost text ${line}`);checked++;}
}
assert(renderGrammar('<img src=x onerror=alert(1)>').includes('&lt;img'));
assert(!renderGrammar('<script>alert(1)</script>').includes('<script>'));
const find=(n,t)=>materials.find(m=>m.lesson===n).pages.flatMap(p=>p.sections).find(b=>b.title===t);
assert(renderGrammar(find(18,'直接宾语代词').text,'直接宾语代词').includes('grammar-table'));
assert(renderGrammar(find(23,'si + 现在时').text,'si + 现在时').includes('grammar-formula'));
assert(renderGrammar(find(2,'一般疑问句').text,'一般疑问句').includes('grammar-transform'));
console.log(`Grammar layouts retain ${checked} original source lines; pronoun charts, formulas, transformations and HTML escaping passed.`);

assert(!renderGrammar(find(2,'être').text,'être').includes('grammar-table'), 'Eight full-sentence examples must not be misclassified as a six-person conjugation chart');

const reflow=renderArticle("Je lis un livre\nprès de la fenêtre.\nIl raconte une histoire\ntrès intéressante.");
assert.equal((reflow.match(/class="article-paragraph/g)||[]).length,1,'PDF wraps and sentence endings must not become separate paragraphs');
assert(plain(reflow).includes('Je lis un livre près de la fenêtre. Il raconte une histoire très intéressante.'));
assert.equal((renderArticle('— Bonjour.\n— Bonjour !').match(/article-dialogue/g)||[]).length,2,'Dialogue turns stay separate');
for(const m of materials)for(const p of m.pages)for(const b of p.sections){const html=canonical(plain(renderArticle(b.text)));for(const line of b.text.split('\n').filter(x=>x.trim()))assert(html.includes(canonical(line)),`${m.id}: article reflow must preserve source text`);}
console.log('Article soft-wrap reflow, dialogue boundaries and source preservation passed.');

const withNotes=renderArticle("Hier, je suis arrivé à la gare.\nLe train était déjà parti.\nêtre en retard – 迟到\nj’étais ← être（我是）");
assert(withNotes.includes('class="article-notes"'));
assert(!withNotes.split('class="article-notes"')[0].includes('être en retard'),'Glossary must not be inside the prose paragraph');
assert(withNotes.includes('词汇与句型')&&withNotes.includes('lexical-row'));
console.log('Post-reading vocabulary and sentence notes are distinct from article prose.');
