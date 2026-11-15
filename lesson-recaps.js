const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderSeparatedLessonRecap(id,title){
 let heading='',rule='',examples=[],note='';
 if(id==='lesson-03'&&title==='课件内容'){
  heading='人称与提问';rule='je、tu、il 等作主语；moi、toi、lui 等重读形式用于 c’est 后或介词后。提问时按所需信息选择疑问词。';
  examples=[['Qui es-tu ? — Je suis Crystal.','你是谁？——我是 Crystal。'],['C’est moi. Je viens avec toi.','是我。我和你一起来。'],['Où est-ce que tu vas ? — Je vais chez Paul.','你去哪里？——我去保罗家。'],['Pourquoi est-ce que tu pars ? — Parce que je travaille demain.','你为什么离开？——因为我明天要工作。']];
  note='对人提问用 qui，对地点提问用 où，对原因提问用 pourquoi。tu 的倒装写作 es-tu，如 Qui es-tu ? 介绍自己用 C’est moi 或 Je suis Crystal。';
 }else if(id==='lesson-07'&&title==='否定'){
  heading='否定表达对比';rule='ne…pas 表示“不”，ne…rien 表示“什么也不”。两者不能机械叠加。遇到 vouloir、pouvoir + 动词原形时，先把变位动词放在正确位置。';
  examples=[['Je ne veux pas partir.','我不想离开。'],['Je ne veux rien oublier.','我不想忘记任何东西。'],['Nous ne voulons rien boire.','我们什么也不想喝。'],['Elle ne peut pas venir.','她不能来。']];
  note='Je ne veux rien manger 中，rien 放在 veux 后、manger 前；不要再加 pas。对比 Je ne mange rien（我什么也不吃）。';
 }else if(id==='lesson-06'&&title==='名词'){
  heading='名词怎么记';rule='把冠词和名词一起记：le 表示阳性单数，la 表示阴性单数，les 表示复数。l’ 是元音或哑音 h 前的省音形式，仅凭 l’ 不能判断阴阳性。';
  examples=[['Le ciel est gris.','天空是灰色的。'],['Les feuilles tombent en automne.','树叶在秋天落下。'],['Le printemps arrive en mars.','春天在三月到来。']];
  note='les saisons 的单数是 la saison；les fleurs 的单数是 la fleur；les feuilles 的单数是 la feuille。le temps 在本课表示“天气”，也可按语境表示“时间”。';
 }else return '';
 return `<section class="basic-verb-block"><h3>${esc(heading)}</h3><p>${esc(rule)}</p><div class="basic-verb-examples">${examples.map(([fr,zh])=>`<div class="grammar-example"><p lang="fr">${esc(fr)}</p><p class="grammar-translation">（${esc(zh)}）</p></div>`).join('')}</div><p class="muted">${esc(note)}</p></section>`;
}
