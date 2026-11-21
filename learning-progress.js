// Shared by the protected student and teacher endpoints; no personal text is returned.
const array=value=>Array.isArray(value)?value:[];
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const metric=(done,total,inProgress=0,available=true)=>({done,total,inProgress,percent:total?Math.round(done/total*1000)/10:0,available});
export function summarizeLearning({courses=[],materials=[],exam={},sets=null,state={},bankProgress={},bankCompleted={},submitted=[],permissions={}}){
 const attempts=new Set(array(state.attempts).map(a=>a?.id));
 const exercises=[...new Map([...courses,...materials].flatMap(item=>array(item.exercises)).map(e=>[e.id,e])).values()];
 const foundations=metric(exercises.filter(e=>attempts.has(e.id)).length,exercises.length);
 const sectionBank=kind=>{
  const originals=array(exam[kind]).map(p=>({id:p.id,questionCount:array(p.questions).length}));
  const groups=[...originals,...array(sets).filter(s=>s.kind===kind)];let done=0,inProgress=0;
  for(const group of groups){if(object(bankCompleted)[group.id])done++;else if(Object.values(object(object(bankProgress)[group.id])).some(a=>a&&typeof a.choice==='string'&&/^[ABCD]$/.test(a.choice)))inProgress++;}
  return metric(done,groups.length,inProgress,sets!==null);
 };
 const drafts=object(state.drafts),submittedIds=new Set(submitted),oralIds=new Set(array(state.oralRecords).map(r=>r?.id));
 const writingQuestions=array(exam.writing),oralQuestions=array(exam.oral);
 const writing=metric(writingQuestions.filter(q=>submittedIds.has(q.id)||drafts[q.id]?.completed===true).length,writingQuestions.length,writingQuestions.filter(q=>!submittedIds.has(q.id)&&drafts[q.id]?.completed!==true&&typeof drafts[q.id]?.text==='string'&&drafts[q.id].text.trim()).length);
 const oral=metric(oralQuestions.filter(q=>oralIds.has(q.id)).length,oralQuestions.length);
 return Object.fromEntries(Object.entries({basics:foundations,listening:sectionBank('listening'),reading:sectionBank('reading'),writing,oral}).map(([key,value])=>[key,permissions[key]===false?{locked:true}:value]));
}
