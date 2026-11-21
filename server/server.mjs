import {learningDashboard} from './learning-dashboard.mjs';
import http from 'node:http';
import {writingSubmissions} from './writing-submissions.mjs';
import {sections,allSections,basicOnly,validPermissions} from './section-permissions.mjs';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {readFile,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.env.STATIC_DIR||'dist'),data=path.resolve(process.env.DATA_DIR||'.student-data');await mkdir(data,{recursive:true});
const db=new DatabaseSync(path.join(data,'students.sqlite'));db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL,must_change INTEGER NOT NULL DEFAULT 1,active INTEGER NOT NULL DEFAULT 1); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS progress(user_id TEXT NOT NULL,key TEXT NOT NULL,value TEXT NOT NULL,PRIMARY KEY(user_id,key)); CREATE TABLE IF NOT EXISTS attempts(ip TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
db.exec("CREATE TABLE IF NOT EXISTS permissions(user_id TEXT PRIMARY KEY,value TEXT NOT NULL)");
const permissionsFor=u=>u.role==='admin'?allSections:JSON.parse(db.prepare('SELECT value FROM permissions WHERE user_id=?').get(u.id)?.value||JSON.stringify(allSections));
let bankAssetsPromise;
async function bankAssets(){
 if(!bankAssetsPromise)bankAssetsPromise=(async()=>{
  const index=JSON.parse(await readFile(path.join(root,'bank/index.json'),'utf8')),map=new Map();
  for(const set of index.sets){
   map.set('bank/sets/'+set.id+'.json',new Set([set.kind]));
   const body=JSON.parse(await readFile(path.join(root,'bank/sets',set.id+'.json'),'utf8'));
   for(const q of body.questions)for(const asset of [q.audio,...(q.images||[])].filter(Boolean)){
    if(!map.has(asset))map.set(asset,new Set());map.get(asset).add(set.kind);
   }
  }
  return map;
 })().catch(e=>{bankAssetsPromise=null;throw e;});
 return bankAssetsPromise;
}
const hash=p=>{const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex')};
const verify=(p,h)=>{const [s,v]=h.split(':');return timingSafeEqual(scryptSync(p,s,64),Buffer.from(v,'hex'))};
const email=v=>typeof v==='string'&&v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const digest=s=>createHash('sha256').update(s).digest('hex');
if(!db.prepare("SELECT id FROM users WHERE role='admin'").get()){
 const e=process.env.ADMIN_EMAIL?.trim().toLowerCase(),p=process.env.ADMIN_PASSWORD;
 if(!email(e)||!p||p.length<12)throw Error('First start requires ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters).');
 db.prepare('INSERT INTO users VALUES(?,?,?,?,0,1)').run(randomBytes(16).toString('hex'),e,hash(p),'admin');
}
const handleWriting=writingSubmissions(db,root,permissionsFor);
const dashboard=learningDashboard(db,root,permissionsFor);
const keys=new Set(['french-learning-v1','tcf-bank-progress-v1','tcf-bank-completed-v1']);
const publicFiles=new Set(['brand.css','assets/fonts/source-sans-3-latin.woff2','assets/fonts/source-sans-3-ext.woff2','assets/paris-editorial.jpg','assets/french-notebook.jpg','assets/fonts/dm-sans-regular.ttf','assets/fonts/dm-sans-bold.ttf','assets/fonts/dm-sans-extrabold.ttf','assets/fonts/cormorant-italic.ttf','i18n.js','ui-locales.js','index.html','landing.css','icon.svg','privacy.html','login.html','account.css','login.js']);
const types={'.woff2':'font/woff2','.ttf':'font/ttf','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.m4a':'audio/mp4','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
 const send=(status,value,extra={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin',...extra});res.end(typeof value==='string'?value:JSON.stringify(value));};
 try{
 const url=new URL(req.url,'http://localhost'),route=url.pathname;
 const token=/(?:^|;\s*)tcf_session=([a-f0-9]+)/.exec(req.headers.cookie||'')?.[1];
 const user=token?db.prepare('SELECT users.*,sessions.token FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND expires>? AND active=1').get(digest(token),Date.now()):null;
 // Narrow bearer-only worker channel. It cannot publish feedback or access admin APIs.
 if(route.startsWith('/api/codex-connector/')){
  const body=async()=>{let s='';for await(const c of req){s+=c;if(Buffer.byteLength(s)>160000)throw Error('Too large');}return JSON.parse(s||'{}');};
  return await handleWriting.connector({route,req,body,send});
 }
 const mutation=!['GET','HEAD'].includes(req.method);
 if(mutation){const origin=req.headers.origin;const expected=process.env.PUBLIC_ORIGIN||`http://${req.headers.host}`;if(origin!==expected)return send(403,{error:'请求来源无法验证'});if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'需要 JSON 请求'});}
 const body=async()=>{let s='';for await(const c of req){s+=c;if(Buffer.byteLength(s)>2*1024*1024)throw Error('请求过大');}return JSON.parse(s||'{}')};
 if(route==='/api/login'&&req.method==='POST'){
 const b=await body(),ip=req.socket.remoteAddress,now=Date.now();let a=db.prepare('SELECT * FROM attempts WHERE ip=?').get(ip);if(a?.expires>now&&a.count>=10)return send(429,{error:'尝试次数过多，请 15 分钟后重试'});
 if(!a||a.expires<=now)db.prepare('INSERT OR REPLACE INTO attempts VALUES(?,0,?)').run(ip,now+900000);
 db.prepare('UPDATE attempts SET count=count+1 WHERE ip=?').run(ip);
 const u=db.prepare('SELECT * FROM users WHERE email=? AND active=1').get(String(b.email||'').trim().toLowerCase());
 if(typeof b.password!=='string'||b.password.length>256||!verify(b.password,u?.password||'00000000000000000000000000000000:'+ '00'.repeat(64))||!u)return send(401,{error:'邮箱或密码不正确'});
 db.prepare('DELETE FROM attempts WHERE ip=?').run(ip);const t=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(now);db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(t),u.id,now+7*86400000);
 return send(200,{ok:true,mustChange:!!u.must_change},{'Set-Cookie':`tcf_session=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${process.env.PUBLIC_ORIGIN?.startsWith('https:')?'; Secure':''}`});
 }
 if(route==='/api/me')return send(user?200:401,user?{id:user.id,email:user.email,role:user.role,mustChange:!!user.must_change,permissions:permissionsFor(user)}:{error:'请先登录'});
 if(route.startsWith('/api/')){
 if(!user)return send(401,{error:'请先登录'});
 if(route==='/api/logout'&&req.method==='POST'){db.prepare('DELETE FROM sessions WHERE token=?').run(user.token);return send(200,{ok:true},{'Set-Cookie':'tcf_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
 if(route==='/api/password'&&req.method==='POST'){const b=await body();if(typeof b.password!=='string'||b.password.length<12||b.password.length>256||b.password===b.current||!verify(String(b.current||''),user.password))return send(400,{error:'当前密码错误，或新密码不足 12 位'});db.prepare('UPDATE users SET password=?,must_change=0 WHERE id=?').run(hash(b.password),user.id);db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').run(user.id,user.token);return send(200,{ok:true});}
 if(user.must_change)return send(403,{error:'请先修改临时密码'});
 if(route==='/api/learning-progress'&&req.method==='GET')return send(200,await dashboard.student(user));
 if(route==='/api/admin/learning-progress'&&req.method==='GET'){if(user.role!=='admin')return send(403,{error:'仅管理员可操作'});return send(200,await dashboard.teacher());}
 if(route.startsWith('/api/writing/')||route.startsWith('/api/admin/writing'))return await handleWriting({route,req,url,user,body,send});
 if(route==='/api/progress'&&req.method==='GET')return send(200,Object.fromEntries(db.prepare('SELECT key,value FROM progress WHERE user_id=?').all(user.id).map(r=>[r.key,JSON.parse(r.value)])));
 if(route==='/api/progress'&&req.method==='PUT'){const b=await body();if(!keys.has(b.key)||!b.value||typeof b.value!=='object'||Array.isArray(b.value))return send(400,{error:'无效学习记录'});db.exec('BEGIN IMMEDIATE');try{if(b.key==='french-learning-v1'){const stored=db.prepare('SELECT value FROM progress WHERE user_id=? AND key=?').get(user.id,b.key);handleWriting.syncCompleted(user,b.value,stored?JSON.parse(stored.value):{});}db.prepare('INSERT INTO progress VALUES(?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value').run(user.id,b.key,JSON.stringify(b.value));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}return send(200,{ok:true});}
 if(route.startsWith('/api/admin/')){
 if(user.role!=='admin')return send(403,{error:'仅管理员可操作'});
 if(route==='/api/admin/users'&&req.method==='GET')return send(200,db.prepare("SELECT id,email,active,must_change FROM users WHERE role='student' ORDER BY email").all().map(u=>({...u,permissions:permissionsFor({...u,role:'student'})})));
 const b=await body();
 if(route==='/api/admin/users'&&req.method==='POST'){const e=String(b.email||'').trim().toLowerCase();if(!email(e))return send(400,{error:'请输入有效邮箱'});if(db.prepare('SELECT id FROM users WHERE email=?').get(e))return send(409,{error:'此邮箱已注册'});if(db.prepare("SELECT count(*) AS n FROM users WHERE role='student'").get().n>=100)return send(400,{error:'已达到 100 名学生上限'});const p=randomBytes(15).toString('base64url');const id=randomBytes(16).toString('hex');db.prepare('INSERT INTO users VALUES(?,?,?,?,1,1)').run(id,e,hash(p),'student');db.prepare('INSERT INTO permissions VALUES(?,?)').run(id,JSON.stringify(basicOnly));return send(201,{email:e,password:p});}
 const target=db.prepare("SELECT * FROM users WHERE id=? AND role='student'").get(b.id);if(!target)return send(404,{error:'学生不存在'});
 if(route==='/api/admin/permissions'&&req.method==='POST'){if(!validPermissions(b.permissions))return send(400,{error:'无效权限设置'});db.prepare('INSERT INTO permissions VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value').run(target.id,JSON.stringify(b.permissions));return send(200,{ok:true,permissions:b.permissions});}
 if(route==='/api/admin/reset'&&req.method==='POST'){const p=randomBytes(15).toString('base64url');db.prepare('UPDATE users SET password=?,must_change=1 WHERE id=?').run(hash(p),target.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(target.id);return send(200,{email:target.email,password:p});}
 if(route==='/api/admin/access'&&req.method==='POST'){db.prepare('UPDATE users SET active=? WHERE id=?').run(b.active===true?1:0,target.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(target.id);return send(200,{ok:true});}
 }
 return send(404,{error:'接口不存在'});
 }
 let name=path.posix.normalize(decodeURIComponent(route)).replace(/^\//,'')||'index.html';if(name==='login')name='login.html';if(name==='admin')name='admin.html';
 if(!publicFiles.has(name)&&(!user||user.must_change)){res.writeHead(303,{Location:'/login.html','Cache-Control':'no-store'});return res.end();}
 if(['admin.html','submissions.html','submissions.js','essay-assessment.js'].includes(name)&&user?.role!=='admin')return send(403,{error:'仅管理员可操作'});
 if(name==='sw.js')return send(404,'');
 const access=user?permissionsFor(user):null;
 if(user&&user.role!=='admin'){
  const denied=()=>send(403,{error:'此板块尚未开放，请联系老师。'});
  if(['pronunciation-layout.js','course-editorial.js','course-translations.js','basic-verbs.js','weather-lesson.js','possessive-recap.js','lesson-recaps.js'].includes(name)&&!access.basics)return denied();
  if((name.startsWith('human-audio/')||name.startsWith('pronunciation-audio/'))&&!access.basics)return denied();
  if(name==='src/data/materials.json'||name==='src/data/courses.json'){
   if(!access.basics)return send(200,[]);
  }
  if(name==='src/data/exam.json'){
   const exam=JSON.parse(await readFile(path.join(root,name),'utf8'));
   for(const section of sections.filter(k=>k!=='basics'))if(!access[section]){
    exam[section]=[];if(exam[section+'Tasks'])exam[section+'Tasks']=[];
   }
   return send(200,exam);
  }
  if(name==='bank/index.json'){
   const index=JSON.parse(await readFile(path.join(root,name),'utf8'));
   return send(200,{...index,sets:index.sets.filter(s=>access[s.kind])});
  }
  if(name.startsWith('bank/')){
   if(!access.listening&&!access.reading)return denied();
   const allowed=(await bankAssets()).get(name);
   if(!allowed||![...allowed].some(k=>access[k]))return denied();
  }
 }

 const file=path.resolve(root,name);if(!file.startsWith(root+path.sep))return send(404,'');const info=await stat(file);if(!info.isFile())return send(404,'');const content=await readFile(file);
 // Private files are never cached; range support keeps original audio seekable.
 let start=0,end=content.length-1,status=200;const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');if(range){start=Number(range[1]);end=range[2]?Math.min(end,Number(range[2])):end;if(start>end||start>=content.length)return send(416,'',{'Content-Range':`bytes */${content.length}`});status=206;}
 res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${content.length}`}:{})});res.end(req.method==='HEAD'?undefined:content.subarray(start,end+1));
 }catch(e){send(e.code==='ENOENT'?404:400,{error:e.code==='ENOENT'?'页面不存在':'请求无法处理'});}
});
server.listen(Number(process.env.PORT||4174),process.env.HOST||'127.0.0.1',()=>console.log('Student server listening on '+server.address().port));
