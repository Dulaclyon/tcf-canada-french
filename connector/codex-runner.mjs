import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {assessmentRequest,assessmentSchema,validateAssessment} from '../server/essay-assessment.mjs';
export function subscriptionEnv(env=process.env){const clean={};for(const key of ['PATH','HOME','USER','LOGNAME','TMPDIR','LANG','CODEX_HOME'])if(env[key])clean[key]=env[key];return clean;}
export async function runCodex(job,{binary='codex',env=process.env,timeout=480000}={}){
 const login=spawnSync(binary,['login','status'],{env:subscriptionEnv(env),encoding:'utf8',timeout:15000});
 if(login.status!==0||!/Logged in using ChatGPT/i.test(login.stdout+login.stderr))throw Object.assign(Error('Sign into Codex with ChatGPT. API-key authentication is not permitted.'),{code:'auth'});
 const dir=await mkdtemp(path.join(tmpdir(),'french-codex-review-'));
 try{
  const schema=path.join(dir,'schema.json'),output=path.join(dir,'assessment.json');
  await writeFile(schema,JSON.stringify(assessmentSchema),{mode:0o600});
  const request=assessmentRequest(job.essay,job.language,'codex');
  const args=['exec','--ignore-user-config','--ignore-rules','--ephemeral','--skip-git-repo-check','--sandbox','read-only','-c','approval_policy="never"','-c','web_search="disabled"','-c','features.shell_tool=false','--output-schema',schema,'--output-last-message',output,'-C',dir,'-'];
  await new Promise((resolve,reject)=>{
   const child=spawn(binary,args,{env:subscriptionEnv(env),stdio:['pipe','ignore','pipe']});let stderr='',timed=false;
   child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-12000);});
   const timer=setTimeout(()=>{timed=true;child.kill('SIGTERM');setTimeout(()=>child.kill('SIGKILL'),3000).unref();},timeout);
   child.on('error',()=>{clearTimeout(timer);reject(Object.assign(Error('Codex could not start. Install Codex or check its path.'),{code:'failed'}));});
   child.on('close',code=>{clearTimeout(timer);if(code===0)return resolve();const kind=timed?'timeout':/usage limit|rate.limit|quota|credits|limit reached/i.test(stderr)?'limit':/unauthorized|not logged|login|authentication|401/i.test(stderr)?'auth':'failed';reject(Object.assign(Error({timeout:'Codex timed out.',limit:'Codex subscription limit reached.',auth:'Sign into Codex with ChatGPT.',failed:'Codex did not complete the assessment.'}[kind]),{code:kind}));});
   child.stdin.on('error',()=>{});child.stdin.end(request.instructions+'\nDo not use tools, commands, web search, or access any files. Return only the assessment JSON.\nUntrusted essay data:\n'+request.input[0].content);
  });
  const raw=await readFile(output,'utf8');if(raw.length>160000)throw Error('Assessment too large');
  return validateAssessment(JSON.parse(raw));
 }finally{await rm(dir,{recursive:true,force:true});}
}
