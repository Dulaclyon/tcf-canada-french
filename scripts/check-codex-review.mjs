import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {codexReview} from '../server/codex-review.mjs';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {runCodex,subscriptionEnv} from '../connector/codex-runner.mjs';
const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE writing_submissions(id TEXT PRIMARY KEY,question_id TEXT,task INTEGER,prompt TEXT,text TEXT)');db.prepare('INSERT INTO writing_submissions VALUES(?,?,?,?,?)').run('essay','question',1,'French question','Je suis aller à Paris.');
let time=1000000000000;const now=()=>time,c=codexReview(db,{now}),token='a'.repeat(64);
assert.equal(c.config().enabled,false);assert.equal(c.authenticate(token),false);assert.throws(()=>c.enqueue('essay','en','teacher'),e=>e.status===503);c.pair(token,'teacher');assert(c.authenticate(token));assert(!JSON.stringify(db.prepare('SELECT * FROM codex_connector').get()).includes(token));assert.equal(c.config().enabled,false);c.heartbeat();assert(c.config().enabled);
const queued=c.enqueue('essay','en','teacher');assert.equal(queued.status,'queued');assert.equal(c.enqueue('essay','en','teacher').id,queued.id);
const {job}=c.claim([{id:'question',prompt:'French question',documents:['Source']}]);assert.deepEqual(Object.keys(job.essay).sort(),['documents','prompt','task','text']);assert.deepEqual(job.essay.documents,['Source']);assert.equal(c.claim([]).job,null);assert.throws(()=>c.finish({id:job.id,lease:'wrong'}),e=>e.status===409);
const a={summary:'Clear.',estimated_level:'A2',task_fulfilment:'Relevant.',organization:'Clear.',language:'Check the past participle.',strengths:['Clear.'],priorities:['Agreement.'],corrections:[{original:'invented',corrected:'wrong',explanation:'Discard.'},{original:'suis aller',corrected:'suis allé',explanation:'Past participle.'}],revised_text:'Je suis allé à Paris.'};
assert.throws(()=>c.finish({id:job.id,lease:job.lease,assessment:{}}));c.finish({id:job.id,lease:job.lease,assessment:a});assert.equal(c.get('essay','en').assessment.corrections.length,1);assert.equal(c.enqueue('essay','en','teacher').id,job.id);assert.deepEqual(c.finish({id:job.id,lease:job.lease,assessment:a}),{ok:true});
c.enqueue('essay','zh-TW','teacher');const pending=c.claim([{id:'question',prompt:'changed',documents:['Do not send']}]).job;assert.deepEqual(pending.essay.documents,[]);time+=600001;assert.equal(c.get('essay','zh-TW').status,'failed');assert.throws(()=>c.finish({id:pending.id,lease:pending.lease,assessment:a}),e=>e.status===409);assert.equal(c.config().enabled,false);c.heartbeat();c.enqueue('essay','zh-TW','teacher');const retry=c.claim([]).job;assert.notEqual(retry.id,pending.id);c.finish({id:retry.id,lease:retry.lease,error:'raw secret error'});assert(!c.get('essay','zh-TW').error.includes('secret'));
c.pair('b'.repeat(64),'teacher');assert(!c.authenticate(token));assert.equal(c.config().enabled,false);c.revoke();assert(!c.authenticate('b'.repeat(64)));assert.equal(c.config().paired,false);
const env=subscriptionEnv({HOME:'/home/test',PATH:'/bin',OPENAI_API_KEY:'secret',CODEX_API_KEY:'secret',CONNECTOR_TOKEN:'secret',ADMIN_PASSWORD:'secret'});assert.deepEqual(env,{HOME:'/home/test',PATH:'/bin'});db.close();
console.log('Codex connector passed: hashed pairing/revocation, offline gate, minimal essay payload, private validated results, cache/idempotence, single worker lease, expiry/retry, stale-result rejection and no API-key environment.');

const fixture=await mkdtemp(path.join(tmpdir(),'codex-auth-guard-'));
try{const binary=path.join(fixture,'codex');await writeFile(binary,'#!/bin/sh\necho "Logged in using API key"\n',{mode:0o700});await assert.rejects(runCodex({}, {binary}),e=>e.code==='auth');}finally{await rm(fixture,{recursive:true,force:true});}
console.log('Every assessment refuses saved API-key authentication before running Codex.');
