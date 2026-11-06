import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderGrammar} from '../grammar-layout.js';
const plain=html=>html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const canonical=s=>s.replace(/[\s→–—\-•·]/gu,'');
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
