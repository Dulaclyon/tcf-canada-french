const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function combineBasicVerbs(material,sections){
 if(material.id!=='lesson-02')return sections;
 const verbs=sections.filter(s=>['être','aller'].includes(s.title));
 if(verbs.length!==2)return sections;
 return sections.flatMap(s=>s.title==='aller'?[]:s.title==='être'?[{...s,title:'基础动词与变位',sourceTitles:['être','aller'],verbSections:verbs,text:verbs.map(v=>v.text).join('\n')}]:[s]);
}
export function renderBasicVerbs(){
 const rows=[['je / j’','suis','ai','vais'],['tu','es','as','vas'],['il / elle / on','est','a','va'],['nous','sommes','avons','allons'],['vous','êtes','avez','allez'],['ils / elles','sont','ont','vont']];
 const verbs=[
 ['être','是；处于某种状态','être + 身份 / 形容词 / 地点',[
 ['Je suis Julien.','我是朱利安。'],['Tu es Crystal.','你是克里斯托。'],['Il est Bob.','他是鲍勃。'],['Elle est Lucy.','她是露西。'],['Nous sommes amis.','我们是朋友。'],['Vous êtes amis.','你们是朋友。'],['Ils sont étudiants.','他们是学生。'],['Elles sont étudiantes.','她们是学生。'],['Je suis fatigué.','我累了。（男性说话者）']]],
 ['avoir','有；也用于年龄、饥饿等固定表达','avoir + 名词；avoir + 年龄 + ans',[
 ['J’ai un livre.','我有一本书。'],['Tu as une voiture.','你有一辆车。'],['Elle a vingt ans.','她二十岁。'],['Nous avons faim.','我们饿了。'],['Vous avez une maison.','您有一栋房子。'],['Ils ont deux valises.','他们有两个行李箱。']]],
 ['aller','去；前往某处','aller + 地点',[
 ['Je vais à Paris.','我去巴黎。'],['Tu vas à l’école.','你去学校。'],['Nous allons au restaurant.','我们去餐厅。'],['Ils vont à Pékin.','他们去北京。']]]
 ];
 const examples=items=>`<div class="basic-verb-examples">${items.map(([fr,zh])=>`<div class="grammar-example"><p lang="fr">${esc(fr)}</p><p class="grammar-translation">（${esc(zh)}）</p></div>`).join('')}</div>`;
 return `<div class="basic-verbs"><p>先记住三个基础动词的现在时变位，再学习它们在句子中的用法。</p><h3>现在时变位</h3><div class="grammar-table-wrap"><table class="grammar-table"><thead><tr>${['主语','être','avoir','aller'].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td lang="fr">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">je 在元音或哑音 h 前缩合为 j’：j’ai。其他主语不缩合。</p>${verbs.map(([name,meaning,pattern,items])=>`<section class="basic-verb-block"><h3 lang="fr">${name} <small lang="zh-CN">${meaning}</small></h3><p class="basic-verb-pattern">${esc(pattern)}</p><h4>例句</h4>${examples(items)}</section>`).join('')}<section class="basic-verb-block"><h3>常用句型</h3><p><strong>être en train de + 动词原形</strong>：正在做某事。</p>${examples([['Je suis en train de faire le lit.','我正在铺床。'],['Il est en train de faire la valise.','他正在收拾行李箱。'],['Elles sont en train de faire une maison.','她们正在建造一栋房子。']])}<p><strong>aller + 动词原形</strong>：打算或即将做某事。</p>${examples([['Elles vont faire une maison.','她们打算建造一栋房子。']])}<p class="muted">建造房屋也常说 construire une maison。表达年龄和饥饿用 avoir：J’ai vingt ans；J’ai faim。</p></section><section class="basic-verb-block"><h3>介绍人物</h3><p>c’est + 限定词 + 名词；il / elle est + 职业时，职业名词前通常不加冠词。</p>${examples([['C’est une médecin très patiente.','她是一位很有耐心的医生。'],['Elle est médecin.','她是医生。'],['Ce sont mes amis.','这些是我的朋友。']])}</section></div>`;
}
