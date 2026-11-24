import {createHash,randomBytes} from 'node:crypto';
export function notificationService(db){
 db.exec(`CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,title TEXT NOT NULL,message TEXT NOT NULL,sender_id TEXT NOT NULL,audience TEXT NOT NULL,created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS notification_recipients(notification_id TEXT NOT NULL,user_id TEXT NOT NULL,read_at INTEGER,PRIMARY KEY(notification_id,user_id)); CREATE INDEX IF NOT EXISTS notification_recipient_user ON notification_recipients(user_id,read_at);`);
 if(!db.prepare('PRAGMA table_info(notifications)').all().some(c=>c.name==='action_url'))db.exec("ALTER TABLE notifications ADD COLUMN action_url TEXT NOT NULL DEFAULT ''");
 db.exec('CREATE TABLE IF NOT EXISTS notification_events(event_key TEXT PRIMARY KEY,created_at INTEGER NOT NULL)');
 const notifySubmission=(user,{key,title,url})=>{
  if(!['student','guest'].includes(user.role))return;
  const recipients=db.prepare("SELECT id FROM users WHERE role IN ('owner','admin','teacher') AND active=1").all();if(!recipients.length)return;
  const eventKey=createHash('sha256').update(user.id+':'+key).digest('hex');
  if(!db.prepare('INSERT OR IGNORE INTO notification_events VALUES(?,?)').run(eventKey,Date.now()).changes)return;
  const id=randomBytes(16).toString('hex');
  db.prepare('INSERT INTO notifications(id,title,message,sender_id,audience,created_at,action_url) VALUES(?,?,?,?,?,?,?)').run(id,'New student submission',(user.name||user.email)+' · '+title,user.id,'submission',Date.now(),url);
  for(const recipient of recipients)db.prepare('INSERT INTO notification_recipients VALUES(?,?,NULL)').run(id,recipient.id);
  db.exec('DELETE FROM notification_recipients WHERE notification_id IN (SELECT id FROM notifications ORDER BY created_at DESC,rowid DESC LIMIT -1 OFFSET 200); DELETE FROM notifications WHERE id IN (SELECT id FROM notifications ORDER BY created_at DESC,rowid DESC LIMIT -1 OFFSET 200)');
 };
 const notifyFeedback=({studentId,questionId,title,version})=>{
  const key='feedback:'+studentId+':'+version;
  if(!db.prepare('INSERT OR IGNORE INTO notification_events VALUES(?,?)').run(key,Date.now()).changes)return;
  const id=randomBytes(16).toString('hex');
  db.prepare('INSERT INTO notifications(id,title,message,sender_id,audience,created_at,action_url) VALUES(?,?,?,?,?,?,?)').run(id,'Your assessment is ready',title,'system','feedback',Date.now(),'/app.html#writing/'+encodeURIComponent(questionId));
  db.prepare('INSERT INTO notification_recipients VALUES(?,?,NULL)').run(id,studentId);
  db.exec('DELETE FROM notification_recipients WHERE notification_id IN (SELECT id FROM notifications ORDER BY created_at DESC,rowid DESC LIMIT -1 OFFSET 200); DELETE FROM notifications WHERE id IN (SELECT id FROM notifications ORDER BY created_at DESC,rowid DESC LIMIT -1 OFFSET 200)');
 };
 const activeStudents=()=>db.prepare("SELECT id,name,email FROM users WHERE role='student' AND active=1 ORDER BY name,email").all();
 const unread=user=>db.prepare('SELECT count(*) AS n FROM notification_recipients r JOIN notifications n ON n.id=r.notification_id WHERE r.user_id=? AND r.read_at IS NULL').get(user.id).n;
 const handler=async({route,req,user,body,send})=>{
  if(user.role==='guest'&&route.startsWith('/api/admin/notifications')&&!['GET','HEAD'].includes(req.method))return send(403,{error:'Guest notifications access is view-only.'});
  if(route.startsWith('/api/admin/notifications')&&!['owner','admin','teacher','guest'].includes(user.role))return send(403,{error:'仅管理员可操作'});
  if(route==='/api/admin/notifications/recipients'&&req.method==='GET')return send(200,activeStudents());
  if(route==='/api/notifications/unread-count'&&req.method==='GET')return send(200,{unread:unread(user)});
  if(route==='/api/notifications'&&req.method==='GET')return send(200,{unread:unread(user),items:db.prepare('SELECT n.id,n.title,n.message,n.action_url AS actionUrl,n.created_at AS createdAt,r.read_at AS readAt FROM notification_recipients r JOIN notifications n ON n.id=r.notification_id WHERE r.user_id=? ORDER BY n.created_at DESC,n.rowid DESC LIMIT 200').all(user.id)});
  if(route==='/api/notifications/read'&&req.method==='POST'){
   const b=await body();if(b.all===true)db.prepare('UPDATE notification_recipients SET read_at=COALESCE(read_at,?) WHERE user_id=?').run(Date.now(),user.id);
   else{if(typeof b.id!=='string')return send(400,{error:'无效通知'});const result=db.prepare('UPDATE notification_recipients SET read_at=COALESCE(read_at,?) WHERE notification_id=? AND user_id=?').run(Date.now(),b.id,user.id);if(!result.changes)return send(404,{error:'通知不存在'});}
   return send(200,{ok:true,unread:unread(user)});
  }
  if(route==='/api/admin/notifications'&&req.method==='GET')return send(200,db.prepare('SELECT n.id,n.title,n.message,n.audience,n.created_at AS createdAt,count(r.user_id) AS recipientCount,sum(CASE WHEN r.read_at IS NOT NULL THEN 1 ELSE 0 END) AS readCount FROM notifications n LEFT JOIN notification_recipients r ON r.notification_id=n.id WHERE n.audience NOT IN (\'submission\',\'feedback\') GROUP BY n.id ORDER BY n.created_at DESC,n.rowid DESC LIMIT 50').all().map(n=>({...n,recipients:db.prepare('SELECT u.name,u.email FROM notification_recipients r JOIN users u ON u.id=r.user_id WHERE r.notification_id=? ORDER BY u.name,u.email').all(n.id)})));
  if(route==='/api/admin/notifications'&&req.method==='POST'){
   const b=await body();if(typeof b.title!=='string'||!b.title.trim()||b.title.length>120||/[\u0000-\u001f\u007f]/u.test(b.title)||typeof b.message!=='string'||!b.message.trim()||b.message.length>2000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(b.message)||!['all','selected'].includes(b.audience))return send(400,{error:'标题最多 120 字，通知内容最多 2000 字。'});
   const students=activeStudents(),allowed=new Set(students.map(s=>s.id));let recipients;
   if(b.audience==='all')recipients=[...allowed];else{if(!Array.isArray(b.recipientIds)||!b.recipientIds.length||b.recipientIds.length>100||b.recipientIds.some(id=>typeof id!=='string'||!allowed.has(id)))return send(400,{error:'请选择有效的学生'});recipients=[...new Set(b.recipientIds)];}
   if(!recipients.length)return send(400,{error:'没有可接收通知的学生'});
   const id=randomBytes(16).toString('hex');db.exec('BEGIN IMMEDIATE');try{
    db.prepare('INSERT INTO notifications(id,title,message,sender_id,audience,created_at) VALUES(?,?,?,?,?,?)').run(id,b.title.trim().normalize('NFC'),b.message.trim().normalize('NFC'),user.id,b.audience,Date.now());
    const insert=db.prepare('INSERT INTO notification_recipients VALUES(?,?,NULL)');for(const student of recipients)insert.run(id,student);
    // Bounded storage: preserve the latest 200 notices and their per-student read states.
    db.exec('DELETE FROM notification_recipients WHERE notification_id IN (SELECT id FROM notifications ORDER BY created_at DESC,rowid DESC LIMIT -1 OFFSET 200); DELETE FROM notifications WHERE id IN (SELECT id FROM notifications ORDER BY created_at DESC,rowid DESC LIMIT -1 OFFSET 200); COMMIT');
   }catch(e){db.exec('ROLLBACK');throw e;}
   return send(201,{ok:true,id,recipientCount:recipients.length});
  }
  return send(404,{error:'接口不存在'});
 };
 handler.notifyFeedback=notifyFeedback;handler.notifySubmission=notifySubmission;return handler;
}
