import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderGrammar,renderArticle,isReadingLabel,polishReadingChinese} from '../grammar-layout.js';
import {buildLessonFlow} from '../lesson-flow.js';

const plain=html=>html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const canonical=s=>s.replace(/[\s→←–—\-•·]/gu,'');
const conjugationText=s=>s.replace(/[,;，；:]|单数|复数/gu,'').replace(/Être/gu,'Etre');
const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
let checked=0;
for(const m of materials)for(const p of m.pages)for(const b of p.sections){
 const html=renderGrammar(b.text,b.title);
 const rendered=canonical(plain(html));
 const lines=b.text.split('\n').map(x=>x.trim()).filter(Boolean);
 if(lines[0]===b.title.trim())lines.shift();
 for(const line of lines){assert(rendered.includes(canonical(line)) || (html.includes('class="conjugation-card"') && conjugationText(rendered).includes(conjugationText(canonical(line)))),`${m.id} / ${b.title}: lost text ${line}`);checked++;}
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
const readingText=s=>canonical(s.replace(/（下次）|（下次[：:]\s*/gu,'')).replace(/[()（）]/gu,'');
for(const m of materials)for(const p of m.pages)for(const b of p.sections){const html=readingText(plain(renderArticle(b.text)));for(const line of polishReadingChinese(b.text).split('\n').filter(x=>x.trim()&&!isReadingLabel(x)))assert(conjugationText(html).includes(conjugationText(readingText(line))),`${m.id}: article reflow must preserve source text: ${line}`);}
console.log('Article soft-wrap reflow, dialogue boundaries and source preservation passed.');

const withNotes=renderArticle("Hier, je suis arrivé à la gare.\nLe train était déjà parti.\nêtre en retard – 迟到\nj’étais ← être（我是）");
assert(withNotes.includes('class="article-notes"'));
assert(!withNotes.split('class="article-notes"')[0].includes('être en retard'),'Glossary must not be inside the prose paragraph');
assert(withNotes.includes('词汇与句型')&&withNotes.includes('grammar-table'));
console.log('Post-reading vocabulary and sentence notes are distinct from article prose.');

const annotatedDialogue=renderArticle(find(3,'对话部分').text);
assert.equal((annotatedDialogue.match(/class="article-notes"/g)||[]).length,2);
assert.match(plain(annotatedDialogue), /词汇与句型备注.*游泳池.*Cécile :/u);
assert.match(plain(annotatedDialogue), /là-bas \? （là-bas）/u);

assert.match(plain(annotatedDialogue), /piscine n\.f （游泳池）/u);
assert.match(plain(annotatedDialogue), /Je suis chez moi\. （我在家。）/u);
assert.match(plain(annotatedDialogue), /^Marc/u);
const inlineGlosses=plain(renderArticle('Paris est plus grande que Lyon 巴黎比里昂大. Lyon est belle（里昂很美） !'));
assert.match(inlineGlosses, /Lyon （巴黎比里昂大）\. Lyon est belle（里昂很美）/u);
assert.match(plain(annotatedDialogue), /（在……家里）/u);
assert.match(plain(annotatedDialogue), /（和……一起）/u);
assert.match(plain(annotatedDialogue), /（可以指“你们”，也可礼貌地称呼一个人，译为“您”。）/u);

const courses=JSON.parse(fs.readFileSync('src/data/courses.json','utf8'));
const articles=courses.flatMap(c=>c.article&&/原文|对话/u.test(c.article.kind)?[c.article]:[]);
const readingPassages=[...materials.flatMap(m=>buildLessonFlow(m,articles).readings),...articles];
for(const passage of readingPassages){
 const body=renderArticle(passage.text)
   .replace(/<h3 class="article-subtitle">.*?<\/h3>|<h3 lang="zh-CN">词汇与句型备注<\/h3>/gu,'')
   .replace(/<(?:h3 class="grammar-subhead"|h3 class="grammar-topic-term"|p class="grammar-rule")>(?:<span class="grammar-zh">)?(?:第[一二三]类动词|代动词|动词短语|副词短语|介词短语|问时间|充满)[：:]?(?:<\/span>)?<\/(?:h3|p)>/gu,'');
 let unmarked=plain(body.replace(/<th scope="col">(?:法语|英文)<\/th>/gu,'').replace(/<h4 lang="zh-CN">(?:单数|复数)<\/h4>/gu,''));
 while(/\([^()（）]*\)|（[^()（）]*）/u.test(unmarked))unmarked=unmarked.replace(/\([^()（）]*\)|（[^()（）]*）/gu,'');
 assert(!/[\u3400-\u9fff]/u.test(unmarked),`Unmarked Chinese in ${passage.title}: ${unmarked}`);
}
console.log(`Chinese glosses are bracketed in all ${readingPassages.length} rendered reading passages.`);

const separatePrepositions=renderGrammar("à Paris 在巴黎\nà la maison 没有缩合\nchez 在家",'介词');
assert.equal((separatePrepositions.match(/class="grammar-bilingual/g)||[]).length,2,'Independent bilingual entries must remain separate');
const wrappedGloss=plain(renderGrammar("Il est arrivé en retard. 他迟到了，这件事让大家很惊\n讶。",'例句'));
assert(wrappedGloss.includes('他迟到了，这件事让大家很惊讶。'),'A wrapped Chinese tail belongs to its original translation');
