const connectorFragment=/^#codex-connect=[a-f0-9]{64}$/.test(location.hash)?location.hash:'';
const afterLogin=connectorFragment?'/submissions.html'+connectorFragment:'/app.html';
const message=document.querySelector('#message');
async function api(path,data){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const b=await r.json();if(!r.ok)throw Error(b.error);return b;}
function change(){document.querySelector('#account-intro').textContent='设置新的登录密码。';document.querySelector('#login').hidden=true;document.querySelector('#change').hidden=false;document.querySelector('#title').textContent='修改密码';}
const me=await fetch('/api/me',{cache:'no-store'});if(me.ok){change();const u=await me.json();if(!u.mustChange)document.querySelector('#continue').hidden=false;}
document.querySelector('#login').onsubmit=async e=>{e.preventDefault();try{const b=await api('/api/login',{email:document.querySelector('#email').value,password:document.querySelector('#password').value});if(b.mustChange){change();document.querySelector('#current').value=document.querySelector('#password').value;document.querySelector('#password').value='';message.textContent='首次登录，请设置你自己的密码。';}else location.replace(afterLogin);}catch(e){message.textContent=e.message;}};
document.querySelector('#change').onsubmit=async e=>{e.preventDefault();try{await api('/api/password',{current:document.querySelector('#current').value,password:document.querySelector('#new-password').value});location.replace(afterLogin);}catch(e){message.textContent=e.message;}};
