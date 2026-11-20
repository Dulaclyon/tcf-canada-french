import {messages} from './ui-locales.js';
export const LANGUAGE_KEY='tcf-interface-language-v1';
const languages=new Set(['en','zh-CN','zh-TW']);
let language='en';try{const saved=localStorage.getItem(LANGUAGE_KEY);if(languages.has(saved))language=saved;}catch{}
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const terms=new RegExp(Object.keys(messages).sort((a,b)=>b.length-a.length).map(escape).join('|'),'gu');
const choose=(en,tw,zh)=>language==='en'?en:language==='zh-TW'?tw:zh;
export function translate(source,locale=language){
 if(locale==='zh-CN')return source;
 if(messages[source])return messages[source][locale]||source;
 const old=language;language=locale;
 let text=source;
 const rules=[
 [/本题不区分重音。/gu,()=>choose('Accents are not checked for this question.','本題不區分重音。')],
 [/(\d+)\s*道待复习错题/gu,(_,n)=>choose(`${n} mistakes to review`,`${n} 道待複習錯題`)],
 [/(\d+)\s*项收藏/gu,(_,n)=>choose(`${n} bookmarks`,`${n} 項收藏`)],
 [/答对\s*(\d+)\s*题/gu,(_,n)=>choose(`${n} correct`,`${n} 題答對`)],
 [/评语保存于\s*/gu,()=>choose('Feedback saved on ','評語儲存於 ')],
 [/第\s*(\d+)\s*课/gu,(_,n)=>choose(`Lesson ${n}`,`第 ${n} 課`)],
 [/第\s*(\d+)\s*组/gu,(_,n)=>choose(`Set ${n}`,`第 ${n} 組`)],
 [/第\s*(\d+)\s*题/gu,(_,n)=>choose(`Question ${n}`,`第 ${n} 題`)],
 [/已完成\s*(\d+)\s*\/\s*(\d+)\s*题/gu,(_,a,b)=>choose(`Completed ${a} / ${b} questions`,`已完成 ${a} / ${b} 題`)],
 [/任务\s*(\d+)/gu,(_,n)=>choose(`Task ${n}`,`任務 ${n}`)],
 [/(\d+)\s*个单元/gu,(_,n)=>choose(`${n} units`,`${n} 個單元`)],
 [/(\d+)\s*道练习题/gu,(_,n)=>choose(`${n} questions`,`${n} 道練習題`)],
 [/(\d+)\s*组已完成/gu,(_,n)=>choose(`${n} sets completed`,`${n} 組已完成`)],
 [/(\d+)\s*题已作答/gu,(_,n)=>choose(`${n} questions answered`,`${n} 題已作答`)],
 [/已作答\s*(\d+)\s*\/\s*(\d+)\s*题/gu,(_,a,b)=>choose(`Answered ${a} / ${b} questions`,`已作答 ${a} / ${b} 題`)],
 [/已显示\s*(\d+)\s*份作文/gu,(_,n)=>choose(`${n} essays shown`,`已顯示 ${n} 份作文`)],
 [/(\d+)\s*词/gu,(_,n)=>choose(`${n} words`,`${n} 詞`)],
 [/(\d+)\s*秒/gu,(_,n)=>choose(`${n} seconds`,`${n} 秒`)],
 [/另有\s*(\d+)\s*组/gu,(_,n)=>choose(`${n} more sets`,`另有 ${n} 組`)],
 [/本课知识点 · 共\s*(\d+)\s*个/gu,(_,n)=>choose(`Topics · ${n}`,`本課知識點 · 共 ${n} 個`)],
 [/知识点\s*(\d+)\s*\/\s*(\d+)/gu,(_,a,b)=>choose(`Topic ${a} / ${b}`,`知識點 ${a} / ${b}`)],
 [/确认(重置密码|停用|启用)：/gu,(_,action)=>choose(`Confirm ${messages[action]?.en||action}: `,`確認${messages[action]?.['zh-TW']||action}：`)],
 ];
 for(const [pattern,replacement] of rules)text=text.replace(pattern,replacement);
 text=text.replace(terms,(key,offset,whole)=>{
  // Never replace a dictionary fragment inside an untranslated Chinese phrase.
  const han=/[\u3400-\u9fff]/u;
  if((han.test(key[0])&&han.test(whole[offset-1]||''))||(han.test(key.at(-1))&&han.test(whole[offset+key.length]||'')))return key;
  return messages[key]?.[locale]||key;
 });
 language=old;return text;
}
const originals=new WeakMap(),attributes=new WeakMap();
const protectedContent='.courseware-text,.map-reading,.lesson-passage,.lesson-examples,.lesson-vocabulary,.article-notes,.article-body,.article-paragraph,.example,.translation,.submission-text,.bank-source-text,.bank-transcript,.bank-prompt,[data-i18n-skip],[lang="fr"]';
const interfaceLabels='[data-ui-label],[data-topic-label],.course-catalog h3,.next-lesson h2,.lesson h1,.lesson h2,.lesson h3,.lesson h4,.lesson th[scope=col],.lesson thead th,.lesson caption,.lesson figcaption,.lesson summary,.supplement-pitfall strong';
function skip(element){if(element?.closest(interfaceLabels))return false;if(element?.closest('.submission-title,.map-node,.next-lesson p'))return true;if(!element||element.closest('script,style,textarea,.language-control'))return true;if(element.closest(protectedContent)&&!element.closest('button,a,select,option'))return true;return false;}
function translateText(node){if(skip(node.parentElement)||!node.nodeValue.trim())return;const value=node.nodeValue;let saved=originals.get(node);if(!saved||saved.last!==value)saved={source:value};saved.last=translate(saved.source);originals.set(node,saved);if(value!==saved.last)node.nodeValue=saved.last;}
function translateAttributes(element){if(element.closest('script,style,.language-control'))return;if(element.closest(protectedContent)&&!element.matches('textarea,input,button,a,select,option'))return;let records=attributes.get(element);if(!records){records={};attributes.set(element,records);}for(const name of ['aria-label','placeholder','title','alt']){if(!element.hasAttribute(name))continue;const value=element.getAttribute(name);let saved=records[name];if(!saved||saved.last!==value)saved={source:value};saved.last=translate(saved.source);records[name]=saved;if(saved.last!==value)element.setAttribute(name,saved.last);}}
let observer,scheduled=false;
function render(){
 observer?.disconnect();
 document.documentElement.lang=language==='zh-TW'?'zh-Hant-TW':language==='zh-CN'?'zh-Hans':'en';
 const picker=document.getElementById('interface-language');if(picker)picker.value=language;
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode())translateText(walker.currentNode);
 document.body.querySelectorAll('[aria-label],[placeholder],[title],[alt]').forEach(translateAttributes);
 const title=document.querySelector('title');if(title?.firstChild)translateText(title.firstChild);
 observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});
}
export function setLanguage(value){if(!languages.has(value))return;language=value;try{localStorage.setItem(LANGUAGE_KEY,value);}catch{}render();document.dispatchEvent(new CustomEvent('interface-language-change',{detail:language}));}
export function headerActions(){
 const header=document.querySelector('header');if(!header)return document.body;
 let actions=header.querySelector('.header-actions');if(!actions){actions=document.createElement('div');actions.className='header-actions';header.append(actions);}return actions;
}
function init(){
 const container=document.createElement('label');container.className='language-control';container.setAttribute('aria-label','Interface language');
 const select=document.createElement('select');select.id='interface-language';select.setAttribute('aria-label','Interface language');
 for(const [value,label] of [['en','English'],['zh-CN','简体中文'],['zh-TW','繁體中文']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
 container.append(select);headerActions().append(container);select.onchange=()=>setLanguage(select.value);
 observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;render();});});render();
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
