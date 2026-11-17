import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,rm,readFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {once} from 'node:events';
const dir=await mkdtemp(path.join(os.tmpdir(),'tcf-submissions-'));let child,base;
async function start(){child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PUBLIC_ORIGIN:'',PORT:'0',DATA_DIR:dir,ADMIN_EMAIL:'teacher@example.test',ADMIN_PASSWORD:'teacher-password-test'},stdio:['ignore','pipe','pipe']});let output='';base=await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{output+=b;const m=/listening on (\d+)/.exec(output);if(m)resolve('http://127.0.0.1:'+m[1]);});child.once('exit',()=>reject(Error('Server exited')));});}
const req=(route,cookie,body,origin=base)=>fetch(base+route,{method:body?'POST':'GET',redirect:'manual',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin}:{})},body:body?JSON.stringify(body):undefined});
const json=async r=>{assert(r.ok,await r.clone().text());return r.json();};
async function login(email,password){const r=await req('/api/login',null,{email,password});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];}
try{
 await start();const admin=await login('teacher@example.test','teacher-password-test');
 async function student(email){const u=await json(await req('/api/admin/users',admin,{email}));const cookie=await login(email,u.password);await req('/api/password',cookie,{current:u.password,password:'student-password-test'});return cookie;}
 const a=await student('a@example.test'),b=await student('b@example.test');const users=await json(await req('/api/admin/users',admin)),id=users.find(x=>x.email==='a@example.test').id;
 const questions=JSON.parse(await readFile('src/data/exam.json','utf8')).writing,q=questions[0];
 const body={questionId:q.id,text:'Bonjour, voici mon premier texte.'};
 assert.equal((await req('/api/writing/submissions',null,body)).status,401);
 assert.equal((await req('/api/writing/submissions',a,body)).status,403);
 await req('/api/admin/permissions',admin,{id,permissions:{basics:true,listening:false,reading:false,oral:false,writing:true}});
 assert.equal((await req('/api/writing/submissions',a,body,'https://evil.test')).status,403);
 assert.equal((await req('/api/writing/submissions',a,{...body,text:' '})).status,400);
 assert.equal((await req('/api/writing/submissions',a,{...body,text:'a'.repeat(20001)})).status,400);
 assert.equal((await req('/api/writing/submissions',a,{...body,questionId:'fake'})).status,400);
 const one=await json(await req('/api/writing/submissions',a,body));
 assert.equal((await req('/api/writing/submissions',a,body)).status,409);
 assert.deepEqual(await json(await req('/api/writing/submissions?questionId='+q.id,b)),[]);
 assert.equal((await req('/api/admin/writing/detail?id='+one.id,b)).status,403);
 assert.equal((await req('/api/admin/writing/feedback',a,{id:one.id,feedback:'fake'})).status,403);
 assert.equal((await req('/submissions.html',a)).status,403);
 const detail=await json(await req('/api/admin/writing/detail?id='+one.id,admin));assert.equal(detail.text,body.text);assert.equal(detail.title,q.title);assert.equal(detail.email,'a@example.test');
 const feedback='<script>alert(1)</script> Bonne structure, vérifiez les accords.';
 await json(await req('/api/admin/writing/feedback',admin,{id:one.id,feedback}));
 let history=await json(await req('/api/writing/submissions?questionId='+q.id,a));assert.equal(history[0].feedback,feedback);assert(history[0].reviewed_at);
 const two=await json(await req('/api/writing/submissions',a,{...body,text:'Bonjour, voici mon texte corrigé.'}));assert.notEqual(two.id,one.id);
 history=await json(await req('/api/writing/submissions?questionId='+q.id,a));assert.equal(history.length,2);assert.equal(history.find(x=>x.id===one.id).text,body.text);assert.equal(history.find(x=>x.id===two.id).reviewed_at,null);
 const pending=await json(await req('/api/admin/writing?pending=1&student='+id,admin));assert.deepEqual(pending.items.map(x=>x.id),[two.id]);
 assert.equal((await json(await req('/api/admin/writing?student='+users.find(x=>x.email==='b@example.test').id,admin))).items.length,0);
 child.kill();await once(child,'exit');await start();const again=await login('a@example.test','student-password-test');history=await json(await req('/api/writing/submissions?questionId='+q.id,again));assert.equal(history.length,2);assert.equal(history.find(x=>x.id===one.id).feedback,feedback);
 console.log('Writing submissions passed: access permissions, CSRF, account isolation, immutable versions, server-owned question metadata, feedback, filters, validation and restart persistence.');
}finally{if(child.exitCode===null){child.kill();await once(child,'exit');}await rm(dir,{recursive:true,force:true});}
