import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,mkdir,writeFile,cp} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';import {once} from 'node:events';
const dir=await mkdtemp(path.join(os.tmpdir(),'tcf-permissions-')),root=path.join(dir,'static');
await cp('dist',root,{recursive:true});
await mkdir(path.join(root,'bank/sets'),{recursive:true});await mkdir(path.join(root,'bank/audio'),{recursive:true});await mkdir(path.join(root,'bank/images'),{recursive:true});
const sets=['listening','reading'].map(kind=>({id:kind+'-test',kind}));
await writeFile(path.join(root,'bank/index.json'),JSON.stringify({sets}));
for(const s of sets){await writeFile(path.join(root,'bank/sets',s.id+'.json'),JSON.stringify({...s,questions:[{audio:`bank/audio/${s.kind}.m4a`,images:[`bank/images/${s.kind}.jpg`]}]}));await writeFile(path.join(root,`bank/audio/${s.kind}.m4a`),'test audio');await writeFile(path.join(root,`bank/images/${s.kind}.jpg`),'test image');}
let child,base;
async function start(){child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PUBLIC_ORIGIN:'',PORT:'0',STATIC_DIR:root,DATA_DIR:path.join(dir,'db'),ADMIN_EMAIL:'teacher@example.test',ADMIN_PASSWORD:'teacher-password-test'},stdio:['ignore','pipe','pipe']});let output='';base=await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{output+=b;const m=/listening on (\d+)/.exec(output);if(m)resolve('http://127.0.0.1:'+m[1]);});child.once('exit',()=>reject(Error('Server exited: '+output)));});}
const request=(route,{method='GET',cookie,body}={})=>fetch(base+route,{method,redirect:'manual',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});
const login=async(email,password)=>{const r=await request('/api/login',{method:'POST',body:{email,password}});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];};
const all={basics:true,listening:true,reading:true,oral:true,writing:true};
try{
 await start();assert.equal((await request('/course-translations.js')).status,303);let admin=await login('teacher@example.test','teacher-password-test');
 const add=await request('/api/admin/users',{cookie:admin,method:'POST',body:{email:'student@example.test'}}),created=await add.json();
 let student=await login(created.email,created.password);await request('/api/password',{cookie:student,method:'POST',body:{current:created.password,password:'student-password-test'}});
 let users=await (await request('/api/admin/users',{cookie:admin})).json();const id=users[0].id;
 assert.deepEqual(users[0].permissions,{...all,listening:false,reading:false,oral:false,writing:false});
 const set=permissions=>request('/api/admin/permissions',{cookie:admin,method:'POST',body:{id,permissions}});
 assert.equal((await request('/api/admin/permissions',{cookie:student,method:'POST',body:{id,permissions:all}})).status,403);
 assert.equal((await set({basics:true})).status,400);
 assert.equal((await set({...all,bogus:true})).status,400);
 assert.equal((await set({...all,basics:'true'})).status,400);
 assert.equal((await request('/bank/sets/listening-test.json',{cookie:student})).status,403);
 assert.equal((await request('/bank/audio/listening.m4a',{cookie:student})).status,403);
 let exam=await (await request('/src/data/exam.json',{cookie:student})).json();assert.deepEqual(exam.oral,[]);assert.deepEqual(exam.writing,[]);
 let index=await (await request('/bank/index.json',{cookie:student})).json();assert.deepEqual(index.sets,[]);
 await set({...all,basics:false,listening:false,oral:false});
 assert.deepEqual(await (await request('/src/data/materials.json',{cookie:student})).json(),[]);
 assert.deepEqual(await (await request('/src//data/courses.json',{cookie:student})).json(),[]);
 assert.deepEqual(await (await request('/src%2fdata%2fmaterials.json',{cookie:student})).json(),[]);
 for(const route of ['/human-audio/penny-cres-62.m4a','/pronunciation-audio/e.mp3','/course-translations.js','/basic-verbs.js','/weather-lesson.js','/bank/images/listening.jpg','/bank/sets/listening-test.json'])assert.equal((await request(route,{cookie:student})).status,403,route);
 assert.equal((await request('/bank/sets/reading-test.json',{cookie:student})).status,200);
 assert.equal((await request('/bank/images/reading.jpg',{cookie:student})).status,200);
 index=await (await request('/bank/index.json',{cookie:student})).json();assert.deepEqual(index.sets.map(s=>s.kind),['reading']);
 exam=await (await request('/src/data/exam.json',{cookie:student})).json();assert.deepEqual(exam.oral,[]);assert(exam.writing.length>0);
 // Revocation applies to an already logged-in student on the next server request.
 await set({...all,reading:false});assert.equal((await request('/bank/sets/reading-test.json',{cookie:student})).status,403);
 assert.equal((await request('/bank/sets/listening-test.json',{cookie:student})).status,200);
 assert.equal((await request('/human-audio/penny-cres-62.m4a',{cookie:student})).status,200);
 child.kill();await once(child,'exit');await start();
 student=await login(created.email,'student-password-test');assert.equal((await request('/api/me',{cookie:student})).status,200);
 assert.equal((await request('/bank/sets/reading-test.json',{cookie:student})).status,403);
 admin=await login('teacher@example.test','teacher-password-test');assert.equal((await request('/bank/sets/reading-test.json',{cookie:admin})).status,200);
 child.kill();await once(child,'exit');
 const legacy=new DatabaseSync(path.join(dir,'db/students.sqlite'));legacy.prepare('DELETE FROM permissions WHERE user_id=?').run(id);legacy.close();await start();
 student=await login(created.email,'student-password-test');assert.deepEqual((await (await request('/api/me',{cookie:student})).json()).permissions,all);
 console.log('Section permissions passed: defaults, validation, admin-only edits, private content and audio, filtered question banks, immediate revocation, persistence, administrator bypass.');
}finally{if(child.exitCode===null){child.kill();await once(child,'exit');}await rm(dir,{recursive:true,force:true});}
