// Extract reading passages for the next stage without changing the stored source.
const normalize=s=>s.replace(/\s/gu,'');
function span(text,needle){const positions=[];let compact='';for(let i=0;i<text.length;i++)if(!/\s/u.test(text[i])){compact+=text[i];positions.push(i);}const key=normalize(needle);const at=compact.indexOf(key);return at<0?null:[positions[at],positions[at+key.length-1]+1];}
const isReading=title=>/^(?:短文(?:\d+)?[：:]?|对话(?:部分)?|短文&对话|Main Topic 2|4\. 应用|应用)$/u.test(title);
export function buildLessonFlow(material,candidates=[]){
 const grammar=[],readings=[];
 const add=b=>{const key=normalize(b.text);if(key&&!readings.some(r=>normalize(r.text).includes(key)))readings.push(b);};
 const sections=material.pages.flatMap(p=>p.sections.map(b=>({...b,page:p.page})));
 for(const b of sections)if(isReading(b.title))add({...b,kind:'reading'});
 const articles=candidates.filter(a=>a?.sourceFile===material.file&&/原文|对话/u.test(a.kind));
 for(const b of sections){
  if(isReading(b.title))continue;
  let text=b.text;
  for(const a of articles){const where=span(text,a.text);if(where){add({title:a.title,text:text.slice(...where),page:b.page,kind:'reading'});text=(text.slice(0,where[0])+'\n'+text.slice(where[1])).trim();}}
  if(text)grammar.push({...b,text});
 }
 return {grammar,readings};
}
