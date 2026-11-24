import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {once} from 'node:events';
import os from 'node:os';import path from 'node:path';
const dir=await mkdtemp(path.join(os.tmpdir(),'fwr-roles-'));let child,base;
async function start(){child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'0',PUBLIC_ORIGIN:'',DATA_DIR:dir,ADMIN_EMAIL:'owner@example.test',ADMIN_PASSWORD:'owner-password-test'},stdio:['ignore','pipe','pipe']});let out='';base=await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{out+=b;const m=/listening on (\d+)/u.exec(out);if(m)resolve('http://127.0.0.1:'+m[1]);});child.stderr.on('data',b=>out+=b);child.once('exit',()=>reject(Error(out)));});}
const req=(route,cookie,body,method=body?'POST':'GET')=>fetch(base+route,{method,redirect:'manual',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});
const login=async(email,password)=>{const r=await req('/api/login',null,{email,password});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];};
try{
 await start();let owner=await login('owner@example.test','owner-password-test');const me=await (await req('/api/me',owner)).json();assert.equal(me.role,'owner');assert(Object.values(me.permissions).every(Boolean));
 const accounts={};for(const role of ['guest','teacher','admin']){const email=role+'@example.test';let r=await req('/api/owner/accounts',owner,{email,name:role,role});assert.equal(r.status,201);const a=await r.json(),cookie=await login(email,a.password);assert.equal((await req('/api/password',cookie,{current:a.password,password:'changed-password-test'})).status,200);accounts[role]={...a,cookie};}
 assert.equal((await req('/api/owner/accounts',owner,{email:'second-owner@example.test',role:'owner'})).status,400);
 assert.equal((await req('/api/owner/accounts/update',owner,{id:me.id,role:'guest',active:false})).status,403);
 const guest=accounts.guest.cookie,teacher=accounts.teacher.cookie,admin=accounts.admin.cookie;
 let r=await req('/api/admin/users',owner,{email:'student@example.test'});const student=await r.json();const studentCookie=await login(student.email,student.password);await req('/api/password',studentCookie,{current:student.password,password:'changed-password-test'});
 const studentId=(await (await req('/api/admin/users',owner)).json())[0].id;
 for(const route of ['/admin.html','/submissions.html','/roles.html','/api/admin/users','/api/admin/registration-requests','/api/admin/learning-progress','/api/admin/writing','/api/owner/accounts','/api/admin/notifications'])assert.equal((await req(route,guest)).status,200,route);
 assert.equal((await req('/api/admin/users',studentCookie)).status,403);assert.equal((await req('/api/owner/accounts',admin)).status,403);assert.equal((await req('/api/admin/users',teacher)).status,200);assert.equal((await req('/api/admin/users',teacher,{email:'blocked@example.test'})).status,403);
 for(const [route,body] of [['/api/admin/users',{email:'bad@example.test'}],['/api/admin/profile',{id:studentId,name:'Changed'}],['/api/admin/access',{id:studentId,active:false}],['/api/admin/reset',{id:studentId}],['/api/admin/permissions',{id:studentId,permissions:me.permissions}],['/api/owner/accounts/update',{id:accounts.guest.id,role:'admin',active:true}],['/api/admin/notifications',{audience:'all',title:'Bad',message:'Bad'}],['/api/admin/writing/codex/pair',{token:'a'.repeat(64)}],['/api/admin/writing/codex/disconnect',{}],['/api/admin/writing/codex',{id:'fake'}],['/api/admin/writing/feedback',{id:'fake',feedback:'Not allowed'}]])assert.equal((await req(route,guest,body)).status,403,route);
 assert.equal((await req('/api/progress',guest,{key:'french-learning-v1',value:{version:1,completed:[],attempts:[{id:'test',correct:true}],oralRecords:[],drafts:{}}},'PUT')).status,200);
 const progress=await (await req('/api/progress',guest)).json();assert.equal(progress['french-learning-v1'].attempts[0].correct,true);assert.deepEqual(await (await req('/api/progress',studentCookie)).json(),{});
 const exam=JSON.parse(await readFile('src/data/exam.json','utf8'));r=await req('/api/writing/submissions',guest,{questionId:exam.writing[0].id,text:'Bonjour, je découvre ce cours.'});assert.equal(r.status,201);const essay=await r.json();assert.equal((await req('/api/admin/writing/detail?id='+essay.id,guest)).status,200);assert.equal((await req('/api/admin/writing/feedback',guest,{id:essay.id,feedback:'Bad'})).status,403);assert.equal((await req('/api/admin/writing/feedback',owner,{id:essay.id,feedback:'Bien joué.'})).status,200);
 assert.equal((await (await req('/api/notifications',guest)).json()).items.filter(n=>n.title==='Your assessment is ready').length,1);
 assert.equal((await (await req('/api/writing/feedback?questionId='+exam.writing[0].id,guest)).json()).feedback,'Bien joué.');
 assert.equal((await req('/api/owner/accounts/update',owner,{id:accounts.guest.id,role:'guest',active:false})).status,200);assert.equal((await req('/api/me',guest)).status,401);
 child.kill();await once(child,'exit');await start();owner=await login('owner@example.test','owner-password-test');assert.equal((await (await req('/api/me',owner)).json()).role,'owner');assert.equal((await (await req('/api/owner/accounts',owner)).json()).filter(a=>a.role==='owner').length,1);
 console.log('Account roles passed: owner migration/protection, staff restrictions, Guest private management inspection, server-enforced mutation denial, own learning/submissions, session revocation and restart persistence.');
}finally{if(child?.exitCode===null){child.kill();await once(child,'exit');}await rm(dir,{recursive:true,force:true});}
