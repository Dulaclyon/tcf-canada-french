const date=value=>new Date(value).toLocaleString('zh-CN');
async function api(url,body){const r=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const b=await r.json();if(!r.ok){const e=Error(b.error||'请求失败');e.status=r.status;throw e;}return b;}
export function mountWritingSubmission(editor,question,account,onSubmit){
 const section=document.createElement('section');section.className='card writing-submission';
 const heading=document.createElement('h2');heading.textContent='提交与教师反馈';
 const note=document.createElement('p');note.className='muted';note.textContent='完成即提交给老师；修改后可再次提交。';
 const button=document.createElement('button');button.className='primary';button.textContent='提交作文';button.disabled=account.role!=='student';
 if(account.role!=='student')note.textContent='管理员请在“作文批改”中查看学生提交；提交作文需使用学生账号。';
 const status=document.createElement('p');status.setAttribute('role','status');
 const reload=document.createElement('button');reload.className='secondary';reload.textContent='刷新反馈';reload.type='button';const history=document.createElement('div');section.append(heading,note,reload,status,history);editor.closest('section').querySelectorAll('.editor-bar')[1].append(button);editor.closest('section').after(section);
 const refresh=async()=>{
  const rows=await api('/api/writing/submissions?questionId='+encodeURIComponent(question.id));if(!section.isConnected)return;
  history.replaceChildren();if(!rows.length){history.textContent='尚未提交。';return;}
  const label=document.createElement('label');label.textContent='已提交版本（最近 20 份）';const select=document.createElement('select');select.setAttribute('aria-label','选择已提交作文版本');
  rows.forEach((row,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=date(row.submitted_at)+(row.reviewed_at?' · 已批改':' · 待批改');select.append(option);});
  const detail=document.createElement('div');const show=()=>{
   const row=rows[Number(select.value)];detail.replaceChildren();
   const feedbackTitle=document.createElement('h3');feedbackTitle.textContent='教师评语';const feedback=document.createElement('p');feedback.className=row.reviewed_at?'submission-text':'muted';feedback.textContent=row.reviewed_at?row.feedback:'老师尚未批改。';
   const saved=document.createElement('details');saved.open=true;const summary=document.createElement('summary');summary.textContent='已提交作文 · '+date(row.submitted_at);const text=document.createElement('p');text.className='submission-text';text.lang='fr';text.textContent=row.text;saved.append(summary,text);detail.append(feedbackTitle,feedback,saved);
  };select.onchange=show;history.append(label,select,detail);show();
 };
 reload.onclick=()=>refresh().catch(e=>{status.textContent=e.message;});
 const submit=async()=>{if(!editor.value.trim()){status.textContent='请先填写作文。';return false;}button.disabled=true;try{
  const submittedText=editor.value;try{await api('/api/writing/submissions',{questionId:question.id,text:submittedText});}catch(e){if(e.status!==409)throw e;}if(!section.isConnected)return false;status.textContent='已提交给老师。';if(editor.value===submittedText)onSubmit();await refresh();return true;
 }catch(e){status.textContent=e.message;return false;}finally{button.disabled=false;}};
 button.onclick=submit;
 refresh().catch(e=>{if(section.isConnected)status.textContent='无法读取提交记录：'+e.message;});
 return submit;
}
