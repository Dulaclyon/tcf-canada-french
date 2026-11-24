import {mountGuestView} from './guest-view.js';
import {SECTION_NOTE_KEYS} from './section-notes-model.js';
import {headerActions} from './i18n.js';
const keys=['transition-completed-v1','french-learning-v1','tcf-bank-progress-v1','tcf-bank-completed-v1',...Object.values(SECTION_NOTE_KEYS)];
const response=await fetch('/api/me',{cache:'no-store'});
if(!response.ok){location.replace('/login.html');throw Error('Login required');}
export const account=await response.json();
mountGuestView(account);
if(account.mustChange){location.replace('/login.html');throw Error('Password change required');}
const r=await fetch('/api/progress',{cache:'no-store'});if(!r.ok)throw Error('无法读取云端档案，请刷新重试');
const values=await r.json();let queue=Promise.resolve();
export const storage={flush:()=>queue,getItem:key=>values[key]===undefined?null:JSON.stringify(values[key]),setItem(key,value){if(!keys.includes(key))throw Error('Unknown progress key');const parsed=JSON.parse(value);values[key]=parsed;return queue=queue.then(async()=>{const r=await fetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value:parsed})});if(!r.ok)throw Error('保存失败');document.querySelector('#cloud-status').textContent='云端已保存';document.querySelector('#cloud-retry').hidden=true;panel.classList.remove('save-error');return true;}).catch(()=>{document.querySelector('#cloud-status').textContent='云端保存失败，请保持此页打开并重试';const retry=document.querySelector('#cloud-retry');retry.hidden=false;panel.classList.add('save-error');accountMenu.open=true;return false;});}};
const panel=document.createElement('div');panel.className='account-tools';
panel.innerHTML=(account.role==='guest'?'<a href="/app.html#home/owner">查看管理概览</a>':'')+(['owner','guest'].includes(account.role)?'<a href="/roles.html">账号与角色</a>':'')+(['owner','admin','guest'].includes(account.role)?'<a class="teacher-shortcut" href="/admin.html">管理学生</a>':'')+
 '<details class="account-menu"><summary>账号</summary><div class="account-menu-panel"><span id="cloud-status" role="status">个人云端档案</span><button id="cloud-retry" hidden>重试保存</button>'+
 (['owner','admin','teacher','guest'].includes(account.role)?'<a href="/submissions.html">作文批改</a>':'')+
 '<a href="/login.html">修改密码</a><a href="/app.html#backup">备份</a><a href="/">产品介绍</a><button id="student-logout">退出登录</button></div></details>';
headerActions().prepend(panel);
const accountMenu=panel.querySelector('details');
document.addEventListener('click',event=>{if(!accountMenu.contains(event.target))accountMenu.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&accountMenu.open){accountMenu.open=false;accountMenu.querySelector('summary').focus();}});
accountMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{accountMenu.open=false;}));
document.querySelector('#cloud-retry').onclick=()=>{for(const k of keys)if(values[k])storage.setItem(k,JSON.stringify(values[k]));};
document.querySelector('#student-logout').onclick=async()=>{await queue;await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.replace('/');};
for(const node of document.querySelectorAll('.sidebar-bottom small'))node.textContent='进度已保存至账号';
if('serviceWorker' in navigator){for(const registration of await navigator.serviceWorker.getRegistrations())await registration.unregister();for(const key of await caches.keys())if(key.startsWith('tcf-french-'))await caches.delete(key);}
