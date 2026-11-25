import {readFile} from 'node:fs/promises';
import {CEFR_LEVELS,difficultyKey} from '../question-difficulty.js';
export function questionLevels(db,root,permissionsFor){
 db.exec('CREATE TABLE IF NOT EXISTS question_levels(kind TEXT NOT NULL,set_id TEXT NOT NULL,number INTEGER NOT NULL,level TEXT,updated_by TEXT NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY(kind,set_id,number))');
 const known=new Map();
 const catalogue=async kind=>{if(!known.has(kind)){const data=JSON.parse(await readFile(root+'/bank/difficulty-'+kind+'.json','utf8'));known.set(kind,new Set(data.questions.map(q=>difficultyKey(q.setId,q.number))));}return known.get(kind);};
 return async({route,req,url,user,body,send})=>{
  if(route==='/api/question-levels'&&req.method==='GET'){
   const kind=url.searchParams.get('kind');if(!['listening','reading'].includes(kind))return send(400,{error:'Invalid question section.'});if(!permissionsFor(user)[kind])return send(403,{error:'此板块尚未开放'});
   return send(200,Object.fromEntries(db.prepare('SELECT set_id,number,level FROM question_levels WHERE kind=?').all(kind).map(r=>[difficultyKey(r.set_id,r.number),{level:r.level}])));
  }
  if(route==='/api/admin/question-levels'&&req.method==='POST'){
   if(!['owner','admin','teacher'].includes(user.role))return send(403,{error:'Only teaching staff can review question levels.'});
   const b=await body();if(!['listening','reading'].includes(b.kind)||typeof b.setId!=='string'||!Number.isInteger(b.number)||!(b.level===null||CEFR_LEVELS.includes(b.level))||!(await catalogue(b.kind)).has(difficultyKey(b.setId,b.number)))return send(400,{error:'Invalid question or CEFR level.'});
   if(b.reset===true)db.prepare('DELETE FROM question_levels WHERE kind=? AND set_id=? AND number=?').run(b.kind,b.setId,b.number);
   else db.prepare('INSERT INTO question_levels VALUES(?,?,?,?,?,?) ON CONFLICT(kind,set_id,number) DO UPDATE SET level=excluded.level,updated_by=excluded.updated_by,updated_at=excluded.updated_at').run(b.kind,b.setId,b.number,b.level,user.id,Date.now());
   return send(200,{ok:true});
  }
  return send(404,{error:'Not found.'});
 };
}
