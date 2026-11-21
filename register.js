const form=document.querySelector('#registration-form'),message=document.querySelector('#registration-message');
form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('button');button.disabled=true;message.textContent='';try{
 const response=await fetch('/api/registration-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.querySelector('#registration-name').value,email:document.querySelector('#registration-email').value})});
 const data=await response.json();if(!response.ok)throw Error(data.error||'请求失败');form.hidden=true;document.querySelector('#registration-intro').hidden=true;document.querySelector('#registration-success').hidden=false;
}catch(error){message.textContent=error.message;}finally{button.disabled=false;}};
