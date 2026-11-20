// Extract reading passages for the next stage without changing the stored source.
const normalize=s=>s.replace(/\s/gu,'');
function span(text,needle){const positions=[];let compact='';for(let i=0;i<text.length;i++)if(!/\s/u.test(text[i])){compact+=text[i];positions.push(i);}const key=normalize(needle);const at=compact.indexOf(key);return at<0?null:[positions[at],positions[at+key.length-1]+1];}
const isReading=title=>/^(?:短文(?:\d+)?[：:]?|对话(?:部分)?|短文&对话|Main Topic 2|4\. 应用|应用)$/u.test(title);
export function buildLessonFlow(material,candidates=[]){
 const grammar=[],readings=[],phonicsTopics=[];
 const add=b=>{const key=normalize(b.text);if(key&&!readings.some(r=>normalize(r.text).includes(key)))readings.push(b);};
 const sections=material.pages.flatMap(p=>p.sections.map(b=>({...b,page:p.page})));
 for (const moved of material.relocatedSections ?? []) {
  const index = sections.findIndex(section => section.title === moved.title);
  if (index < 0) continue;
  if (moved.start) {
   const at = sections[index].text.indexOf(moved.start);
   if (at >= 0) sections[index].text = sections[index].text.slice(0, at).trim();
  } else sections.splice(index, 1);
 }
 const articles=candidates.filter(a=>a?.sourceFile===material.file&&/原文|对话/u.test(a.kind));
 for(const b of sections.filter(b=>isReading(b.title))){
   const phonics=b.text.match(/^Phonics?\s+发音(?:[（(]下次[）)])?\s*$/imu);
   if(phonics){
    add({...b,text:b.text.slice(0,phonics.index).trim(),kind:'reading'});
    phonicsTopics.push({...b,title:'发音',text:b.text.slice(phonics.index).trim()});
   }else add({...b,kind:'reading'});
 }
 for(const b of sections){
  if(isReading(b.title))continue;
  let text=b.text;
  if(material.id==='lesson-09' && b.title==='课件内容'){
   const marker=/^复习短文1\s*$/mu.exec(text);
   if(marker){
    add({...b,title:'复习短文1',text:text.slice(marker.index).trim(),kind:'reading'});
    text=text.slice(0,marker.index).trim();
   }
  }
  if(material.id==='lesson-09' && b.title==='passé composé 应用'){
   const [heading,...lines]=text.split('\n');
   const vocabularyStart=lines.findIndex(line=>line.includes('→'));
   if(vocabularyStart>0){
    add({...b,title:'复合过去时短文',text:lines.slice(0,vocabularyStart).join('\n'),kind:'reading'});
    text=[heading,...lines.slice(vocabularyStart)].join('\n');
   }
  }
  for(const a of articles){const where=span(text,a.text);if(where){add({title:a.title,text:text.slice(...where),page:b.page,kind:'reading'});text=(text.slice(0,where[0])+'\n'+text.slice(where[1])).trim();}}
  if(text)grammar.push({...b,text});
 }
 const organized=grammar.flatMap(section=>{
  if(material.id!=='lesson-05'||section.title!=='天气')return [section];
  const marker=/^tion 的发音\s*$/mu.exec(section.text);
  if(!marker)return [section];
  return [{...section,text:section.text.slice(0,marker.index).trim(),weather:true},{...section,title:'发音',text:section.text.slice(marker.index).trim()}];
 });
 const separated=organized.flatMap(section=>{
  if(section.title==='发音'||section.title==='phonics')return [section];
  const marker=/^(?:发音部分(?:[^\n]*)?|Phonics?\s+发音(?:[^\n]*)?|\[j\])\s*$/imu.exec(section.text);
  if(!marker)return [section];
  const start=marker.index;
  const tail=section.text.slice(start);
  const end=/^主格&宾格\s*$/mu.exec(tail);
  const finish=end?start+end.index:section.text.length;
  const remainder=(section.text.slice(0,start)+'\n'+section.text.slice(finish)).trim();
  const pronunciation={...section,title:'发音',text:section.text.slice(start,finish).trim()};
  return [...(remainder?[{...section,text:remainder}]:[]),pronunciation];
 });
 let result=[...separated,...phonicsTopics];
 if(material.id==='lesson-06'){
  result=result.flatMap(section=>{
   if(section.title==='名词'){
    const at=section.text.indexOf('在东边：');
    return at<0?[section]:[{...section,text:section.text.slice(0,at).trim()},{...section,title:'方位',text:section.text.slice(at).trim()}];
   }
   if(section.title==='形容词'){
    const points=[['形容词',0],...['疑问词','副词','拼读'].map(title=>[title,section.text.indexOf(title)]).filter(([,at])=>at>=0)];
    return points.map(([title,at],i)=>({...section,title:title==='拼读'?'发音':title,text:(title==='拼读'?'an / en / am / em\n':'')+section.text.slice(at,points[i+1]?.[1]??section.text.length).trim()}));
   }
   return [section];
  });
  const merged=[];
  for(const section of result){const existing=['名词','动词'].includes(section.title)&&merged.find(s=>s.title===section.title);if(existing)existing.text+='\n'+section.text.replace(new RegExp('^'+section.title+'\\s*\\n'),'');else merged.push({...section});}
  result=merged;
 }
 return {grammar:result,readings};
}

// Keep one pronunciation entry per unit while retaining each sound's own content.
export function consolidatePronunciationTopics(sections){
 const isPronunciation=section=>/^(?:phonics?|发音|拼写与发音|拼读|目标音对照|元音区别|词尾读音|元音前的音变|省音与连读)$/iu.test(section.title.trim());
 const sounds=sections.filter(isPronunciation);
 if(!sounds.length)return sections;
 const first=sections.indexOf(sounds[0]);
 return sections.flatMap((section,index)=>index===first?[{title:'发音',text:sounds.map(item=>item.text||item.rule||'').join('\n'),pronunciationSections:sounds}]:isPronunciation(section)?[]:[section]);
}
