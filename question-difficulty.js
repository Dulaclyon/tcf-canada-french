export const CEFR_LEVELS=['A1','A2','B1','B2','C1','C2'];
export const difficultyKey=(setId,number)=>setId+':'+number;
const words=text=>text.toLocaleLowerCase('fr').match(/[a-zàâäçéèêëîïôöùûüÿœæ]+(?:['’][a-zàâäçéèêëîïôöùûüÿœæ]+)*/gu)||[];
const matches=(text,re)=>(text.match(re)||[]).length;
// A conservative text-only rubric. It does not assign official exam levels or infer audio delivery.
export function estimateDifficulty(kind,q){
 const text=String(kind==='listening'?(q.transcript||q.syntheticText||''):(q.body||''));
 const tokens=words(text),count=tokens.length;
 if(count<5||kind==='listening'&&!q.audio&&!q.syntheticText)return {level:null,score:0,basis:'insufficient-source',features:{words:count}};
 const options=(q.options||[]).map(o=>typeof o==='string'?o:o.text||'').filter(t=>!/^Proposition [ABCD]$/iu.test(t));
 const optionWords=options.length?options.reduce((n,t)=>n+words(t).length,0)/options.length:0;
 const lower=text.toLocaleLowerCase('fr');
 const abstract=matches(lower,/\b(?:enjeu\w*|réglement\w*|hypoth\w*|paradox\w*|idéolog\w*|implicite\w*|éthique\w*|concept\w*|philosoph\w*|légitim\w*|controvers\w*|démocrat\w*|économ\w*|scientif\w*|sociolog\w*|institution\w*|stratég\w*|théori\w*|politique\w*|psycholog\w*|consommation|environnement\w*)\b/gu);
 const discourse=matches(lower,/\b(?:cependant|néanmoins|pourtant|toutefois|notamment|davantage|voire|autrement|certes|tandis que|bien que|alors que|en revanche|en dépit|en effet|par conséquent|dans la mesure|d'autant|quoiqu|encore faut)\b/gu);
 const complex=matches(lower,/\b(?:dont|lequel|laquelle|lesquels|lesquelles|aurait|auraient|eût|fût|puisse|puissent|quoique|suppose|considère|soutient|implique|nécessite)\b/gu);
 const inference=matches((q.prompt||'')+' '+text.slice(-300)+' '+options.join(' '),/\b(?:sous-entend|sous-entendu|implicite|ironie|ironique|intention|point de vue|attitude|soutient|déduit|déduire|critique|nuance|paradox)/giu);
 const longRatio=tokens.filter(w=>w.length>=10).length/Math.max(count,1);
 let score=(count<=35?5:count<=65?18:count<=110?32:count<=180?43:55)+Math.min(18,abstract*3)+Math.min(12,discourse*3)+Math.min(10,complex*2)+Math.min(8,inference*4)+Math.min(10,optionWords*.8)+Math.min(8,longRatio*50);
 let level=score<20?'A1':score<36?'A2':score<57?'B1':score<83?'B2':'C1';
 // C1 needs several independent complexity signals. C2 requires a teacher-reviewed label.
 if(level==='C1'&&!(abstract>=3&&(discourse>=2||complex>=3)&&count>=100))level='B2';
 return {level,score:Math.round(score),basis:'text-estimate',features:{words:count,optionWords:Math.round(optionWords),abstract,discourse,complex,inference}};
}
export function effectiveDifficulty(entry,overrides={}){
 const override=overrides[difficultyKey(entry.setId,entry.number)];
 return override?{...entry,level:override.level,basis:'teacher-reviewed'}:entry;
}
export function difficultyPath(entries,{level='all',overrides={},setIds}={}){
 return entries.map(e=>effectiveDifficulty(e,overrides)).filter(e=>(!setIds||setIds.has(e.setId))&&(level==='all'||(level==='unassessed'?!e.level:e.level===level))).sort((a,b)=>(a.level?CEFR_LEVELS.indexOf(a.level):6)-(b.level?CEFR_LEVELS.indexOf(b.level):6)||(a.score||0)-(b.score||0)||a.setId.localeCompare(b.setId,undefined,{numeric:true})||a.number-b.number);
}
export function resumeDifficultyPath(path,cursor){const index=path.findIndex(e=>e.setId===cursor?.setId&&e.number===cursor?.number);return index<0?0:index;}
