import {pronunciationKeys} from '../pronunciation-layout.js';
import {correctTeachingText} from '../course-editorial.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderGrammar,renderArticle,isReadingLabel,polishReadingChinese} from '../grammar-layout.js';
import {buildLessonFlow} from '../lesson-flow.js';

const plain=html=>html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const canonical=s=>s.replace(/[\s→←–—\->•·]/gu,'');
const conjugationText=s=>s.replace(/[,;，；:]|单数|复数/gu,'').replace(/Être/gu,'Etre');
const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
let checked=0;
for(const m of materials)for(const p of m.pages)for(const b of p.sections){
 const html=renderGrammar(b.text,b.title);
 const rendered=canonical(plain(html));
 if(/^(?:phonics|发音)$/iu.test(b.title)&&pronunciationKeys(b.text).length){assert(html.includes('phonics-word-list'));continue;}
 const lines=correctTeachingText(b.text).split('\n').map(x=>x.trim()).filter(Boolean);
 if(lines[0]===b.title.trim())lines.shift();
 for(const line of lines){const noun=line.match(/^((?:Un|Une)\s+.+?)\s*-{2,}\s*((?:le|la)\s+[^-]+?)(?:\s*-{2,}.*)?$/u);if(noun){assert(rendered.includes(canonical(noun[1]))&&rendered.includes(canonical(noun[2])));checked++;continue;}const dictionary=line.match(/^(.+?\((?:n\.|vi\.|vt\.|adj\.|interrogatif)\))\s*-\s*/u);if(dictionary){assert(rendered.includes(canonical(dictionary[1])),line);checked++;continue;}const fragments=/^Je\s*-+ais|^nous\s*-+ions|^ils\s*-+aient/u.test(line)?line.split(/[,，]/u).filter(Boolean):[line];for(const fragment of fragments)assert(rendered.includes(canonical(fragment)) || (html.includes('class="conjugation-card"') && conjugationText(rendered).includes(conjugationText(canonical(fragment)))),`${m.id} / ${b.title}: lost text ${fragment}`);checked++;}
}
assert(renderGrammar('<img src=x onerror=alert(1)>').includes('&lt;img'));
assert(!renderGrammar('<script>alert(1)</script>').includes('<script>'));
const find=(n,t)=>materials.find(m=>m.lesson===n).pages.flatMap(p=>p.sections).find(b=>b.title===t);
assert(renderGrammar(find(18,'直接宾语代词').text,'直接宾语代词').includes('grammar-table'));
assert(renderGrammar(find(23,'si + 现在时').text,'si + 现在时').includes('grammar-formula'));
assert(renderGrammar(find(2,'一般疑问句').text,'一般疑问句').includes('grammar-transform'));
console.log(`Grammar layouts retain ${checked} source lines with explicit editorial corrections; pronoun charts, formulas, transformations and HTML escaping passed.`);

assert(!renderGrammar(find(2,'être').text,'être').includes('grammar-table'), 'Eight full-sentence examples must not be misclassified as a six-person conjugation chart');

const reflow=renderArticle("Je lis un livre\nprès de la fenêtre.\nIl raconte une histoire\ntrès intéressante.");
assert.equal((reflow.match(/class="article-paragraph/g)||[]).length,1,'PDF wraps and sentence endings must not become separate paragraphs');
assert(plain(reflow).includes('Je lis un livre près de la fenêtre. Il raconte une histoire très intéressante.'));
assert.equal((renderArticle('— Bonjour.\n— Bonjour !').match(/article-dialogue/g)||[]).length,2,'Dialogue turns stay separate');
const readingText=s=>canonical(s.replace(/（下次）|（下次[：:]\s*/gu,'')).replace(/[()（）]/gu,'');
for(const m of materials)for(const p of m.pages)for(const b of p.sections){const html=readingText(plain(renderArticle(b.text)));for(const line of polishReadingChinese(correctTeachingText(b.text)).split('\n').filter(x=>x.trim()&&!isReadingLabel(x))){const noun=line.match(/^((?:Un|Une)\s+.+?)\s*-{2,}\s*((?:le|la)\s+[^-]+?)(?:\s*-{2,}.*)?$/u);if(noun){assert(html.includes(readingText(noun[1]))&&html.includes(readingText(noun[2])));continue;}const dictionary=line.match(/^(.+?\((?:n\.|vi\.|vt\.|adj\.|interrogatif)\))\s*-\s*/u);if(/^Je\s*-+ais|^nous\s*-+ions|^ils\s*-+aient/u.test(line)){for(const form of line.split(/[,，]/u).filter(Boolean))assert(conjugationText(html).includes(conjugationText(readingText(form))));continue;}assert(conjugationText(html).includes(conjugationText(readingText(dictionary?dictionary[1]:line))),`${m.id}: article reflow must preserve source text: ${line}`);}}
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
 let unmarked=plain(body.replace(/<thead>[\s\S]*?<\/thead>/gu,'').replace(/<th scope="col">(?:法语|英文)<\/th>/gu,'').replace(/<h4 lang="zh-CN">(?:单数|复数)<\/h4>/gu,''));
 while(/\([^()（）]*\)|（[^()（）]*）/u.test(unmarked))unmarked=unmarked.replace(/\([^()（）]*\)|（[^()（）]*）/gu,'');
 assert(!/[\u3400-\u9fff]/u.test(unmarked),`Unmarked Chinese in ${passage.title}: ${unmarked}`);
}
console.log(`Chinese glosses are bracketed in all ${readingPassages.length} rendered reading passages.`);

const separatePrepositions=renderGrammar("à Paris 在巴黎\nà la maison 没有缩合\nchez 在家",'介词');
assert.equal((separatePrepositions.match(/class="grammar-bilingual/g)||[]).length,2,'Independent bilingual entries must remain separate');
const wrappedGloss=plain(renderGrammar("Il est arrivé en retard. 他迟到了，这件事让大家很惊\n讶。",'例句'));
assert(wrappedGloss.includes('他迟到了，这件事让大家很惊讶。'),'A wrapped Chinese tail belongs to its original translation');

const phonics=renderGrammar(find(2,'phonics').text,'phonics');
assert(phonics.includes('data-sound="e"')&&phonics.includes('>mes</dt>'));
assert(!plain(phonics).includes('phonics é;'));
assert(!phonics.includes('原课件记法'));
console.log('Phonics use sound headings and individual word/meaning rows.');

for(const [heading,sample] of [['et 在单字末尾，ai, è, ê; ei','faire'],['i, î, y','île'],['oi','moi'],['tion 的发音','nation'],['发音部分 in, im','pain'],['eau / au / aux','eau'],['u / eux','feu'],['[j]','pied'],['ou','nous']]){
 const layout=renderGrammar(heading+'\n'+sample,'发音');
 assert(layout.includes('phonics-sound-heading')&&layout.includes('phonics-word-list')&&layout.includes(sample),heading+' must use the common sound, spelling and word layout');
}
assert(renderGrammar('tion 的发音\nla décision（决定）','发音').includes('[zjɔ̃]'));
console.log('Nine pronunciation groups use the shared spelling, sound and example structure.');

// Corrected note wording must still end a dialogue turn before conjugations begin.
const clockDialogue=renderArticle(find(4,'对话').text);
const dialogueTurns=html=>[...html.matchAll(/<p class="article-paragraph article-dialogue"[^>]*>([\s\S]*?)<\/p>/gu)].map(match=>plain(match[1]));
const turns=dialogueTurns(clockDialogue),lastBernard=turns.filter(t=>t.startsWith('Bernard')).at(-1);
assert.equal(lastBernard,'Bernard : À tout à l’heure.');
assert(!turns.some(t=>/赶紧|je me dépêche|问时间/u.test(t)),'Vocabulary, conjugation and headings stay outside speech');
assert(clockDialogue.includes('class="article-notes"')&&clockDialogue.includes('class="conjugation-card"'),'Conjugation has its own layout');
assert(plain(annotatedDialogue).includes("C&#39;est Annie DUFOUR")||plain(annotatedDialogue).includes("C'est Annie DUFOUR"),'Space before Annie');
assert(!annotatedDialogue.includes('estAnnie'),'No joined name');
assert(!dialogueTurns(annotatedDialogue).some(t=>/vous 可以|游泳池|prep\./u.test(t)),'Corrected vous note and vocabulary stay outside speech');
assert(!dialogueTurns(renderArticle('Paris et Lyon : laquelle est la plus attrayante ?')).length,'Article titles are not speakers');
assert(!dialogueTurns(renderArticle('Il m’a dit : « Bonjour. »')).length,'Reported speech is prose, not a named speaker');
const honte=renderArticle('Il m’a dit : « Je suis désolé. »\navoir honte (de qch / de qn / de + infinitif) = 为……感到羞耻');
assert(!plain(honte.split('class="article-notes"')[0]).includes('avoir honte'),'Short prose also separates a dictionary expression');
console.log('Annie spacing, corrected glossary boundaries, dialogue continuations and quoted-prose boundaries passed.');

const timeNotes=renderArticle("Annie : Merci.\nDéjà ---- Already\nheure----- time, hour");
assert(/Déjà<\/th><td>Already<\/td>/u.test(timeNotes)||/Déjà<\/td><td>Already<\/td>/u.test(timeNotes),'Separate glossary entries cannot merge after an English gloss');
