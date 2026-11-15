export const SERIES=[['existing','主题练习'],['reussir','Réussir'],['opal','Opal']];
export const COMPLETION_KEY='tcf-bank-completed-v1';
export function normalizeExisting(kind,passage){
 return {id:passage.id,kind,group:'existing',title:passage.title,number:passage.id,answerComplete:true,questionCount:passage.questions.length,questions:passage.questions.map((q,i)=>({number:i+1,body:kind==='reading'?passage.text:'',prompt:q.prompt,images:[],audio:null,syntheticText:kind==='listening'?passage.text:'',transcript:kind==='listening'?passage.text:'',explanation:q.explanation||'',options:q.options.map((text,n)=>({key:'ABCD'[n],text})),answer:'ABCD'[q.answer]}))};
}
export function getSetStatus(set,progress,completed){
 const records=progress[set.id]||{};const answered=Array.from({length:set.questionCount},(_,i)=>records[i+1]).filter(r=>r&&typeof r==='object'&&typeof r.choice==='string'&&/^[ABCD]$/.test(r.choice)).length;
 return {answered,total:set.questionCount,status:completed[set.id]?'completed':answered?'in-progress':'not-started'};
}
export function firstUnfinished(sets,completed){return sets.find(s=>!completed[s.id])||sets[0];}
export function summarizeSets(sets,progress,completed){
 const result={'not-started':[],'in-progress':[],completed:[]};
 for(const set of sets){const state=getSetStatus(set,progress,completed);result[state.status].push({...set,...state});}
 return result;
}
