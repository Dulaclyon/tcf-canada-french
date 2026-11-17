import {translate as t} from './i18n.js';
const message=document.querySelector('#message');
const sectionLabels={basics:'基础法语',listening:'听力训练',reading:'阅读训练',oral:'口语训练',writing:'写作训练'};
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const b=await r.json();if(!r.ok)throw Error(b.error);return b;}
function credentials(b){message.textContent=`用户名：${b.email}\n临时密码：${b.password}\n请安全保存并交给该学生。首次登录必须修改。`;} 
function permissionsForm(u){
 const form=document.createElement('form');form.className='student-permissions';
 const fieldset=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent='开放板块';fieldset.append(legend);
 for(const [key,text] of Object.entries(sectionLabels)){
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name=key;input.checked=u.permissions[key];label.append(input,document.createTextNode(text));fieldset.append(label);
 }
 const save=document.createElement('button');save.type='submit';save.textContent='保存权限';
 const status=document.createElement('span');status.setAttribute('role','status');
 form.append(fieldset,save,status);
 form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{
  const permissions=Object.fromEntries(Object.keys(sectionLabels).map(k=>[k,form.elements.namedItem(k).checked]));
  await api('/api/admin/permissions',{id:u.id,permissions});status.textContent='已保存';
 }catch(e){status.textContent=e.message;}finally{save.disabled=false;}};
 return form;
}
async function load(){const rows=await api('/api/admin/users'),container=document.querySelector('#students');container.replaceChildren();for(const u of rows){
 const tr=document.createElement('tr');for(const text of [u.email,u.active?(u.must_change?'待修改密码':'已启用'):'已停用']){const td=document.createElement('td');td.textContent=text;tr.append(td);}
 const td=document.createElement('td');for(const [label,route,extra] of [['重置密码','reset',{}],[u.active?'停用':'启用','access',{active:!u.active}]]){const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{if(!confirm(t(`确认${label}：${u.email}？`)))return;try{const result=await api('/api/admin/'+route,{id:u.id,...extra});if(result.password)credentials(result);await load();}catch(e){message.textContent=e.message;}};td.append(b);}tr.append(td);container.append(tr);
 const permissionsRow=document.createElement('tr'),permissionsCell=document.createElement('td');permissionsCell.colSpan=3;permissionsCell.append(permissionsForm(u));permissionsRow.className='permissions-row';permissionsRow.append(permissionsCell);container.append(permissionsRow);
}if(!rows.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='尚未添加学生。';row.append(cell);container.append(row);}}
document.querySelector('#add').onsubmit=async e=>{e.preventDefault();try{credentials(await api('/api/admin/users',{email:document.querySelector('#email').value}));e.target.reset();await load();}catch(e){message.textContent=e.message;}};
try{await load();}catch(e){message.textContent=e.message;}
