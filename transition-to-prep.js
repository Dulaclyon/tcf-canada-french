import {LANGUAGE_KEY} from './i18n.js';
import {storage} from './student-storage.js';
import {transitionVerbs,transitionPrepositions,transitionPhrases} from './transition-content.js';
import {prepositionGroups} from './transition-prepositions.js';
import {transitionPhraseGroups} from './transition-phrases.js';
import {verbExamples} from './transition-verb-examples.js';
import {TRANSITION_PROGRESS_KEY,transitionItemId,transitionMetric} from './transition-progress.js';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let locale='en';try{locale=localStorage.getItem(LANGUAGE_KEY)||'en';}catch{}
const text=(en,zh,tw)=>locale==='zh-CN'?zh:locale==='zh-TW'?tw:en;
const meaning=value=>value[locale]||value.en;
const tabs=()=>[['verbs',text('Conjugation','动词变位','動詞變位')],['prepositions',text('Prepositions','介词短语','介詞短語')],['phrases',text('Useful phrases','常用短语','常用短語')]];
const tenses=()=>[['present',text('Present','现在时','現在式')],['past',text('Passé composé','复合过去时','複合過去式')],['imperfect',text('Imperfect','未完成过去时','未完成過去式')],['pluperfect',text('Pluperfect','愈过去时','愈過去式')],['future',text('Simple future','简单将来时','簡單未來式')],['conditional',text('Present conditional','现在条件式','現在條件式')]];
let activePart='verbs',activeMain;
let completed=new Set();try{completed=new Set(JSON.parse(storage.getItem(TRANSITION_PROGRESS_KEY)||'{"completed":[]}').completed);}catch{}
const pattern=value=>value.replace(/quelqu’un/gu,text('someone','某人','某人')).replace(/quelque chose/gu,text('something','某物','某物')).replace(/\bnom\b/gu,text('noun','名词','名詞')).replace(/\binfinitif\b/gu,text('infinitive','动词原形','動詞原形')).replace(/\bdurée\b/gu,text('duration','时长','時長')).replace(/\bpersonne\b/gu,text('person','人','人')).replace(/\bproposition\b/gu,text('clause','从句','子句'));
const check=(kind,item)=>{const id=transitionItemId(kind,item);return `<label class="transition-complete"><input type="checkbox" data-transition-complete="${esc(id)}" ${completed.has(id)?'checked':''} aria-label="${esc(text('Completed: ','已完成：','已完成：')+(item.phrase||item.id))}"><span>${text('Completed','已完成','已完成')}</span></label>`;};
const examples=list=>`<ol class="transition-visible-examples">${list.map(e=>`<li lang="fr">${esc(e)}</li>`).join('')}</ol>`;
function progressHTML(){const all=transitionMetric({completed:[...completed]});const rows=activePart==='verbs'?transitionVerbs:activePart==='prepositions'?transitionPrepositions:transitionPhrases;const done=rows.filter(r=>completed.has(transitionItemId(activePart,r))).length;return `<div class="transition-progress-summary" role="status"><span>${text('This tab','本页学习','本頁學習')} <strong>${done} / ${rows.length}</strong></span><progress max="${rows.length}" value="${done}" aria-label="${text('Progress in this tab','本页学习进度','本頁學習進度')}"></progress><span>${text('Overall','总进度','總進度')} <strong>${all.percent}%</strong></span></div>`;}
function verbHTML(){
 const sorted=[...transitionVerbs].sort((a,b)=>a.id.localeCompare(b.id,'fr'));
 const letter=v=>v.id.normalize('NFD').replace(/\p{M}/gu,'').charAt(0).toUpperCase();
 const letters=[...new Set(sorted.map(letter))];let previous='';
 return `<nav class="transition-jump" aria-label="${text('Verb index','动词索引','動詞索引')}">${letters.map(l=>`<a href="#transition-letter-${l}">${l}</a>`).join('')}</nav><p class="transition-agreement-note">${text('Parentheses indicate gender and number variants. Examples use a specific form.','括号表示阴阳性、单复数变化；例句使用具体形式。','括號表示陰陽性、單複數變化；例句使用具體形式。')}</p>${sorted.map((verb,index)=>{const l=letter(verb),heading=l!==previous?`<h2 class="transition-letter" id="transition-letter-${l}">${l}</h2>`:'';previous=l;return `${heading}<article class="transition-verb-block" data-transition-item="${esc(transitionItemId('verbs',verb))}"><div class="transition-item-heading"><h3><span class="transition-item-number">${String(index+1).padStart(2,'0')}</span> <span lang="fr">${esc(verb.id)}</span><small>${esc(meaning(verb.meaning))}</small></h3>${check('verbs',verb)}</div><div class="transition-table-wrap" tabindex="0" role="region" aria-label="${esc(verb.id)}"><table class="transition-table transition-all-tenses"><thead><tr><th scope="col">${text('Subject','主语','主詞')}</th>${tenses().map(([,label])=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${['je / j’','tu','il / elle','nous','vous','ils / elles'].map((subject,i)=>`<tr><th scope="row" lang="fr">${subject}</th>${tenses().map(([tense])=>`<td lang="fr">${esc(verb.forms[tense][i])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${verb.note?`<p class="transition-usage">${esc(meaning(verb.note))}</p>`:''}${examples(verbExamples[verb.id]||[verb.example])}</article>`;}).join('')}`;
}
function phrasesHTML(rows){const groups=activePart==='prepositions'?prepositionGroups:transitionPhraseGroups;return `<nav class="transition-jump" aria-label="${text('Topic index','主题索引','主題索引')}">${groups.map(g=>`<a href="#transition-group-${g.id}">${esc(meaning(g.title))}</a>`).join('')}</nav>${groups.map(group=>`<section class="transition-topic-group" id="transition-group-${group.id}"><h2>${esc(meaning(group.title))}</h2>${rows.filter(r=>r.group===group.id).map(entry=>`<article class="transition-reference-entry" data-transition-item="${esc(transitionItemId(activePart,entry))}"><div class="transition-item-heading"><h3><span lang="fr">${esc(entry.phrase)}</span><small>${esc(meaning(entry.meaning))}</small></h3>${check(activePart,entry)}</div><p class="transition-pattern">${esc(pattern(entry.pattern))}</p>${entry.note?`<p class="transition-usage">${esc(meaning(entry.note))}</p>`:''}${examples(entry.examples)}</article>`).join('')}</section>`).join('')}`;}
export function renderTransition(main,part='verbs'){
 activeMain=main;
 // In-page index links preserve the selected tab and every visible item.
 if(part.startsWith('transition-')){document.getElementById(part)?.scrollIntoView();return;}
 activePart=tabs().some(([id])=>id===part)?part:'verbs';
 main.innerHTML=`<section class="transition-page" data-transition data-i18n-skip><h1>${text('Transition to Prep','备考过渡','備考過渡')}</h1><nav class="transition-tabs" aria-label="${text('Transition topics','过渡学习分类','過渡學習分類')}">${tabs().map(([id,label])=>`<a href="#transition/${id}" ${id===activePart?'aria-current="page"':''}>${label}</a>`).join('')}</nav><div data-transition-progress>${progressHTML()}</div><section class="card transition-content" aria-label="${esc(tabs().find(([id])=>id===activePart)[1])}">${activePart==='verbs'?verbHTML():phrasesHTML(activePart==='prepositions'?transitionPrepositions:transitionPhrases)}</section><p class="transition-save-status" role="status" aria-live="polite"></p></section>`;
 // Jump buttons scroll locally, without replacing the app route.
 main.querySelectorAll('.transition-jump a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();main.querySelector(a.getAttribute('href'))?.scrollIntoView({block:'start'});}));
 main.querySelectorAll('[data-transition-complete]').forEach(input=>input.addEventListener('change',async()=>{
  const id=input.dataset.transitionComplete;if(input.checked)completed.add(id);else completed.delete(id);
  main.querySelector('[data-transition-progress]').innerHTML=progressHTML();
  const status=main.querySelector('.transition-save-status');status.textContent=text('Saving…','正在保存…','正在儲存…');
  const saved=await storage.setItem(TRANSITION_PROGRESS_KEY,JSON.stringify({completed:[...completed]}));
  status.textContent=saved?text('Progress saved','进度已保存','進度已儲存'):text('Progress could not be saved. Use Retry in the account menu.','进度保存失败，请在账号菜单重试保存。','進度儲存失敗，請在帳號選單重試儲存。');
 }));
}
if(typeof document!=='undefined')document.addEventListener('interface-language-change',event=>{locale=event.detail;if(activeMain?.querySelector('[data-transition]'))renderTransition(activeMain,activePart);});
