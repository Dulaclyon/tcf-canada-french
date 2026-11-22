export function selectReadings(items,{category='all',level='all',query=''}={}){
 const normalize=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr');const needle=normalize(query.trim());
 return items.filter(a=>(category==='all'||a.category===category)&&(level==='all'||a.level===level)&&(!needle||normalize([a.title,a.author,...a.paragraphs,...a.vocabulary.map(v=>v.fr)].join(' ')).includes(needle)));
}
