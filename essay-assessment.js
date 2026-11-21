import {translate as t} from './i18n.js';
const $=id=>document.getElementById(id);
async function api(url,body){const response=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'请求失败');return data;}
const node=(tag,text,cls)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(cls)element.className=cls;return element;};
const feedbackText=(review,locale)=>{
 const a=review.assessment;const title=s=>t(s,locale);
 return [a.summary,title('任务完成度')+'\n'+a.task_fulfilment,title('组织与连贯')+'\n'+a.organization,title('语言表达')+'\n'+a.language,a.strengths.length?title('优点')+'\n'+a.strengths.map(s=>'• '+s).join('\n'):'',a.priorities.length?title('优先改进')+'\n'+a.priorities.map(s=>'• '+s).join('\n'):'',a.corrections.length?title('修改建议')+'\n'+a.corrections.map(c=>`${c.original} → ${c.corrected}\n${c.explanation}`).join('\n\n'):'',a.estimated_level!=='insufficient_evidence'?title('AI 估计水平（非官方评分）')+': '+a.estimated_level:''].filter(Boolean).join('\n\n');
};
export function mountEssayAssessment(){
 let id=null,version=0,busy=false,review=null,config=null;
 const pairing=/^#codex-connect=([a-f0-9]{64})$/.exec(location.hash)?.[1];
 if(pairing){history.replaceState(null,'',location.pathname);$('codex-pair').hidden=false;$('codex-confirm').onclick=async()=>{try{await api('/api/admin/writing/codex/pair',{token:pairing});$('codex-pair').hidden=true;$('connector-status').textContent='Mac 已连接。请保持连接器运行。';}catch(e){$('connector-status').textContent=e.message;}};}
 $('codex-disconnect').onclick=async()=>{try{await api('/api/admin/writing/codex/disconnect',{});if(id)open(id);$('connector-status').textContent='Codex 连接已断开。';}catch(e){$('connector-status').textContent=e.message;}};
 const language=$('ai-feedback-language');language.value=document.documentElement.lang.startsWith('zh-Hant')?'zh-TW':document.documentElement.lang.startsWith('zh')?'zh-CN':'en';
 function controls(){
  $('ai-generate').disabled=!id||busy||!config?.enabled||!config.remaining||review?.status==='completed'||['queued','pending'].includes(review?.status);
  $('ai-setup').hidden=!!config?.enabled;$('ai-count').textContent=config?.enabled?'Mac 已连接':'Mac 未连接';
  $('ai-generate').textContent=busy?'正在评估…':review?.status==='completed'?'已保存 AI 评估':'使用 Codex 评估';
 }
 function show(result){
  const target=$('ai-review-result');target.replaceChildren();$('ai-use-draft').hidden=true;
  if(result?.status!=='completed'){if(['queued','pending'].includes(result?.status))$('ai-review-status').textContent='这份作文正在评估，请稍后刷新。';else if(result?.status==='failed')$('ai-review-status').textContent=result.error||'上次评估未完成，可以重试。';return;}
  const locale=result.language||language.value;target.lang=locale==='zh-TW'?'zh-Hant-TW':locale;const a=result.assessment;
  const meta=node('p',`${result.model} · ${new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(result.completed_at))}`,'muted');target.append(meta,node('p',a.summary,'ai-summary'));
  if(a.estimated_level!=='insufficient_evidence')target.append(node('p',t('AI 估计水平（非官方评分）',locale)+': '+a.estimated_level,'ai-level'));
  for(const [label,value] of [['任务完成度',a.task_fulfilment],['组织与连贯',a.organization],['语言表达',a.language]]){const section=node('section');section.append(node('h4',t(label,locale)),node('p',value));target.append(section);}
  for(const [label,values] of [['优点',a.strengths],['优先改进',a.priorities]])if(values.length){const section=node('section');const list=node('ul');values.forEach(value=>list.append(node('li',value)));section.append(node('h4',t(label,locale)),list);target.append(section);}
  if(a.corrections.length){const section=node('section');section.append(node('h4',t('修改建议',locale)));for(const correction of a.corrections){const item=node('div',undefined,'ai-correction');const pair=node('p');pair.lang='fr';pair.append(node('span',correction.original),document.createTextNode(' → '),node('strong',correction.corrected));item.append(pair,node('p',correction.explanation));section.append(item);}target.append(section);}
  if(a.revised_text){const details=node('details');details.open=true;const revision=node('p',a.revised_text,'submission-text');revision.lang='fr';details.append(node('summary',t('建议修改稿',locale)),revision);target.append(details);}
  $('ai-use-draft').hidden=false;
 }
 async function open(nextId){id=nextId;review=null;const current=++version;$('ai-review-result').replaceChildren();$('ai-review-status').textContent='';$('ai-use-draft').hidden=true;controls();try{const data=await api('/api/admin/writing/codex?id='+encodeURIComponent(id)+'&language='+encodeURIComponent(language.value));if(current!==version)return;review=data.review;config=data.config;show(review);controls();}catch(error){if(current===version){$('ai-review-status').textContent=error.message;controls();}}}
 language.onchange=()=>{if(id)open(id);};$('ai-refresh').onclick=()=>{if(id)open(id);};
 $('ai-generate').onclick=async()=>{
  if(!id||busy)return;const current=version,submissionId=id,locale=language.value;busy=true;$('ai-review-status').textContent='正在评估…';controls();
  try{const data=await api('/api/admin/writing/codex',{id:submissionId,language:locale});config=data.config;if(current!==version)return;review=data;show(review);$('ai-review-status').textContent=review.status==='completed'?'评估草稿已保存，仅老师可见。':'已排队，Mac 上的 Codex 将进行评估。';}
  catch(error){if(current===version)$('ai-review-status').textContent=error.message;}
  finally{busy=false;controls();}
 };
 $('ai-use-draft').onclick=()=>{
  if(review?.status!=='completed')return;const draft=feedbackText(review,review.language||language.value),area=$('teacher-feedback');if(!area.value.includes(draft)){const combined=[area.value.trim(),draft].filter(Boolean).join('\n\n');if(combined.length>area.maxLength){$('ai-review-status').textContent='评语过长，请手动选取需要的内容。';return;}area.value=combined;area.dispatchEvent(new Event('input',{bubbles:true}));}area.focus();$('ai-review-status').textContent='已加入教师评语草稿。检查后点击“发布评语”。';
 };
 setInterval(()=>{if(id&&!busy&&!document.hidden&&(!config?.enabled||['queued','pending'].includes(review?.status)))open(id);},5000);
 controls();return {open};
}
