import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {SECTION_NOTE_KEYS,SECTION_NOTE_LIMIT,validSectionNote} from '../section-notes-model.js';
assert.equal(Object.keys(SECTION_NOTE_KEYS).length,4);assert(validSectionNote({text:'中'.repeat(2000)}));assert(!validSectionNote({text:'x'.repeat(2001)}));assert(!validSectionNote({text:'ok',history:['unbounded']}));
const dir=await mkdtemp(path.join(tmpdir(),'tcf-notes-'));let child,base;
async function start(){child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'0',PUBLIC_ORIGIN:'',DATA_DIR:dir,ADMIN_EMAIL:'teacher@example.test',ADMIN_PASSWORD:'teacher-password-test',OPENAI_API_KEY:''},stdio:['ignore','pipe','pipe']});let out='';base=await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{out+=b;const m=/listening on (\d+)/.exec(out);if(m)resolve('http://127.0.0.1:'+m[1]);});child.once('exit',()=>reject(Error(out)));});}
const req=(route,cookie,data,method=data?'POST':'GET',origin=base)=>fetch(base+route,{method,headers:{...(cookie?{cookie}:{}),...(data?{'content-type':'application/json',origin}:{})},body:data?JSON.stringify(data):undefined});
const json=async r=>{assert(r.ok,await r.clone().text());return r.json();};const login=async(email,password)=>{const r=await req('/api/login',null,{email,password});assert(r.ok);return r.headers.get('set-cookie').split(';')[0];};
try{
 await start();const owner=await login('teacher@example.test','teacher-password-test');
 const add=async email=>{const u=await json(await req('/api/admin/users',owner,{email})),cookie=await login(email,u.password);await json(await req('/api/password',cookie,{current:u.password,password:'student-notes-password'}));return cookie;};
 let a=await add('a@example.test'),b=await add('b@example.test');
 const write=(cookie,key,value,origin)=>req('/api/progress',cookie,{key,value},'PUT',origin);
 assert.equal((await write(null,SECTION_NOTE_KEYS.writing,{text:'no session'})).status,401);
 for(const [kind,key] of Object.entries(SECTION_NOTE_KEYS))await json(await write(a,key,{text:kind+': Bonjour, 中文笔记, café <script>alert(1)</script>'}));
 assert.equal((await write(a,SECTION_NOTE_KEYS.writing,{text:'x'},'https://evil.test')).status,403);
 for(const value of [{text:'x'.repeat(SECTION_NOTE_LIMIT+1)},{text:42},{text:'ok',other:'unbounded'},[],null])assert.equal((await write(a,SECTION_NOTE_KEYS.writing,value)).status,400);
 assert.equal((await write(a,'tcf-section-notes-extra-v1',{text:'extra'})).status,400);
 await json(await write(a,SECTION_NOTE_KEYS.writing,{text:'中'.repeat(2000)}));
 await json(await write(a,SECTION_NOTE_KEYS.writing,{text:'Latest note only'}));
 let own=await json(await req('/api/progress',a));assert.equal(own[SECTION_NOTE_KEYS.writing].text,'Latest note only');assert.equal(Object.keys(own).length,4);assert(own[SECTION_NOTE_KEYS.reading].text.startsWith('reading:'));
 assert.deepEqual(await json(await req('/api/progress',b)),{});assert.deepEqual(await json(await req('/api/progress',owner)),{});
 const board=await json(await req('/api/admin/learning-progress',owner));assert(!JSON.stringify(board).includes('Latest note only'));
 const second=await login('a@example.test','student-notes-password');assert.equal((await json(await req('/api/progress',second)))[SECTION_NOTE_KEYS.writing].text,'Latest note only');
 await json(await write(second,SECTION_NOTE_KEYS.writing,{text:''}));assert.equal((await json(await req('/api/progress',second)))[SECTION_NOTE_KEYS.writing].text,'');
 child.kill();await once(child,'exit');await start();a=await login('a@example.test','student-notes-password');own=await json(await req('/api/progress',a));assert(own[SECTION_NOTE_KEYS.listening].text.startsWith('listening:'));assert.equal(own[SECTION_NOTE_KEYS.writing].text,'');
 console.log('Section notes passed: four bounded notes, exact 2000-character limit, no extra fields/history, account isolation, CSRF, replacement, clearing, cross-session and restart persistence.');
}finally{if(child?.exitCode===null){child.kill();await once(child,'exit');}await rm(dir,{recursive:true,force:true});}
