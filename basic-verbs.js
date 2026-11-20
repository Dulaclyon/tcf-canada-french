const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function combineBasicVerbs(material,sections){
 if(material.id!=='lesson-02')return sections;
 const verbs=sections.filter(s=>['être','aller'].includes(s.title));
 if(verbs.length!==2)return sections;
 return sections.flatMap(s=>s.title==='aller'?[]:s.title==='être'?[{...s,title:'基础动词与变位',sourceTitles:['être','aller'],verbSections:verbs,text:verbs.map(v=>v.text).join('\n')},{title:'动作与时间',timeExpressions:true,text:'正在做、即将做、刚刚做完：三个常用句型。'}]:[s]);
}
export function renderBasicVerbs(){
 const rows=[['je / j’','suis','ai','vais','viens','fais'],['tu','es','as','vas','viens','fais'],['il / elle / on','est','a','va','vient','fait'],['nous','sommes','avons','allons','venons','faisons'],['vous','êtes','avez','allez','venez','faites'],['ils / elles','sont','ont','vont','viennent','font']];
 const verbs=[
 ['être','是；处于某种状态','être + 身份 / 形容词 / 地点',[
 ['Je suis Julien.','我是朱利安。'],['Tu es Crystal.','你是克里斯托。'],['Il est Bob.','他是鲍勃。'],['Elle est Lucy.','她是露西。'],['Nous sommes amis.','我们是朋友。'],['Vous êtes amis.','你们是朋友。'],['Ils sont étudiants.','他们是学生。'],['Elles sont étudiantes.','她们是学生。'],['Je suis fatigué.','我累了。（男性说话者）']]],
 ['avoir','有；也用于年龄、饥饿等固定表达','avoir + 名词；avoir + 年龄 + ans',[
 ['J’ai un livre.','我有一本书。'],['Tu as une voiture.','你有一辆车。'],['Elle a vingt ans.','她二十岁。'],['Nous avons faim.','我们饿了。'],['Vous avez une maison.','您有一栋房子。'],['Ils ont deux valises.','他们有两个行李箱。']]],
 ['aller','去；前往某处','aller + 地点',[
 ['Je vais à Paris.','我去巴黎。'],['Tu vas à l’école.','你去学校。'],['Nous allons au restaurant.','我们去餐厅。'],['Ils vont à Pékin.','他们去北京。']]],
 ['venir','来；来到某处','venir + 地点；venir de + 地点表示来自某处',[['Je viens chez toi.','我来你家。'],['Tu viens avec nous.','你和我们一起来。'],['Elle vient de Montréal.','她来自蒙特利尔。'],['Nous venons à la fête.','我们来参加聚会。'],['Vous venez demain.','您明天来。'],['Ils viennent ici.','他们来这里。']]],
 ['faire','做；制作','faire + 名词',[['Je fais un gâteau.','我做一个蛋糕。'],['Nous faisons un exercice.','我们做一道练习。'],['Vous faites un dessin.','您画一幅画。']]]
 ];
 const examples=items=>`<div class="basic-verb-examples">${items.map(([fr,zh])=>`<div class="grammar-example"><p lang="fr">${esc(fr)}</p><p class="grammar-translation">（${esc(zh)}）</p></div>`).join('')}</div>`;
 return `<div class="basic-verbs"><p>先记住五个基础动词的现在时变位，再学习它们在句子中的用法。</p><h3>现在时变位</h3><div class="grammar-table-wrap"><table class="grammar-table"><thead><tr>${['主语','être','avoir','aller','venir','faire'].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td lang="fr">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">je 在元音或哑音 h 前缩合为 j’：j’ai。其他主语不缩合。</p>${verbs.map(([name,meaning,pattern,items])=>`<section class="basic-verb-block"><h3 lang="fr">${name} <small lang="zh-CN">${meaning}</small></h3><p class="basic-verb-pattern">${esc(pattern)}</p><h4>例句</h4>${examples(items)}</section>`).join('')}<section class="basic-verb-block"><h3>介绍人物</h3><p>c’est + 限定词 + 名词；il / elle est + 职业时，职业名词前通常不加冠词。</p>${examples([['C’est une médecin très patiente.','她是一位很有耐心的医生。'],['Elle est médecin.','她是医生。'],['Ce sont mes amis.','这些是我的朋友。']])}</section><section class="basic-verb-block"><h3>faire 的常用表达</h3><p>faire 随主语变位；把后面的名词与冠词作为一个词组来记。</p>${[
 ['faire la valise','收拾行李箱',[['Je fais la valise.','我收拾行李箱。'],['Elle fait sa valise avant de partir.','她出发前收拾自己的行李箱。'],['Nous faisons nos valises ce soir.','我们今晚收拾行李。']],'说“自己的行李箱”时，常用 faire sa valise；按主语改变物主词，如 ma valise、ta valise、nos valises。'],
 ['faire le lit','铺床；整理床铺',[['Je fais le lit chaque matin.','我每天早上铺床。'],['Tu fais ton lit.','你整理自己的床铺。'],['Ils font les lits.','他们整理几张床。']],'le lit 是一张床，les lits 是多张床；也可说 faire son lit（整理自己的床铺）。'],
 ['faire les devoirs','做作业',[['Je fais mes devoirs après le dîner.','我晚饭后做作业。'],['Elle fait ses devoirs.','她做自己的作业。'],['Vous faites vos devoirs ensemble.','你们一起做作业。']],'表示自己的作业时常说 faire ses devoirs：mes devoirs、tes devoirs、ses devoirs。此处 devoirs 通常用复数。']
 ].map(([fr,zh,items,note])=>`<section class="basic-verb-block"><h4 lang="fr">${esc(fr)}</h4><p>${esc(zh)}</p>${examples(items)}<p class="muted">${esc(note)}</p></section>`).join('')}</section></div>`;
}

export function renderTimeExpressions(){
 const examples=items=>`<div class="basic-verb-examples">${items.map(([fr,zh])=>`<div class="grammar-example"><p lang="fr">${esc(fr)}</p><p class="grammar-translation">（${esc(zh)}）</p></div>`).join('')}</div>`;
 const patterns=[
 {title:'正在做',fr:'être en train de + 动词原形',en:'be doing / be in the middle of doing',rule:'强调动作此刻正在进行。être 随主语变位，后面的动词保留原形。',examples:[['Je suis en train de manger.','我正在吃饭。'],['Tu es en train de lire.','你正在阅读。'],['Je suis en train de faire le lit.','我正在铺床。'],['Il est en train de faire la valise.','他正在收拾行李箱。'],['Nous sommes en train de travailler.','我们正在工作。'],['Elles sont en train de faire une maison.','她们正在建造一栋房子。']],note:'元音或哑音 h 前，de 缩合为 d’：Elle est en train d’étudier.（她正在学习。）日常表达也可直接用现在时，如 Je mange；en train de 特别强调“正在”。'},
 {title:'即将做',fr:'aller + 动词原形',en:'be going to do',rule:'表示计划、打算或即将发生的动作，称为最近将来时（futur proche）。aller 随主语变位，后面的动词保留原形。',examples:[['Je vais manger.','我打算吃饭。'],['Tu vas lire ce livre.','你打算读这本书。'],['Elle va étudier ce soir.','她今晚打算学习。'],['Nous allons travailler demain.','我们明天打算工作。'],['Elles vont faire une maison.','她们打算建造一栋房子。']],note:'aller 后直接接动词原形，不加 de：Je vais manger。对比 aller + 地点：Je vais au restaurant（我去餐厅）。建造房屋也常说 construire une maison。'},
 {title:'刚刚做完',fr:'venir de + 动词原形',en:'have / has just done',rule:'表示不久前刚刚完成的动作，称为最近过去时（passé récent）。venir 随主语变位，后接 de 和动词原形。',examples:[['Je viens de manger.','我刚刚吃完饭。'],['Tu viens de lire ce message.','你刚刚读了这条消息。'],['Elle vient d’arriver.','她刚刚到达。'],['Nous venons de finir le travail.','我们刚刚完成工作。'],['Ils viennent de partir.','他们刚刚离开。']],note:'不要漏掉 de；元音或哑音 h 前用 d’：venir d’arriver。这里的 venir 表示“刚刚”，不是实际移动的“来”。英语也常用 just + 过去式，具体取决于语境。'}
 ];
 return `<div class="basic-verbs time-expressions"><p>用同一个动作对比：正在做、打算做、刚刚做完。本节先把 être、aller、venir 都变为现在时。</p><div class="grammar-table-wrap"><table class="grammar-table"><thead><tr><th scope="col">时间关系</th><th scope="col">法语</th><th scope="col">英语对照</th></tr></thead><tbody><tr><th scope="row">正在做</th><td lang="fr">Je suis en train de manger.</td><td lang="en">I am eating.</td></tr><tr><th scope="row">打算做</th><td lang="fr">Je vais manger.</td><td lang="en">I am going to eat.</td></tr><tr><th scope="row">刚刚做完</th><td lang="fr">Je viens de manger.</td><td lang="en">I have just eaten.</td></tr></tbody></table></div>${patterns.map(p=>`<section class="basic-verb-block"><h3>${p.title}</h3><p class="basic-verb-pattern"><strong>${esc(p.fr)}</strong></p><p lang="en" class="muted">${esc(p.en)}</p><p>${esc(p.rule)}</p><h4>例句</h4>${examples(p.examples)}<p class="muted"><strong>注意：</strong>${esc(p.note)}</p></section>`).join('')}<section class="basic-verb-block"><h3>否定句</h3><p>ne…pas 放在变位动词两侧，后面的结构不变；元音前 ne 缩合为 n’。</p>${examples([['Je ne suis pas en train de manger.','我现在没有在吃饭。'],['Je ne vais pas manger ici.','我不打算在这里吃饭。'],['Je ne viens pas de manger.','我并不是刚刚吃过饭。']])}</section></div>`;
}

export function visibleLessonTopics(sections){return sections.map((b,index)=>({...b,index})).filter(b=>b.pronunciationSections||b.timeExpressions||b.origin==='supplement'||b.text.length>30||b.topics?.length);}
