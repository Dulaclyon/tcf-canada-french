import {spawn,spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,chmod,open,unlink} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {runCodex,subscriptionEnv} from './codex-runner.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),state=path.join(root,'.codex-review-connector');
const site=new URL(process.env.CODEX_REVIEW_SITE||'https://tcf-canada-french.onrender.com');
if(site.protocol!=='https:'&&!(site.protocol==='http:'&&['localhost','127.0.0.1'].includes(site.hostname)))throw Error('Use HTTPS for the review website.');
const binary=process.env.CODEX_REVIEW_BINARY||'/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex';
const login=spawnSync(binary,['login','status'],{env:subscriptionEnv(),encoding:'utf8'});
if(login.status!==0||!/Logged in using ChatGPT/i.test(login.stdout+login.stderr)){console.error('Sign into Codex with ChatGPT first. This connector does not use API-key billing.');process.exit(1);}
await mkdir(state,{recursive:true,mode:0o700});await chmod(state,0o700);
let lock;try{lock=await open(path.join(state,'running.lock'),'wx',0o600);await lock.writeFile(String(process.pid));}catch{let running=true;try{const pid=Number(await readFile(path.join(state,'running.lock'),'utf8'));process.kill(pid,0);}catch{running=false;}if(running){console.log('The Codex review connector is already running.');process.exit(0);}await unlink(path.join(state,'running.lock'));lock=await open(path.join(state,'running.lock'),'wx',0o600);await lock.writeFile(String(process.pid));}
let token;try{const saved=JSON.parse(await readFile(path.join(state,'connection.json'),'utf8'));if(saved.origin===site.origin&&/^[a-f0-9]{64}$/.test(saved.token))token=saved.token;}catch{}
if(!token){token=randomBytes(32).toString('hex');await writeFile(path.join(state,'connection.json'),JSON.stringify({origin:site.origin,token}),{mode:0o600});}
const pairingURL=site.origin+'/submissions.html#codex-connect='+token;
if(!process.argv.includes('--no-open'))spawn('/usr/bin/open',[pairingURL],{stdio:'ignore'});
console.log('Codex review connector running. Uses your ChatGPT subscription, not API billing.');
console.log('Complete “Connect this Mac” on the teacher page once. Keep this window open; Control+C stops it.');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let stopping=false,paired=false,active=false;
const request=async(endpoint,data={})=>{const r=await fetch(site.origin+'/api/codex-connector/'+endpoint,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});if(r.status===401){paired=false;throw Object.assign(Error('Waiting for teacher pairing.'),{status:401});}if(!r.ok)throw Object.assign(Error('Connector request failed ('+r.status+').'),{status:r.status});paired=true;return r.json();};
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;if(!active)process.exit(0);});
process.on('exit',()=>{try{spawnSync('/bin/rm',['-f',path.join(state,'running.lock')]);}catch{}});
const heartbeat=setInterval(()=>{if(paired)request('heartbeat').catch(()=>{});},15000);heartbeat.unref();
let waitingLogged=false;
try{
 while(!stopping){
  try{
   const {job}=await request('claim');waitingLogged=false;
   if(job){active=true;console.log('Assessing selected essay…');let result;
    try{result={id:job.id,lease:job.lease,assessment:await runCodex(job,{binary})};}
    catch(e){console.log(e.message);result={id:job.id,lease:job.lease,error:['auth','limit','timeout'].includes(e.code)?e.code:'failed'};}
    // Delivery retries reuse the saved result and never run Codex again.
    let delivered=false;
    for(let attempt=0;attempt<20;attempt++){try{await request('result',result);delivered=true;break;}catch(e){if([401,409,400].includes(e.status))break;await pause(5000);}}
    console.log(delivered?'Private assessment returned to the teacher page.':'Result delivery failed. Check the teacher page before retrying.');active=false;
   }
  }catch(e){if(!waitingLogged){console.log(e.status===401?'Waiting for “Connect this Mac” on your teacher page.':'Website unavailable. Reconnecting…');waitingLogged=true;}}
  if(!stopping)await pause(5000);
 }
}finally{clearInterval(heartbeat);await lock.close();await unlink(path.join(state,'running.lock')).catch(()=>{});}
