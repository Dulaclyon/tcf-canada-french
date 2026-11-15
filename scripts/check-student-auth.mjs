import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';import {once} from 'node:events';
const dir=await mkdtemp(path.join(os.tmpdir(),'tcf-auth-'));
const child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'0',DATA_DIR:dir,ADMIN_EMAIL:'teacher@example.test',ADMIN_PASSWORD:'teacher-password-test'},stdio:['ignore','pipe','pipe']});
let output='';const port=await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{output+=b;const m=/listening on (\d+)/.exec(output);if(m)resolve(m[1]);});child.once('exit',()=>reject(Error('Server failed')));child.stderr.on('data',b=>{if(!String(b).includes('ExperimentalWarning'))process.stderr.write(b);});});
const base='http://127.0.0.1:'+port;
const request=(route,{method='GET',cookie,body,origin=base}={})=>fetch(base+route,{method,redirect:'manual',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin}:{})},body:body?JSON.stringify(body):undefined});
const login=async(email,password)=>{const r=await request('/api/login',{method:'POST',body:{email,password}});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];};
try{
 assert.equal((await request('/')).status,200);
 for(const route of ['/app.html','/src/data/courses.json','/bank/index.json','/bank/audio/example.m4a','/admin.html'])assert.equal((await request(route)).status,303);
 assert.equal((await request('/api/admin/users')).status,401);
 assert.equal((await request('/api/login',{method:'POST',body:{email:'teacher@example.test',password:'wrong'}})).status,401);
 const admin=await login('teacher@example.test','teacher-password-test');
 assert.equal((await request('/api/admin/users',{cookie:admin,method:'POST',origin:'https://evil.test',body:{email:'bad@test.com'}})).status,403);
 async function student(email){const r=await request('/api/admin/users',{cookie:admin,method:'POST',body:{email}});assert.equal(r.status,201);return r.json();}
 const a=await student('a@example.test'),b=await student('b@example.test');
 const sa=await login(a.email,a.password);assert.equal((await request('/app.html',{cookie:sa})).status,303);
 assert.equal((await request('/api/progress',{cookie:sa})).status,403);
 assert.equal((await request('/api/password',{cookie:sa,method:'POST',body:{current:a.password,password:'student-password-a'}})).status,200);
 const sb=await login(b.email,b.password);await request('/api/password',{cookie:sb,method:'POST',body:{current:b.password,password:'student-password-b'}});
 assert.equal((await request('/api/admin/users',{cookie:sa})).status,403);
 assert.equal((await request('/app.html',{cookie:sa})).status,200);
 await request('/api/progress',{cookie:sa,method:'PUT',body:{key:'tcf-bank-completed-v1',value:{sample:'done'}}});
 assert.deepEqual(await (await request('/api/progress',{cookie:sb})).json(),{});
 const second=await login(a.email,'student-password-a');assert.deepEqual(await (await request('/api/progress',{cookie:second})).json(),{'tcf-bank-completed-v1':{sample:'done'}});
 const users=await (await request('/api/admin/users',{cookie:admin})).json(),id=users.find(u=>u.email===a.email).id;
 await request('/api/admin/access',{cookie:admin,method:'POST',body:{id,active:false}});assert.equal((await request('/api/progress',{cookie:sa})).status,401);
 await request('/api/admin/reset',{cookie:admin,method:'POST',body:{id:users.find(u=>u.email===b.email).id}});assert.equal((await request('/api/progress',{cookie:sb})).status,401);
 await request('/api/logout',{cookie:admin,method:'POST',body:{}});assert.equal((await request('/api/admin/users',{cookie:admin})).status,401);
 console.log('Student authentication passed: protected assets, password change, admin roles, CSRF, isolated cross-session progress, disable/reset/logout revocation.');
}finally{child.kill();await once(child,'exit');await rm(dir,{recursive:true,force:true});}
