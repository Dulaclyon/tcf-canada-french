// Teaching lists are spoken item by item, with time to repeat each form.
export function speechPlan(lines,{conjugation=false,pronunciation=false}={}){
 const segments=lines.flatMap(line=>String(line||'').split(conjugation||pronunciation?/[;,，；\n]+/u:/\n+/u)).map(line=>line.replace(/\[[^\]]*\]/gu,'').replace(/\b(il|ils)\/(elle|elles)(?:\/on)?\b/gu,'$1').replace(/\s+/gu,' ').trim()).filter(Boolean);
 return {segments,rate:conjugation?0.8:pronunciation?0.78:0.88,pause:conjugation?1100:pronunciation?1000:300};
}
