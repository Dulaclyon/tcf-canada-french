import {translate as t} from './i18n.js';
const $=id=>document.getElementById(id);
async function api(url,body){const response=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'请求失败');return data;}
const feedbackText=(review,locale)=>{
 const a=review.assessment;const title=s=>t(s,locale);
 const level=a.estimated_level==='insufficient_evidence'?title('内容不足，无法估计水平。'):a.estimated_level;
 const corrections=a.corrections.length?a.corrections.map(c=>`${c.original} → ${c.corrected}\n${c.explanation}`).join('\n\n'):title('无需修改。');
 return [title('估计水平')+'\n'+level,title('修改建议')+'\n'+corrections,title('建议修改稿')+'\n'+(a.revised_text||title('暂无建议修改稿。'))].join('\n\n');
};
export function mountEssayAssessment(){
 let id=null,version=0,busy=false,review=null,config=null,pendingDraft=null;
 const pairing=/^#codex-connect=([a-f0-9]{64})$/.exec(location.hash)?.[1];
 if(pairing){history.replaceState(null,'',location.pathname);$('codex-pair').hidden=false;$('codex-confirm').onclick=async()=>{try{await api('/api/admin/writing/codex/pair',{token:pairing});$('codex-pair').hidden=true;$('connector-status').textContent='Mac 已连接。请保持连接器运行。';}catch(e){$('connector-status').textContent=e.message;}};}
 $('codex-disconnect').onclick=async()=>{try{await api('/api/admin/writing/codex/disconnect',{});if(id)open(id);$('connector-status').textContent='Codex 连接已断开。';}catch(e){$('connector-status').textContent=e.message;}};
 const language=$('ai-feedback-language');language.value=document.documentElement.lang.startsWith('zh-Hant')?'zh-TW':document.documentElement.lang.startsWith('zh')?'zh-CN':'en';
 function controls(){
  $('ai-generate').disabled=!id||busy||!config?.enabled||!config.remaining||review?.status==='completed'||['queued','pending'].includes(review?.status);
  $('ai-rewrite').disabled=!id||busy||!config?.enabled||['queued','pending'].includes(review?.status);
  $('ai-setup').hidden=!!config?.enabled;$('ai-count').textContent=config?.enabled?'Mac 已连接':'Mac 未连接';
  $('ai-generate').textContent=busy?'正在评估…':review?.status==='completed'?'已保存 AI 评估':'使用 Codex 评估';
 }
 function show(result){
  const target=$('ai-review-result');target.replaceChildren();$('ai-use-draft').hidden=true;
  if(result?.status!=='completed'){if(['queued','pending'].includes(result?.status))$('ai-review-status').textContent='这份作文正在评估，请稍后刷新。';else if(result?.status==='failed')$('ai-review-status').textContent=result.error||'上次评估未完成，可以重试。';if(result?.rewrite)$('rewrite-status').textContent=$('ai-review-status').textContent;return;}
  const area=$('teacher-feedback'),draft=feedbackText(result,result.language||language.value);
  const requestedHere=pendingDraft?.id===result.id&&pendingDraft.submissionId===id&&pendingDraft.language===language.value;
  const unchanged=requestedHere&&area.value===pendingDraft.feedback;
  if((unchanged||!area.value.trim()||area.value===draft)&&draft.length<=area.maxLength){
   area.value=draft;area.dispatchEvent(new Event('input',{bubbles:true}));$('rewrite-status').textContent='完整草稿已放入评语框，包含建议修改稿。检查后再发布。';
  }else{
   $('ai-use-draft').textContent='替换教师评语草稿';$('ai-use-draft').hidden=false;
   $('rewrite-status').textContent='完整草稿包含估计水平、修改建议和建议修改稿。点击“替换教师评语草稿”载入。';
  }
  if(requestedHere)pendingDraft=null;
 }

 async function open(nextId){if(nextId!==id){$('ai-rewrite-instructions').value='';$('rewrite-status').textContent='';pendingDraft=null;}id=nextId;review=null;const current=++version;$('ai-review-result').replaceChildren();$('ai-review-status').textContent='';$('ai-use-draft').hidden=true;controls();try{const data=await api('/api/admin/writing/codex?id='+encodeURIComponent(id)+'&language='+encodeURIComponent(language.value));if(current!==version)return;review=data.review;config=data.config;show(review);controls();}catch(error){if(current===version){$('ai-review-status').textContent=error.message;controls();}}}
 language.onchange=()=>{if(id)open(id);};$('ai-refresh').onclick=()=>{if(id)open(id);};
 const generate=async(rewrite=false)=>{
  if(!id||busy)return;const current=version,submissionId=id,locale=language.value,feedback=$('teacher-feedback').value;busy=true;$('ai-review-status').textContent='正在评估…';if(rewrite)$('rewrite-status').textContent='正在改写…';controls();
  try{const data=await api('/api/admin/writing/codex',{id:submissionId,language:locale,...(rewrite?{rewrite:true,instructions:$('ai-rewrite-instructions').value,feedback}:{})});config=data.config;if(current!==version)return;pendingDraft={id:data.id,submissionId,language:locale,feedback};review=data;show(review);$('ai-review-status').textContent=review.status==='completed'?'评估草稿已保存，仅老师可见。':'已排队，Mac 上的 Codex 将进行评估。';}
  catch(error){if(current===version){$('ai-review-status').textContent=error.message;if(rewrite)$('rewrite-status').textContent=error.message;}}
  finally{busy=false;controls();}
 };
 $('ai-generate').onclick=()=>generate(false);$('ai-rewrite').onclick=()=>generate(true);
 $('ai-rewrite-instructions').addEventListener('keydown',event=>{if(event.key==='Enter')event.preventDefault();});
 $('ai-use-draft').onclick=()=>{
  if(review?.status!=='completed')return;const draft=feedbackText(review,review.language||language.value),area=$('teacher-feedback');
  if(draft.length>area.maxLength){$('rewrite-status').textContent='评语过长，请手动选取需要的内容。';return;}
  area.value=draft;area.dispatchEvent(new Event('input',{bubbles:true}));area.focus();$('ai-use-draft').hidden=true;$('rewrite-status').textContent='完整草稿已放入评语框，包含建议修改稿。检查后再发布。';
 };

 setInterval(()=>{if(id&&!busy&&!document.hidden&&(!config?.enabled||['queued','pending'].includes(review?.status)))open(id);},5000);
 controls();return {open};
}
