import {translate as t} from './i18n.js';
import {mountGuestView} from './guest-view.js';
const $=id=>document.getElementById(id),labels={owner:'所有者',admin:'管理员',teacher:'老师',guest:'访客'};
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const data=await r.json();if(!r.ok)throw Error(data.error);return data;}
const credentials=b=>{$('role-message').textContent=t('邮箱')+': '+b.email+'\n'+t('临时密码')+': '+b.password+'\n'+t('首次登录必须修改密码。');};
async function load(){const accounts=await api('/api/owner/accounts');$('accounts').replaceChildren();for(const a of accounts){
 const section=document.createElement('section');section.className='admin-card';const name=document.createElement('h3');name.textContent=a.name||a.email;name.dataset.i18nSkip='';const email=document.createElement('p');email.textContent=a.email;email.dataset.i18nSkip='';section.append(name,email);
 if(a.role==='owner'){const badge=document.createElement('strong');badge.textContent=t('所有者');section.append(badge);}else{
 const form=document.createElement('form'),select=document.createElement('select');select.setAttribute('aria-label',t('角色')+' · '+a.email);for(const key of ['guest','teacher','admin']){const option=document.createElement('option');option.value=key;option.textContent=t(labels[key]);option.selected=a.role===key;select.append(option);}
 const label=document.createElement('label'),active=document.createElement('input');active.type='checkbox';active.checked=!!a.active;label.append(active,document.createTextNode(t('已启用')));const save=document.createElement('button');save.type='submit';save.textContent=t('保存');form.append(select,label,save);form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{await api('/api/owner/accounts/update',{id:a.id,role:select.value,active:active.checked});await load();$('role-message').textContent=t('已保存');}catch(e){$('role-message').textContent=e.message;save.disabled=false;}};
 const reset=document.createElement('button');reset.type='button';reset.className='secondary';reset.textContent=t('重置密码');reset.onclick=async()=>{if(!confirm(t('确认重置密码？')))return;try{credentials(await api('/api/owner/accounts/reset',{id:a.id}));}catch(e){$('role-message').textContent=e.message;}};section.append(form,reset);
 }$('accounts').append(section);
}}
$('add-account').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;try{credentials(await api('/api/owner/accounts',{name:$('account-name').value,email:$('account-email').value,role:$('account-role').value}));e.target.reset();await load();}catch(e){$('role-message').textContent=e.message;}finally{button.disabled=false;}};
await mountGuestView();try{await load();}catch(e){$('role-message').textContent=e.message;}
