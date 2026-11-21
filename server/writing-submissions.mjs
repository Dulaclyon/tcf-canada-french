import {codexReview} from './codex-review.mjs';
import {essayAssessment} from './essay-assessment.mjs';
import {readFileSync} from 'node:fs';
import {migrateCompletedWriting,submitCompletedDraft} from './completed-writing.mjs';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export function writingSubmissions(db,root,permissionsFor){
 db.exec(`CREATE TABLE IF NOT EXISTS writing_submissions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,question_id TEXT NOT NULL,title TEXT NOT NULL,task INTEGER NOT NULL,prompt TEXT NOT NULL,text TEXT NOT NULL,submitted_at INTEGER NOT NULL,feedback TEXT NOT NULL DEFAULT '',reviewed_at INTEGER,reviewer_id TEXT);CREATE INDEX IF NOT EXISTS writing_by_user ON writing_submissions(user_id,submitted_at);`);
 const questions=JSON.parse(readFileSync(path.join(root,'src/data/exam.json'),'utf8')).writing;
 migrateCompletedWriting(db,questions);
 const ai=essayAssessment(db),codex=codexReview(db);
 const handler=async({route,req,url,user,body,send})=>{
  if(route==='/api/writing/submissions'&&req.method==='GET'){
   const question=url.searchParams.get('questionId');
   if(!question)return send(400,{error:'请选择写作题目'});
   return send(200,db.prepare('SELECT id,title,task,text,submitted_at,feedback,reviewed_at FROM writing_submissions WHERE user_id=? AND question_id=? ORDER BY submitted_at DESC,rowid DESC LIMIT 20').all(user.id,question));
  }
  if(route==='/api/writing/submissions'&&req.method==='POST'){
   if(user.role!=='student')return send(403,{error:'请使用学生账号提交作文'});
   if(!permissionsFor(user).writing)return send(403,{error:'写作板块尚未开放'});
   const b=await body();
   if(typeof b.text!=='string'||!b.text.trim()||b.text.length>20000)return send(400,{error:'请输入作文，最多 20,000 个字符'});
   const exam=JSON.parse(await readFile(path.join(root,'src/data/exam.json'),'utf8')),q=exam.writing.find(q=>q.id===b.questionId);
   if(!q)return send(400,{error:'写作题目不存在'});
   const latest=db.prepare('SELECT id,text FROM writing_submissions WHERE user_id=? AND question_id=? ORDER BY submitted_at DESC,rowid DESC LIMIT 1').get(user.id,q.id);
   if(latest?.text===b.text.trim())return send(409,{error:'这份作文已经提交；修改后可再次提交'});
   const id=randomBytes(16).toString('hex'),at=Date.now();
   db.prepare('INSERT INTO writing_submissions(id,user_id,question_id,title,task,prompt,text,submitted_at) VALUES(?,?,?,?,?,?,?,?)').run(id,user.id,q.id,q.title,q.task,q.prompt,b.text.trim(),at);
   return send(201,{id,submitted_at:at});
  }
  if(route.startsWith('/api/admin/writing')){
   if(user.role!=='admin')return send(403,{error:'仅管理员可操作'});
   if(route==='/api/admin/writing/codex/pair'&&req.method==='POST'){const b=await body();try{return send(200,codex.pair(b.token,user.id));}catch(e){return send(e.status||400,{error:e.message});}}
   if(route==='/api/admin/writing/codex/disconnect'&&req.method==='POST'){codex.revoke();return send(200,{ok:true});}
   if(route==='/api/admin/writing/codex'&&req.method==='GET'){
    const id=url.searchParams.get('id'),language=url.searchParams.get('language')||'en';
    if(!codex.languages.has(language))return send(400,{error:'请选择有效的反馈语言。'});
    if(!db.prepare('SELECT id FROM writing_submissions WHERE id=?').get(id))return send(404,{error:'作文不存在'});
    return send(200,{review:codex.get(id,language),config:codex.config()});
   }
   if(route==='/api/admin/writing/codex'&&req.method==='POST'){
    const b=await body();if(typeof b.id!=='string'||!db.prepare('SELECT id FROM writing_submissions WHERE id=?').get(b.id))return send(404,{error:'作文不存在'});
    try{return send(200,codex.enqueue(b.id,b.language??'en',user.id,{rewrite:b.rewrite??false,instructions:b.instructions??'',feedback:b.feedback??''}));}catch(e){return send(e.status||400,{error:e.message});}
   }
   if(route==='/api/admin/writing/ai/config'&&req.method==='GET')return send(200,{...ai.config(),enabled:false});
   if(route==='/api/admin/writing/ai'&&req.method==='GET'){
    const id=url.searchParams.get('id'),language=url.searchParams.get('language')||'en';
    if(!ai.languages.has(language))return send(400,{error:'请选择有效的反馈语言。'});
    if(!db.prepare('SELECT id FROM writing_submissions WHERE id=?').get(id))return send(404,{error:'作文不存在'});
    return send(200,{review:ai.get(id,language),config:{...ai.config(),enabled:false}});
   }
   if(route==='/api/admin/writing/ai'&&req.method==='POST')return send(410,{error:'请使用 Mac 上的 Codex 连接器。'});
   if(route==='/api/admin/writing'&&req.method==='GET'){
    const student=url.searchParams.get('student')||'',pending=url.searchParams.get('pending')==='1',offset=Number(url.searchParams.get('offset')||0);
    if(!Number.isSafeInteger(offset)||offset<0)return send(400,{error:'无效页码'});
    const where=" WHERE (?='' OR s.user_id=?) AND (?=0 OR s.reviewed_at IS NULL)";
    const rows=db.prepare('SELECT s.id,s.user_id,u.email,s.title,s.task,s.submitted_at,s.reviewed_at FROM writing_submissions s JOIN users u ON u.id=s.user_id'+where+' ORDER BY s.submitted_at DESC,s.rowid DESC LIMIT 51 OFFSET ?').all(student,student,pending?1:0,offset);
    return send(200,{items:rows.slice(0,50),nextOffset:rows.length>50?offset+50:null});
   }
   if(route==='/api/admin/writing/detail'&&req.method==='GET'){
    const row=db.prepare('SELECT s.*,u.email FROM writing_submissions s JOIN users u ON u.id=s.user_id WHERE s.id=?').get(url.searchParams.get('id'));
    return row?send(200,row):send(404,{error:'作文不存在'});
   }
   if(route==='/api/admin/writing/feedback'&&req.method==='POST'){
    const b=await body();if(typeof b.feedback!=='string'||!b.feedback.trim()||b.feedback.length>12000)return send(400,{error:'请输入评语，最多 12,000 个字符'});
    if(!db.prepare('SELECT id FROM writing_submissions WHERE id=?').get(b.id))return send(404,{error:'作文不存在'});
    const at=Date.now();db.prepare('UPDATE writing_submissions SET feedback=?,reviewed_at=?,reviewer_id=? WHERE id=?').run(b.feedback.trim(),at,user.id,b.id);
    return send(200,{ok:true,reviewed_at:at});
   }
  }
  return send(404,{error:'接口不存在'});
 };
 handler.connector=async({route,req,body,send})=>{
  const token=/^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization||'')?.[1];
  if(!codex.authenticate(token))return send(401,{error:'Connector not paired'});
  if(req.method!=='POST')return send(405,{error:'POST required'});
  try{if(route==='/api/codex-connector/heartbeat')return send(200,codex.heartbeat());
   if(route==='/api/codex-connector/claim')return send(200,codex.claim(questions));
   if(route==='/api/codex-connector/result')return send(200,codex.finish(await body()));
   return send(404,{error:'Not found'});
  }catch(e){return send(e.status||400,{error:e.status?e.message:'Invalid connector result'});}
 };
 handler.syncCompleted=(user,value,previous)=>{if(user.role!=='student'||!permissionsFor(user).writing)return;for(const [id,draft] of Object.entries(value.drafts||{})){if(previous?.drafts?.[id]?.completed!==true)submitCompletedDraft(db,questions,user.id,id,draft);}};
 return handler;
}
