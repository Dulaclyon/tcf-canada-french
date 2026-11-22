import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {summarizeLearning} from '../learning-progress.js';
export function learningDashboard(db,root,permissionsFor){
 let catalog;
 async function content(){if(!catalog)catalog=(async()=>{const [courses,materials,exam]=await Promise.all(['courses','materials','exam'].map(file=>readFile(path.join(root,'src/data',file+'.json'),'utf8').then(JSON.parse)));let sets=null;try{sets=JSON.parse(await readFile(path.join(root,'bank/index.json'),'utf8')).sets;}catch{}return {courses,materials,exam,sets};})().catch(error=>{catalog=null;throw error;});return catalog;}
 async function student(user){
  const stored=Object.fromEntries(db.prepare('SELECT key,value FROM progress WHERE user_id=?').all(user.id).map(row=>{try{return [row.key,JSON.parse(row.value)];}catch{return [row.key,null];}}));
  const submitted=db.prepare('SELECT DISTINCT question_id FROM writing_submissions WHERE user_id=?').all(user.id).map(row=>row.question_id);
  const sections=summarizeLearning({...await content(),state:stored['french-learning-v1']||{},bankProgress:stored['tcf-bank-progress-v1']||{},bankCompleted:stored['tcf-bank-completed-v1']||{},submitted,transitionProgress:stored['transition-completed-v1']||{},permissions:permissionsFor(user)});
  return {id:user.id,email:user.email,name:user.name||'',active:!!user.active,sections};
 }
 async function teacher(){const users=db.prepare("SELECT id,email,name,role,active FROM users WHERE role='student' ORDER BY email").all();return {students:await Promise.all(users.map(student)),pendingRequests:db.prepare("SELECT count(*) AS n FROM registration_requests r WHERE status='pending' AND NOT EXISTS(SELECT 1 FROM users u WHERE u.email=r.email)").get().n};}
 return {student,teacher};
}
