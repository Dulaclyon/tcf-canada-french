import {randomBytes} from 'node:crypto';
export function submitCompletedDraft(db,questions,userId,questionId,draft){
 const q=questions.find(q=>q.id===questionId),text=typeof draft?.text==='string'?draft.text.trim():'';
 if(!q||draft?.completed!==true||!text||text.length>20000)return false;
 if(db.prepare('SELECT id FROM writing_submissions WHERE user_id=? AND question_id=? AND text=? LIMIT 1').get(userId,questionId,text))return false;
 db.prepare('INSERT INTO writing_submissions(id,user_id,question_id,title,task,prompt,text,submitted_at) VALUES(?,?,?,?,?,?,?,?)').run(randomBytes(16).toString('hex'),userId,q.id,q.title,q.task,q.prompt,text,Date.now());return true;
}
export function migrateCompletedWriting(db,questions){
 db.exec('CREATE TABLE IF NOT EXISTS app_migrations(name TEXT PRIMARY KEY)');
 const key='completed-writing-submits-v1';if(db.prepare('SELECT name FROM app_migrations WHERE name=?').get(key))return;
 db.exec('BEGIN IMMEDIATE');try{
  for(const row of db.prepare("SELECT p.user_id,p.value FROM progress p JOIN users u ON u.id=p.user_id WHERE u.role='student' AND p.key='french-learning-v1'").all()){
   let state;try{state=JSON.parse(row.value);}catch{continue;}
   for(const [questionId,draft] of Object.entries(state.drafts||{}))submitCompletedDraft(db,questions,row.user_id,questionId,draft);
  }
  db.prepare('INSERT INTO app_migrations VALUES(?)').run(key);db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e;}
}
