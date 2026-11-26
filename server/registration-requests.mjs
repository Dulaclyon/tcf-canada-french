import {validAccessMonths} from './access-expiry.mjs';
import {randomBytes} from 'node:crypto';
import {basicOnly,validPermissions} from './section-permissions.mjs';
const fail=(status,message)=>Object.assign(Error(message),{status});
export function registrationRequests(db,{validName,validEmail,hash,digest,now=Date.now,grantAccess}){
 db.exec(`CREATE TABLE IF NOT EXISTS registration_requests(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at INTEGER NOT NULL,decided_at INTEGER,user_id TEXT);CREATE TABLE IF NOT EXISTS registration_request_limits(ip TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
 function request(b,ip){
  if(!b||!validName(b.name)||!b.name.trim())throw fail(400,'请填写姓名，最多 100 个字符。');
  const email=typeof b.email==='string'?b.email.trim().toLowerCase():'';if(!validEmail(email))throw fail(400,'请输入有效邮箱');
  const key=digest(ip||'unknown'),at=now();db.prepare('DELETE FROM registration_request_limits WHERE expires<=?').run(at);
  let limit=db.prepare('SELECT count FROM registration_request_limits WHERE ip=?').get(key);if(limit?.count>=30)throw fail(429,'申请过于频繁，请稍后重试。');
  db.prepare('INSERT INTO registration_request_limits VALUES(?,1,?) ON CONFLICT(ip) DO UPDATE SET count=count+1').run(key,at+900000);
  // Identical acknowledgement for existing, repeated and new email addresses.
  if(!db.prepare('SELECT id FROM users WHERE email=?').get(email)&&db.prepare("SELECT count(*) AS n FROM registration_requests WHERE status='pending'").get().n<200){
   db.prepare("INSERT INTO registration_requests(id,email,name,status,created_at) VALUES(?,?,?,'pending',?) ON CONFLICT(email) DO NOTHING").run(randomBytes(16).toString('hex'),email,b.name.trim().normalize('NFC'),at);
  }
  return {ok:true};
 }
 function list(){return db.prepare("SELECT r.id,r.email,r.name,r.status,r.created_at FROM registration_requests r WHERE r.status IN ('pending','declined') AND NOT EXISTS(SELECT 1 FROM users u WHERE u.email=r.email) ORDER BY r.created_at DESC,r.rowid DESC").all();}
 function approve(id,permissions=basicOnly,accessMonths){
  if(!validAccessMonths(accessMonths))throw fail(400,'Invalid access duration.');
  if(!validPermissions(permissions))throw fail(400,'无效权限设置');
  const row=db.prepare('SELECT * FROM registration_requests WHERE id=?').get(id);if(!row)throw fail(404,'申请不存在。');if(row.status==='approved')throw fail(409,'申请已处理，请使用现有学生账号。');
  if(db.prepare('SELECT id FROM users WHERE email=?').get(row.email))throw fail(409,'此邮箱已注册');
  if(db.prepare("SELECT count(*) AS n FROM users WHERE role='student'").get().n>=100)throw fail(400,'已达到 100 名学生上限');
  const userId=randomBytes(16).toString('hex'),password=randomBytes(15).toString('base64url');
  db.exec('BEGIN IMMEDIATE');try{
   db.prepare('INSERT INTO users(id,email,name,password,role,must_change,active) VALUES(?,?,?,?,\'student\',1,1)').run(userId,row.email,row.name,hash(password));
   db.prepare('INSERT INTO permissions VALUES(?,?)').run(userId,JSON.stringify(permissions));
   if(grantAccess)grantAccess(userId,permissions,accessMonths);
   db.prepare("UPDATE registration_requests SET status='approved',decided_at=?,user_id=? WHERE id=?").run(now(),userId,id);db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
  return {id:userId,email:row.email,name:row.name,password};
 }
 function decline(id){const row=db.prepare('SELECT status FROM registration_requests WHERE id=?').get(id);if(!row)throw fail(404,'申请不存在。');if(row.status==='approved')throw fail(409,'申请已处理，请使用现有学生账号。');db.prepare("UPDATE registration_requests SET status='declined',decided_at=? WHERE id=?").run(now(),id);return {ok:true};}
 function reconcile(email,id){db.prepare("UPDATE registration_requests SET status='approved',decided_at=?,user_id=? WHERE email=? AND status<>'approved'").run(now(),id,email);}
 return {request,list,approve,decline,reconcile};
}
