const keys=['french-learning-v1','tcf-bank-progress-v1','tcf-bank-completed-v1'];
const response=await fetch('/api/me',{cache:'no-store'});
if(!response.ok){location.replace('/login.html');throw Error('Login required');}
export const account=await response.json();
if(account.mustChange){location.replace('/login.html');throw Error('Password change required');}
const r=await fetch('/api/progress',{cache:'no-store'});if(!r.ok)throw Error('无法读取云端档案，请刷新重试');
const values=await r.json();let queue=Promise.resolve();
export const storage={getItem:key=>values[key]===undefined?null:JSON.stringify(values[key]),setItem(key,value){if(!keys.includes(key))throw Error('Unknown progress key');const parsed=JSON.parse(value);values[key]=parsed;queue=queue.then(async()=>{const r=await fetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value:parsed})});if(!r.ok)throw Error('保存失败');document.querySelector('#cloud-status').textContent='云端已保存';}).catch(()=>{document.querySelector('#cloud-status').textContent='云端保存失败，请保持此页打开并重试';const retry=document.querySelector('#cloud-retry');retry.hidden=false;});}};
addEventListener('DOMContentLoaded',()=>{}, {once:true});
const panel=document.createElement('div');panel.className='account-tools';panel.innerHTML='<span id="cloud-status">个人云端档案</span> <button id="cloud-retry" hidden>重试保存</button> <a href="/login.html">修改密码</a> '+(account.role==='admin'?'<a href="/admin.html">管理学生</a> <a href="/submissions.html">作文批改</a> ':'')+'<button id="student-logout">退出登录</button>';document.querySelector('header').append(panel);
document.querySelector('#cloud-retry').onclick=()=>{for(const k of keys)if(values[k])storage.setItem(k,JSON.stringify(values[k]));};
document.querySelector('#student-logout').onclick=async()=>{await queue;await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.replace('/');};
for(const node of document.querySelectorAll('.sidebar-bottom small'))node.textContent='学习进度保存至个人账号';
if('serviceWorker' in navigator){for(const registration of await navigator.serviceWorker.getRegistrations())await registration.unregister();for(const key of await caches.keys())if(key.startsWith('tcf-french-'))await caches.delete(key);}
