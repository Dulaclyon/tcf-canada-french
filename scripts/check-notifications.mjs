import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {readFile} from 'node:fs/promises';
import {once} from 'node:events';
import os from 'node:os';import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {notificationService} from '../server/notifications.mjs';
const dir=await mkdtemp(path.join(os.tmpdir(),'fwr-notifications-'));let child,base;
async function start(){child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'0',PUBLIC_ORIGIN:'',DATA_DIR:dir,ADMIN_EMAIL:'teacher@example.test',ADMIN_PASSWORD:'teacher-password-test'},stdio:['ignore','pipe','pipe']});let output='';base=await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{output+=b;const m=/listening on (\d+)/u.exec(output);if(m)resolve('http://127.0.0.1:'+m[1]);});child.once('exit',()=>reject(Error(output)));});}
const req=(route,cookie,body)=>fetch(base+route,{method:body?'POST':'GET',redirect:'manual',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});
async function login(email,password){const r=await req('/api/login',null,{email,password});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];}
try{
 await start();assert.equal((await req('/api/notifications')).status,401);let teacher=await login('teacher@example.test','teacher-password-test');
 const users=[];for(const email of ['a@example.test','b@example.test','inactive@example.test']){const r=await req('/api/admin/users',teacher,{email,name:'Alex'});assert.equal(r.status,201);const data=await r.json();const cookie=await login(email,data.password);assert.equal((await req('/api/password',cookie,{current:data.password,password:'student-password-test'})).status,200);users.push({email,cookie});}
 const identities=await (await req('/api/admin/users',teacher)).json();for(const u of users)u.id=identities.find(x=>x.email===u.email).id;
 await req('/api/admin/access',teacher,{id:users[2].id,active:false});
 const candidates=await (await req('/api/admin/notifications/recipients',teacher)).json();assert.equal(candidates.length,2);assert(candidates.every(u=>u.id&&u.name==='Alex'&&u.email));
 const [a,b]=users;assert.equal((await req('/api/admin/notifications',a.cookie,{audience:'all',title:'No',message:'No'})).status,403);
 let r=await req('/api/admin/notifications',teacher,{audience:'selected',recipientIds:[a.id,a.id],title:'Targeted','message':'<img src=x onerror=alert(1)>\nOnly Alex A'});assert.equal(r.status,201);const targeted=await r.json();assert.equal(targeted.recipientCount,1);
 const inboxA=await (await req('/api/notifications',a.cookie)).json();assert.equal(inboxA.unread,1);assert(inboxA.items[0].message.startsWith('<img'));
 assert.equal((await (await req('/api/notifications',b.cookie)).json()).items.length,0);assert.equal((await req('/api/notifications/read',b.cookie,{id:targeted.id})).status,404);
 assert.equal((await req('/api/admin/notifications',teacher,{audience:'selected',recipientIds:[users[2].id],title:'Disabled',message:'No'})).status,400);
 assert.equal((await req('/api/admin/notifications',teacher,{audience:'selected',recipientIds:[],title:'Empty',message:'No'})).status,400);
 assert.equal((await req('/api/admin/notifications',teacher,{audience:'all',title:'Long',message:'x'.repeat(2001)})).status,400);
 r=await req('/api/admin/notifications',teacher,{audience:'all',title:'Everyone',message:'For the class'});assert.equal(r.status,201);assert.equal((await r.json()).recipientCount,2);
 assert.equal((await (await req('/api/notifications/unread-count',a.cookie)).json()).unread,2);
 assert.equal((await (await req('/api/notifications/unread-count',b.cookie)).json()).unread,1);
 assert.equal((await req('/api/notifications/read',a.cookie,{id:targeted.id})).status,200);assert.equal((await (await req('/api/notifications/unread-count',a.cookie)).json()).unread,1);
 await req('/api/notifications/read',a.cookie,{all:true});assert.equal((await (await req('/api/notifications',a.cookie)).json()).unread,0);
 const sent=await (await req('/api/admin/notifications',teacher)).json();assert.equal(sent.length,2);assert(sent.find(n=>n.id===targeted.id).readCount===1);
 child.kill();await once(child,'exit');await start();const after=await login(a.email,'student-password-test');assert.equal((await (await req('/api/notifications',after)).json()).items.length,2);
 const exam=JSON.parse(await readFile('src/data/exam.json','utf8'));
 teacher=await login('teacher@example.test','teacher-password-test');
 const writer=await login(a.email,'student-password-test');
 await req('/api/admin/permissions',teacher,{id:a.id,permissions:{basics:true,transition:true,listening:true,reading:true,oral:true,writing:true}});
 let submitted=await req('/api/writing/submissions',writer,{questionId:exam.writing[0].id,text:'Bonjour, voici mon travail.'});assert.equal(submitted.status,201);const essay=await submitted.json();
 let teacherInbox=await (await req('/api/notifications',teacher)).json();assert.equal(teacherInbox.items.length,1);assert.equal(teacherInbox.items[0].actionUrl,'/submissions.html?id='+essay.id);assert(teacherInbox.items[0].message.includes('Alex'));
 assert.equal((await req('/api/writing/submissions',writer,{questionId:exam.writing[0].id,text:'Bonjour, voici mon travail.'})).status,409);
 assert.equal((await (await req('/api/notifications',teacher)).json()).items.length,1);
 // Exercise the storage bound independently, without 205 network round trips.
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT,email TEXT,role TEXT,active INTEGER); INSERT INTO users VALUES('s','Student','s@example.test','student',1)");const service=notificationService(db);
 for(let i=0;i<205;i++)await service({route:'/api/admin/notifications',req:{method:'POST'},user:{id:'t',role:'admin'},body:async()=>({audience:'all',title:'Notice '+i,message:'Bounded'}),send:status=>assert.equal(status,201)});
 assert.equal(db.prepare('SELECT count(*) AS n FROM notifications').get().n,200);assert.equal(db.prepare('SELECT count(*) AS n FROM notification_recipients').get().n,200);db.exec("INSERT INTO users VALUES('t','Teacher','t@example.test','admin',1)");
 service.notifySubmission({id:'s',role:'student',name:'Student'},{key:'writing:one',title:'Essay',url:'/submissions.html?id=abc'});
 service.notifySubmission({id:'s',role:'student',name:'Student'},{key:'writing:one',title:'Essay',url:'/submissions.html?id=abc'});
 assert.equal(db.prepare("SELECT count(*) AS n FROM notifications WHERE audience='submission'").get().n,1);
 assert.equal(db.prepare("SELECT count(*) AS n FROM notification_recipients r JOIN notifications n ON n.id=r.notification_id WHERE n.audience='submission' AND r.user_id='t'").get().n,1);
 db.close();
 console.log('Notifications passed: authenticated teacher-only sending, @ identity candidates, targeted isolation, broadcast active recipients, validation, read/unread ownership, persistence and bounded retention.');
}finally{if(child?.exitCode===null){child.kill();await once(child,'exit');}await rm(dir,{recursive:true,force:true});}
