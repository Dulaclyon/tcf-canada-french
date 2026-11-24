import {LISTENING_MEMORY_KEY,LISTENING_MEMORY_LIMIT,memoryLength,trimMemory} from './listening-memory-model.js';
import {translate as t} from './i18n.js';
import {storage as studentStorage} from './student-storage.js';
import {SERIES,COMPLETION_KEY,normalizeExisting,getSetStatus,firstUnfinished,summarizeSets,sampleCompletedQuestions} from './bank-progress.js?v=1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PROGRESS_KEY='tcf-bank-progress-v1';
let generation=0,indexPromise;
function readObject(key){try{const value=JSON.parse(studentStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
function indexData(){if(!indexPromise)indexPromise=fetch('./bank/index.json').then(r=>{if(!r.ok)throw Error('题目暂时无法加载，请刷新重试。');return r.json();}).catch(e=>{indexPromise=null;throw e;});return indexPromise;}
export async function renderBank(main,kind,id,{existing=[],afterRender=()=>{},stopAudio=()=>{}}={}){
 const ticket=++generation;const title=kind==='listening'?'听力训练':'阅读训练';
 main.innerHTML=`<h1>${title}</h1><p role="status">正在加载题目…</p>`;
 try{
  const index=await indexData();if(ticket!==generation||!location.hash.startsWith('#'+kind))return;
  const originals=existing.map(p=>normalizeExisting(kind,p));
  const allSets=[...originals,...index.sets.filter(s=>s.kind===kind).sort((a,b)=>a.number.localeCompare(b.number,undefined,{numeric:true})||a.group.localeCompare(b.group))];
  let completed=readObject(COMPLETION_KEY);const progress=readObject(PROGRESS_KEY);const memories=kind==='listening'?readObject(LISTENING_MEMORY_KEY):{};
  let selected=allSets.find(s=>s.id===id)||firstUnfinished(originals.length?originals:allSets,completed);if(!selected)throw Error('暂无题目。');
  let set=selected,progressExpanded=false;
  if(selected.group!=='existing'){
   const response=await fetch('./bank/sets/'+selected.id+'.json');if(!response.ok)throw Error('本组题目暂时无法加载。');set=await response.json();
  }
  if(ticket!==generation||!location.hash.startsWith('#'+kind))return;
  const groupSets=allSets;
  const sourceLabel=item=>SERIES.find(([value])=>value===item.group)?.[1]||'';
  const setLabel=item=>'第 '+(allSets.findIndex(s=>s.id===item.id)+1)+' 组';let next=groupSets[groupSets.findIndex(s=>s.id===set.id)+1];
  let records=progress[set.id]&&typeof progress[set.id]==='object'&&!Array.isArray(progress[set.id])?progress[set.id]:{};progress[set.id]=records;let position=0,reviewQueue=null,reviewIndex=0,reviewBusy=false;const reviewAnswers=new Map(),setCache=new Map([...originals.map(item=>[item.id,item]),[set.id,set]]);
  const navigate=target=>{stopAudio();main.querySelector('audio')?.pause();location.hash=kind+'/'+target;};
  function boardHTML(){
   const columns=summarizeSets(groupSets,progress,completed),done=columns.completed.length;
   const percent=groupSets.length?Math.round(100*done/groupSets.length):0;
   const statuses=[['not-started','待开始'],['in-progress','学习中'],['completed','已完成']];
   return `<section class="progress-board progress-summary" aria-labelledby="bank-progress-title"><div class="progress-summary-heading"><h2 id="bank-progress-title">学习进度</h2><div class="progress-summary-total"><strong data-i18n-skip>${percent}%</strong><span>${done} / ${allSets.length} 组已完成</span></div></div><div class="progress-board-track" role="progressbar" aria-label="完成进度" aria-valuemin="0" aria-valuemax="${groupSets.length}" aria-valuenow="${done}" aria-valuetext="${percent}%"><i style="width:${percent}%"></i></div><div class="progress-summary-footer"><dl class="progress-summary-counts">${statuses.map(([status,label])=>`<div><dt>${label}</dt><dd data-i18n-skip>${columns[status].length}</dd></div>`).join('')}</dl><button type="button" class="progress-list-toggle" aria-expanded="${progressExpanded}" aria-controls="bank-progress-lists">${progressExpanded?'收起组别':'查看组别'}</button></div><div id="bank-progress-lists" class="progress-set-groups" ${progressExpanded?'':'hidden'}>${statuses.map(([status,label])=>`<section aria-label="${label}"><h3>${label}</h3>${columns[status].map(item=>`<a class="progress-set-row ${item.id===set.id?'current':''}" href="#${kind}/${esc(item.id)}" ${item.id===set.id?'aria-current="page"':''}><span><strong>${setLabel(item)}</strong><small>${esc(sourceLabel(item))}</small></span><span data-i18n-skip>${item.answered} / ${item.total}</span></a>`).join('')||'<p class="muted">暂无</p>'}</section>`).join('')}</div></section>`;
  }
  function bindProgressToggle(){const button=main.querySelector('.progress-list-toggle');if(!button)return;button.onclick=()=>{progressExpanded=!progressExpanded;button.setAttribute('aria-expanded',String(progressExpanded));button.textContent=progressExpanded?'收起组别':'查看组别';main.querySelector('#bank-progress-lists').hidden=!progressExpanded;};}
  const scoreText=()=>{if(reviewQueue)return `${reviewAnswers.size} / ${reviewQueue.length} 题已作答`;const state=getSetStatus(selected,progress,completed);const correct=set.questions.filter(q=>q.answer&&records[q.number]?.choice===q.answer).length;return `已作答 ${state.answered} / ${state.total} 题${set.answerComplete?' · 答对 '+correct+' 题':''}`;};
  function updateProgress(){
   main.querySelector('#bank-board').innerHTML=boardHTML();bindProgressToggle();main.querySelector('#bank-progress').textContent=scoreText();
   main.querySelectorAll('#bank-set option').forEach(option=>{const item=groupSets.find(s=>s.id===option.value);option.textContent=(completed[item.id]?'✓ ':'')+setLabel(item)+' · '+sourceLabel(item);});
   main.querySelector('#bank-random-review').disabled=!allSets.some(s=>completed[s.id]);main.querySelector('#bank-complete').checked=!!completed[set.id];main.querySelector('#bank-next-set').disabled=!next||!completed[set.id];
  }
  async function reviewMove(index){
   if(reviewBusy)return;reviewBusy=true;
   const ref=reviewQueue[index];
   try{
    let target=setCache.get(ref.setId);
    if(!target){const response=await fetch('./bank/sets/'+encodeURIComponent(ref.setId)+'.json');if(!response.ok)throw Error('本组题目暂时无法加载。');target=await response.json();setCache.set(ref.setId,target);}
    if(ticket!==generation||!location.hash.startsWith('#'+kind))return;
    stopAudio();main.querySelector('audio')?.pause();selected=allSets.find(s=>s.id===ref.setId);set=target;position=ref.index;reviewIndex=index;records=reviewAnswers.get(`${set.id}:${position}`)||{};draw();
   }catch{const status=main.querySelector('#bank-review-status');if(status)status.textContent='本组题目暂时无法加载。';}
   finally{reviewBusy=false;}
  }
  function draw(){
   const q=set.questions[position];const saved=records[q.number];
   main.innerHTML=`<h1>${title}</h1><div class="filters unified-selectors" ${reviewQueue?'hidden':''}><label for="bank-set">练习组</label><select id="bank-set">${groupSets.map(item=>`<option value="${esc(item.id)}" ${item.id===set.id?'selected':''}>${completed[item.id]?'✓ ':''}${setLabel(item)} · ${esc(sourceLabel(item))}</option>`).join('')}</select></div><div class="bank-review-controls"><button type="button" class="secondary" id="bank-random-review" ${allSets.some(s=>completed[s.id])?'':'disabled'}>随机复习</button><span id="bank-review-status" role="status">${reviewQueue?`${reviewIndex+1} / ${reviewQueue.length}`:'从已完成组别抽取 10 题'}</span>${reviewQueue?'<button type="button" class="secondary" id="bank-review-exit">返回练习组</button>':''}</div><div id="bank-board" ${reviewQueue?'hidden':''}>${boardHTML()}</div><section class="bank-active-set"><div class="bank-set-heading"><h2>${setLabel(set)}</h2><span class="bank-source-tag">${esc(sourceLabel(set))}</span></div><div class="filters"><label for="bank-question" ${reviewQueue?'hidden':''}>题目</label><select id="bank-question" ${reviewQueue?'hidden':''}>${set.questions.map((item,i)=>`<option value="${i}" ${i===position?'selected':''}>第 ${item.number} 题${records[item.number]?.choice?' · 已作答':''}</option>`).join('')}</select><span ${reviewQueue?'hidden':''}>${position+1} / ${set.questions.length}</span><span class="muted" id="bank-progress">${scoreText()}</span></div>${!set.answerComplete?'<p class="note">本套原答案表只有 38 项，对应 39 道题。为避免错配，本套暂不自动判分。</p>':''}<div class="bank-question-layout"><section class="card bank-stimulus"><h3>${kind==='listening'?'听力材料':'阅读材料'}</h3>${q.audio?`<audio controls preload="metadata" src="./${esc(q.audio)}" aria-label="第 ${q.number} 题原录音"></audio>`:''}${q.syntheticText?`<p class="muted">法语合成语音</p><div data-listening-text="${esc(q.syntheticText)}"></div>`:''}${q.images.map(src=>`<img class="bank-question-image" src="./${esc(src)}" alt="第 ${q.number} 题配图">`).join('')}<div class="bank-source-text" lang="fr">${q.body.split('\n').filter(Boolean).map(text=>`<p>${esc(text)}</p>`).join('')}</div>${q.transcript?`<details class="quiet-details"><summary>听力文本</summary><div class="bank-transcript" lang="fr">${q.transcript.split('\n').filter(Boolean).map(text=>`<p>${esc(text)}</p>`).join('')}</div></details>`:kind==='listening'?'<p class="muted">原资料未附本题听力文本。</p>':''}</section><section class="card"><h3>第 ${q.number} 题</h3>${q.prompt?`<p class="bank-prompt" lang="fr">${esc(q.prompt)}</p>`:''}<form id="bank-answer"><fieldset class="bank-options"><legend lang="fr">Choisissez une réponse.</legend>${q.options.map(o=>`<label class="option"><input type="radio" name="bank-choice" value="${esc(o.key)}" ${saved?.choice===o.key?'checked':''}><span lang="fr">${esc(o.key)}. ${esc(/^Proposition\s+[ABCD]$/i.test(o.text)?'(écoutez la proposition)':o.text)}</span></label>`).join('')}</fieldset><button type="submit" class="primary">提交答案</button><div id="bank-feedback" role="status"></div></form>${kind==='listening'?`<div class="listening-memory"><label for="listening-memory">本题记忆点</label><textarea id="listening-memory" rows="2" maxlength="${LISTENING_MEMORY_LIMIT*2}" placeholder="关键词、易错点，最多 100 字" aria-describedby="listening-memory-count listening-memory-status" data-i18n-skip>${esc(memories[set.id+':'+q.number]||'')}</textarea><div class="listening-memory-footer"><small id="listening-memory-count" data-i18n-skip>${memoryLength(memories[set.id+':'+q.number]||'')} / ${LISTENING_MEMORY_LIMIT}</small><small id="listening-memory-status" role="status"></small></div></div>`:''}<div class="practice-navigation"><button type="button" class="secondary" id="bank-prev" ${position===0?'disabled':''}>上一题</button><span>${reviewQueue?reviewIndex+1:position+1} / ${reviewQueue?reviewQueue.length:set.questions.length}</span><button type="button" class="secondary" id="bank-next" ${position===set.questions.length-1?'disabled':''}>下一题</button></div></section></div><div class="bank-completion" ${reviewQueue?'hidden':''}><label><input type="checkbox" id="bank-complete" ${completed[set.id]?'checked':''}> 本组已完成</label><button type="button" class="primary" id="bank-next-set" ${!next||!completed[set.id]?'disabled':''}>${next?'下一组 →':'最后一组'}</button><span id="bank-save-status" role="status"></span></div><p class="muted">${reviewQueue?'复习作答不会改变原练习记录。':'作答与完成进度保存至你的个人账号。'}</p></section>`;
   function feedback(){if(!records[q.number]?.choice)return;main.querySelector('#bank-feedback').innerHTML=q.answer?`<div class="feedback ${records[q.number].choice===q.answer?'':'wrong'}"><strong>${records[q.number].choice===q.answer?'✓ 回答正确':'再试一试'}</strong><p>参考答案：${esc(q.answer)}</p>${q.explanation?`<p>${esc(q.explanation)}</p>`:''}</div>`:'<p class="note">已保存选择。本套答案表不完整，暂不判分。</p>';}
   feedback();afterRender();bindProgressToggle();
   const memoryInput=main.querySelector('#listening-memory');
   if(memoryInput){
    const key=set.id+':'+q.number,count=main.querySelector('#listening-memory-count'),status=main.querySelector('#listening-memory-status');
    const update=async()=>{memoryInput.value=trimMemory(memoryInput.value);count.textContent=memoryLength(memoryInput.value)+' / '+LISTENING_MEMORY_LIMIT;const text=memoryInput.value;if(text)memories[key]=text;else delete memories[key];status.textContent=t('正在保存…');try{const ok=await studentStorage.setItem(LISTENING_MEMORY_KEY,JSON.stringify(memories));if(memoryInput.value===text)status.textContent=t(ok===false?'保存失败，请稍后重试。':'已保存');}catch{status.textContent=t('保存失败，请稍后重试。');}};
    memoryInput.oninput=e=>{if(!e.isComposing)update();};memoryInput.oncompositionend=update;
   }

   main.querySelector('#bank-random-review').onclick=()=>{if(reviewBusy)return;reviewQueue=sampleCompletedQuestions(allSets,completed);reviewAnswers.clear();reviewMove(0);};
   const exit=main.querySelector('#bank-review-exit');if(exit)exit.onclick=()=>{reviewQueue=null;renderBank(main,kind,set.id,{existing,afterRender,stopAudio});};
   main.querySelector('#bank-set').disabled=!!reviewQueue;
   main.querySelector('#bank-question').disabled=!!reviewQueue;
   main.querySelector('#bank-prev').disabled=reviewQueue?reviewIndex===0:position===0;
   main.querySelector('#bank-next').disabled=reviewQueue?reviewIndex===reviewQueue.length-1:position===set.questions.length-1;
   main.querySelector('#bank-set').onchange=e=>navigate(e.target.value);
   main.querySelector('#bank-answer').onsubmit=e=>{e.preventDefault();const chosen=main.querySelector('input[name="bank-choice"]:checked');if(!chosen){main.querySelector('#bank-feedback').textContent='请先选择答案。';return;}if(reviewQueue){records[q.number]={choice:chosen.value};reviewAnswers.set(`${set.id}:${position}`,records);feedback();main.querySelector('#bank-progress').textContent=scoreText();return;}const previous=records[q.number];records[q.number]={choice:chosen.value,at:new Date().toISOString()};try{studentStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));}catch{if(previous)records[q.number]=previous;else delete records[q.number];main.querySelector('#bank-feedback').textContent='浏览器无法保存记录。';return;}feedback();updateProgress();main.querySelector(`#bank-question option[value="${position}"]`).textContent=`第 ${q.number} 题 · 已作答`;};
   main.querySelector('#bank-complete').onchange=e=>{const previous=completed;completed={...completed};if(e.target.checked)completed[set.id]=new Date().toISOString();else delete completed[set.id];try{studentStorage.setItem(COMPLETION_KEY,JSON.stringify(completed));}catch{completed=previous;e.target.checked=!!completed[set.id];main.querySelector('#bank-save-status').textContent='保存失败，请检查浏览器存储。';return;}updateProgress();main.querySelector('#bank-save-status').textContent=completed[set.id]?'✓ 已保存完成进度':'已取消完成标记';};
   main.querySelector('#bank-next-set').onclick=()=>{if(next&&completed[set.id])navigate(next.id);};
   const move=i=>{if(reviewQueue){reviewMove(reviewIndex+(i>position?1:-1));return;}stopAudio();main.querySelector('audio')?.pause();position=i;draw();};
   main.querySelector('#bank-prev').onclick=()=>reviewQueue?reviewMove(Math.max(0,reviewIndex-1)):move(Math.max(0,position-1));main.querySelector('#bank-next').onclick=()=>reviewQueue?reviewMove(Math.min(reviewQueue.length-1,reviewIndex+1)):move(Math.min(set.questions.length-1,position+1));main.querySelector('#bank-question').onchange=e=>move(Number(e.target.value));
  }draw();
 }catch(error){if(ticket===generation&&location.hash.startsWith('#'+kind))main.innerHTML=`<h1>${title}</h1><p>${esc(error.message)}</p><a class="button" href="#home">返回首页</a>`;}
}
