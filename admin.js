import {mountGuestView} from './guest-view.js';
import {translate as t} from './i18n.js';
const message=document.querySelector('#message');
const sectionLabels={basics:'基础法语',transition:'备考过渡',listening:'听力训练',reading:'阅读训练',oral:'口语训练',writing:'写作训练'};
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const b=await r.json();if(!r.ok)throw Error(b.error);return b;}
function credentials(b){message.textContent=`用户名：${b.email}\n临时密码：${b.password}\n请安全保存并交给该学生。首次登录必须修改。`;} 
function permissionsForm(u,approval=false){
 const form=document.createElement('form');form.className='student-permissions';
 const fieldset=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent='开放板块';fieldset.append(legend);
 for(const [key,text] of Object.entries(sectionLabels)){
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name=key;input.checked=(u.permissions||{basics:true,transition:false,listening:false,reading:false,oral:false,writing:false})[key];label.append(input,document.createTextNode(text));fieldset.append(label);
 }
 const save=document.createElement('button');save.type='submit';save.textContent=approval?'批准并创建账号':'保存权限';
 const status=document.createElement('span');status.setAttribute('role','status');
 form.append(fieldset,save,status);
 form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{
  const permissions=Object.fromEntries(Object.keys(sectionLabels).map(k=>[k,form.elements.namedItem(k).checked]));
  const result=await api(approval?'/api/admin/registration-requests/approve':'/api/admin/permissions',{id:u.id,permissions});if(approval){credentials(result);await load();}else status.textContent='已保存';
 }catch(e){status.textContent=e.message;}finally{save.disabled=false;}};
 return form;
}
function identityCell(u){
 const td=document.createElement('td'),email=document.createElement('small');email.textContent=u.email;email.dataset.i18nSkip='';
 const form=document.createElement('form');form.className='student-name-form';
 const input=document.createElement('input');input.type='text';input.maxLength=100;input.value=u.name||'';input.setAttribute('aria-label','学生姓名');input.placeholder='学生姓名（可选）';
 const save=document.createElement('button');save.type='submit';save.textContent='保存姓名';
 const status=document.createElement('span');status.setAttribute('role','status');
 form.append(input,save,status);form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{const result=await api('/api/admin/profile',{id:u.id,name:input.value});u.name=result.name;input.value=result.name;status.textContent='已保存';}catch(e){status.textContent=e.message;}finally{save.disabled=false;}};
 td.append(form,email);return td;
}
async function load(){const [rows,requests]=await Promise.all([api('/api/admin/users'),api('/api/admin/registration-requests')]);const pending=requests.filter(r=>r.status==='pending').length;document.querySelector('#pending-count').textContent=pending?'待批准申请：'+pending:'';const filter=document.querySelector('#student-status').value,container=document.querySelector('#students');container.replaceChildren();let shown=0;
 for(const request of requests.filter(r=>filter==='all'||r.status===filter)){
  shown++;const row=document.createElement('tr');row.dataset.requestId=request.id;
  const identity=document.createElement('td'),name=document.createElement('strong'),email=document.createElement('small');name.textContent=request.name;email.textContent=request.email;name.dataset.i18nSkip='';email.dataset.i18nSkip='';identity.append(name,email);identity.className='request-identity';
  const status=document.createElement('td');status.textContent=request.status==='pending'?'等待批准':'已拒绝';
  const actions=document.createElement('td');if(request.status==='pending'){const decline=document.createElement('button');decline.type='button';decline.className='secondary';decline.textContent='拒绝申请';decline.onclick=async()=>{decline.disabled=true;try{await api('/api/admin/registration-requests/decline',{id:request.id});await load();}catch(e){message.textContent=e.message;decline.disabled=false;}};actions.append(decline);}
  row.append(identity,status,actions);container.append(row);const accessRow=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.append(permissionsForm(request,true));accessRow.className='permissions-row';accessRow.append(cell);container.append(accessRow);
 }
 for(const u of (filter==='all'||filter==='registered'?rows:[])){shown++;
 const tr=document.createElement('tr');tr.dataset.studentId=u.id;tr.append(identityCell(u));const accountStatus=document.createElement('td'),registered=document.createElement('strong'),state=document.createElement('small');registered.textContent='已注册学生';state.textContent=u.active?(u.must_change?'待修改密码':'已启用'):'已停用';accountStatus.append(registered,state);accountStatus.className='request-identity';tr.append(accountStatus);
 const td=document.createElement('td');for(const [label,route,extra] of [['重置密码','reset',{}],[u.active?'停用':'启用','access',{active:!u.active}]]){const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{if(!confirm(t(`确认${label}：${u.email}？`)))return;try{const result=await api('/api/admin/'+route,{id:u.id,...extra});if(result.password)credentials(result);await load();}catch(e){message.textContent=e.message;}};td.append(b);}tr.append(td);container.append(tr);
 const permissionsRow=document.createElement('tr'),permissionsCell=document.createElement('td');permissionsCell.colSpan=3;permissionsCell.append(permissionsForm(u));permissionsRow.className='permissions-row';permissionsRow.append(permissionsCell);container.append(permissionsRow);
}if(!shown){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='暂无此状态的学生或申请。';row.append(cell);container.append(row);}}
document.querySelector('#add').onsubmit=async e=>{e.preventDefault();try{credentials(await api('/api/admin/users',{email:document.querySelector('#email').value,name:document.querySelector('#name').value}));e.target.reset();await load();}catch(e){message.textContent=e.message;}};
const initialStatus=new URLSearchParams(location.search).get('status');if(['pending','registered','declined'].includes(initialStatus))document.querySelector('#student-status').value=initialStatus;document.querySelector('#student-status').onchange=()=>load().catch(e=>{message.textContent=e.message;});
await mountGuestView();
try{await load();}catch(e){message.textContent=e.message;}

try{const me=await api('/api/me');document.querySelector('#owner-role-link').hidden=!['owner','guest'].includes(me.role);}catch{}
