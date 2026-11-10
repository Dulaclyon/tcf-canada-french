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
 return {grammar:[...grammar,...phonicsTopics],readings};
}
