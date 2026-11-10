import {buildLessonFlow} from './lesson-flow.js?v=22';
import {renderGrammar,renderArticle} from './grammar-layout.js?v=44';
const KEY='french-learning-v1';
const fresh=()=>({version:1,completed:[],favorites:[],attempts:[],oralRecords:[],drafts:{},history:[]});
let recoveryRaw=null,recoveryExported=false;let state=fresh(),courses=[],materials=[],exam={},timer=null,timerRemaining=0,timerDeadline=0,timerStartedAt=0,elapsedBeforeStart=0,selectedOral=null,selectedWriting=null;
const main=document.querySelector('main');
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=v=>Array.isArray(v)?v:v==null?[]:[v];
const txt=v=>typeof v==='object'?JSON.stringify(v):String(v??'');
const list=v=>`<ul class="list">${arr(v).map(x=>`<li>${esc(txt(x))}</li>`).join('')}</ul>`;
const link=(route,label,cls='button secondary')=>`<a class="${cls}" href="#${route}">${label}</a>`;
function toast(s){const n=document.querySelector('#toast');n.textContent=s;n.style.display='block';setTimeout(()=>n.style.display='none',3200)}
const validDate=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const validChecks=v=>Array.isArray(v)&&v.every(x=>typeof x==='string'&&/^\d{1,3}$/.test(x));
function valid(s){return !!(s&&s.version===1&&Array.isArray(s.completed)&&s.completed.every(x=>typeof x==='string')&&Array.isArray(s.favorites)&&s.favorites.every(x=>typeof x==='string')&&Array.isArray(s.attempts)&&s.attempts.every(x=>x&&typeof x.id==='string'&&typeof x.courseId==='string'&&typeof x.correct==='boolean'&&typeof x.answer==='string'&&validDate(x.at))&&Array.isArray(s.oralRecords)&&s.oralRecords.every(x=>x&&typeof x.id==='string'&&validDate(x.at)&&Number.isFinite(x.seconds)&&x.seconds>=0&&x.seconds<=86400&&validChecks(x.checks)&&typeof x.notes==='string')&&s.drafts&&typeof s.drafts==='object'&&!Array.isArray(s.drafts)&&Object.entries(s.drafts).every(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&v&&typeof v.text==='string'&&validDate(v.at)&&(v.checks===undefined||validChecks(v.checks))&&(v.revisionNotes===undefined||typeof v.revisionNotes==='string'))&&Array.isArray(s.history)&&s.history.every(x=>x&&typeof x.id==='string'&&typeof x.text==='string'&&validDate(x.at)))}
try{const raw=localStorage.getItem(KEY),saved=JSON.parse(raw);if(valid(saved))state=saved;else if(raw){recoveryRaw=raw;toast('原学习档案格式异常，已禁止覆盖。请到学习档案下载恢复备份。')}}catch{try{recoveryRaw=localStorage.getItem(KEY)}catch{}toast('无法读取本地档案；若有异常数据，请到学习档案下载恢复备份。')}
function save(){if(recoveryRaw!==null&&!recoveryExported){toast('为保护原档案，暂不覆盖保存。请先到学习档案下载原始恢复备份。');return false}try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{toast('保存失败：浏览器存储不可用或已满，请导出备份。');return false}}
const wordCount=s=>(s.trim().match(/[^\s]+/gu)||[]).filter(token=>/[\p{L}\p{N}]/u.test(token)).length;
const normalize=(s,accent=true)=>{let n=s.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/[.,!?;:«»“”]/g,' ').replace(/\s+/g,' ').trim();return accent?n:n.normalize('NFD').replace(/[\u0300-\u036f]/g,'')};
const navGroups = [
  ['基础学习', [['courses', '基础语法'], ['review', '复习']]],
  ['TCF CA 考试准备', [['listening', '听力训练'], ['reading', '阅读训练'], ['oral', '口语训练'], ['writing', '写作训练']]],
  ['档案与说明', [['sources', '内容与来源'], ['data', '学习档案']]],
];
const navLink = (id, label) => `<a href="#${id}" data-nav="${id}">${label}</a>`;
document.querySelector('#nav').innerHTML = navLink('home', '学习总览') + navGroups.map(([title, links]) =>
  `<div class="nav-section" role="group" aria-label="${title}">
    <p class="nav-group">${title}</p>
    ${links.map(([id, label]) => navLink(id, label)).join('')}
  </div>`
).join('');
const mobileNav=matchMedia('(max-width:760px)'),sidebar=document.querySelector('#sidebar'),menu=document.querySelector('#menu');
const navClose=document.createElement('button');navClose.className='nav-close';navClose.type='button';navClose.setAttribute('aria-label','关闭导航');navClose.textContent='×';sidebar.prepend(navClose);
const navBackdrop=document.createElement('button');navBackdrop.className='nav-backdrop';navBackdrop.type='button';navBackdrop.tabIndex=-1;navBackdrop.setAttribute('aria-label','关闭导航遮罩');document.body.append(navBackdrop);
function syncNav(){const open=mobileNav.matches&&document.body.classList.contains('nav-open');const hidden=mobileNav.matches&&!open;sidebar.inert=hidden;document.querySelector('.workspace').inert=open;if(hidden)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');menu.setAttribute('aria-expanded',String(open));navBackdrop.hidden=!open;}
function closeNav(returnFocus=false){document.body.classList.remove('nav-open');syncNav();if(returnFocus)menu.focus()}
menu.onclick=()=>{document.body.classList.toggle('nav-open');syncNav();if(document.body.classList.contains('nav-open'))navClose.focus()};navClose.onclick=()=>closeNav(true);navBackdrop.onclick=()=>closeNav(true);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('nav-open')){e.preventDefault();closeNav(true)}});mobileNav.addEventListener('change',()=>{if(!mobileNav.matches)document.body.classList.remove('nav-open');syncNav()});syncNav();
const typeName=t=>({choice:'单项选择',fill:'填空',conjugation:'动词变位',correction:'改错',translation:'中法表达转换',order:'句子排序',scenario:'情境表达'})[t]||t;
const heading=(eyebrow,title,sub='')=>`${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h1>${title}</h1>${sub?`<p class="page-intro">${sub}</p>`:''}`;
const courseOf=id=>courses.find(c=>c.id===id)||courses[0];
function courseCard(c,i){const done=state.completed.includes(c.id);return `<article class="card"><div class="card-meta"><span class="tag">${esc(c.level)}</span><span class="count-label">${String(i+1).padStart(2,'0')}</span>${done?'<span class="tag">已完成</span>':''}</div><h3>${esc(c.title)}</h3><div class="card-footer"><span>${c.exercises?.length||0} 题 · 课文</span>${link(`course/${c.id}`,'开始学习 →','text-link')}</div></article>`}
function home(){
 const completed=state.completed.filter(id=>courses.some(c=>c.id===id)).length;
 const next=courses.find(c=>!state.completed.includes(c.id))||courses[0];
 const pct=courses.length?Math.round(completed/courses.length*100):0;
 main.innerHTML=heading('','今天，从这里继续。','一次专注一个知识点。')+`<section class="hero next-lesson"><div><span class="count-label">下一步 · 基础法语</span><h2>${esc(next?.title||'开始学习')}</h2><p>${esc(arr(next?.objectives)[0]||'理解规则，再试着用出来。')}</p>${link('course/'+next?.id,'继续学习','button')}<div class="lesson-progress"><div class="progress"><i style="width:${pct}%"></i></div><small>已完成 ${completed} / ${courses.length} 个单元</small></div></div></section><section class="home-paths" aria-labelledby="paths-heading"><h2 id="paths-heading">选择学习内容</h2><div class="path-links"><a href="#courses"><span><strong>基础法语</strong><small>${courses.length} 个单元 · 文章与练习</small></span><span aria-hidden="true">→</span></a><a href="#oral"><span><strong>口语训练</strong><small>${arr(exam.oral).length} 道原创模拟题</small></span><span aria-hidden="true">→</span></a><a href="#writing"><span><strong>写作训练</strong><small>${arr(exam.writing).length} 道原创模拟题</small></span><span aria-hidden="true">→</span></a></div></section><details class="quiet-details home-records"><summary>查看学习记录</summary><div class="stats"><div class="stat"><strong>${completed}</strong><span>已完成单元</span></div><div class="stat"><strong>${state.attempts.length}</strong><span>累计作答</span></div><div class="stat"><strong>${state.oralRecords.length}</strong><span>口语记录</span></div><div class="stat"><strong>${Object.keys(state.drafts).length}</strong><span>写作草稿</span></div></div><p class="muted">记录保存在当前浏览器。${link('data','备份学习档案','text-link')}</p></details>`;
}
function catalogue(){main.innerHTML='<h1>基础课</h1>'+`<div class="grid course-catalog">${materials.map(m=>`<article class="card"><div class="card-meta"><span class="count-label">第 ${materials.indexOf(m)+1} 课</span></div><h3>${esc(m.title)}</h3><div class="card-footer">${link(`material/${m.id}`,'学习 →','text-link')}</div></article>`).join('')}</div><details class="quiet-details"><summary>按知识点复习</summary><div class="grid course-catalog">${courses.map(courseCard).join('')}</div></details>`}
const typesetOriginal=(text,title='')=>renderGrammar(text,title);
function renderSupplement(b) {
  const pair = b.table && b.examplePairLabel && b.examples.length === 2;
  const tableMarkup = (headers, rows) => `<div class="table-wrap supplement-table"><table>
    <thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody></table></div>`;
  const pairedExample = pair ? `<tr><th scope="row" lang="fr">${esc(b.examplePairLabel)}</th>${b.examples.map(e=>
    `<td><span lang="fr">${esc(e.fr)}</span><small class="supplement-translation" lang="zh-CN">${esc(e.zh)}</small></td>`
  ).join('')}</tr>` : '';
  const comparison = b.table ? tableMarkup(b.table.headers, pairedExample + b.table.rows.map(row=>
    `<tr>${row.map(cell=>`<td lang="fr">${esc(cell)}</td>`).join('')}</tr>`
  ).join('')) : '';
  const examples = pair ? '' : tableMarkup(['法语例句','中文释义'], b.examples.map(e=>
    `<tr><td lang="fr">${esc(e.fr)}</td><td lang="zh-CN">${esc(e.zh)}</td></tr>`
  ).join(''));
  return `<p class="supplement-rule">${esc(b.rule)}</p>${comparison}${examples}
    ${b.application?`<div class="supplement-application"><h4>用法对照</h4><p>${esc(b.application)}</p></div>`:''}
    <p class="supplement-pitfall"><strong>注意</strong> ${esc(b.pitfall)}</p>`;
}
function ruleSummary(rules) {
  if (!rules.length) return '';
  return `<div class="lesson-rule-overview"><h3>规则要点</h3>${rules.map(rule => `<p class="lesson-rule-summary">${esc(rule)}</p>`).join('')}</div>`;
}
function topicHeading(title,index,total){return `<header class="topic-heading"><span class="topic-number">${String(index).padStart(2,'0')}</span><div><p class="topic-position">知识点 ${index} / ${total}</p><h2>${esc(title)}</h2></div></header>`;}
let activeReadingButton;
function stopReading() {
  if (!activeReadingButton) return;
  activeReadingButton.textContent = '合成朗读';
  activeReadingButton = undefined;
  window.speechSynthesis.cancel();
}

function addReadingAudio(root) {
  const passages = [...root.querySelectorAll('.lesson-passage:not([data-original-audio])')].map(passage => ({
    container: passage,
    lines: [...passage.querySelectorAll('.article-paragraph')].map(paragraph => {
      const spoken = paragraph.cloneNode(true);
      spoken.querySelector('.article-speaker')?.remove();
      return spoken.textContent
        .replace(/[（(][^()（）]*[\u3400-\u9fff][^()（）]*[）)]/gu, '')
        .replace(/[\u3400-\u9fff，。；：！？、（）《》【】]+/gu, ' ')
        .trim();
    }),
  }));
  const conjugations = [...root.querySelectorAll('.conjugation-card, .grammar-table')].flatMap(block => {
    const card = block.classList.contains('conjugation-card');
    if (!card && block.tHead?.rows[0]?.cells[0]?.textContent !== 'Singulier') return [];
    const forms = card ? [...block.querySelectorAll('li span[lang="fr"]')] :
      [...block.querySelectorAll('tbody th, tbody td')];
    return [{container: block.closest('.grammar-table-wrap') ?? block, lines: forms.map(form => form.textContent)}];
  });

  const pronunciation = [...root.querySelectorAll('.article-rule-card')].flatMap(block => {
    if (!block.querySelector('h3')?.textContent.match(/→\s*\[/u)) return [];
    const rows = [...block.querySelectorAll('tbody tr')];
    return [{
      container: block.querySelector('.grammar-table-wrap') ?? block,
      lines: rows.map(row => row.cells[0].textContent.trim()),
      pronunciation: true,
    }];
  });

  const listening = [...root.querySelectorAll('[data-listening-text]')].map(container => ({
    container,
    lines: [container.dataset.listeningText],
  }));
  for (const {container, lines, pronunciation: isPronunciation} of [...passages, ...conjugations, ...pronunciation, ...listening]) {
    if (!lines.some(Boolean) || container.closest('.map-reading')?.querySelector('.lesson-original-audio')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reading-audio';
    button.textContent = '合成朗读';
    container.before(button);
    button.onclick = () => {
      const wasPlaying = activeReadingButton === button;
      stopReading();
      if (wasPlaying) return;
      const engine = window.speechSynthesis;
      if (!engine) return toast('当前浏览器不支持朗读。');
      const voices = engine.getVoices().filter(voice => /^fr(?:[-_]|$)/i.test(voice.lang));
      const french = voices.filter(voice => /^fr[-_]FR$/i.test(voice.lang));
      const preferred = french.length ? french : voices;
      const voice = preferred.find(v => /premium|enhanced|natural|增强|优质/i.test(v.name)) ?? preferred[0];
      if (!voice && engine.getVoices().length) return toast('设备还没有法语语音。');
      const segments = lines.filter(Boolean);
      activeReadingButton = button;
      button.textContent = '停止朗读';
      const speak = index => {
        if (activeReadingButton !== button) return;
        if (index >= segments.length) return stopReading();
        const utterance = new SpeechSynthesisUtterance(segments[index]);
        utterance.lang = voice?.lang ?? 'fr-FR';
        if (voice) utterance.voice = voice;
        utterance.rate = isPronunciation ? 0.72 : 0.84;
        utterance.onend = () => {
          if (isPronunciation) {
            setTimeout(() => {
              if (activeReadingButton === button) speak(index + 1);
            }, 800);
          } else speak(index + 1);
        };
        utterance.onerror = () => {
          if (activeReadingButton !== button) return;
          stopReading();
          toast('无法播放法语朗读，请检查设备的语音设置。');
        };
        engine.speak(utterance);
      };
      speak(0);
    };
  }
}

function originalLessonAudio(lesson, title) {
  if (location.hostname !== '127.0.0.1' || location.port !== '4173') return '';
  const fullReading = lesson === 7 && title === '短文' ? 'lesson-07-reading'
    : lesson === 9 ? ({'复习短文1':'lesson-09-reading-1','复合过去时短文':'lesson-09-reading-2'})[title]
    : lesson === 10 && title === '短文' ? 'lesson-10-reading'
    : lesson === 12 && title === '代动词过去时' ? 'lesson-12-reading'
    : lesson === 13 ? ({'短文1':'lesson-13-reading-1','短文2':'lesson-13-reading-2'})[title]
    : '';
  if (fullReading) {
    return `<figure class="lesson-original-audio"><figcaption>课文完整录音</figcaption>
      <audio controls preload="none" src="./lesson-audio/${fullReading}.m4a"></audio></figure>`;
  }
  if (lesson === 6) {
    const clips = {
      '第一类规则动词变位': 'first-verbs',
      '第二类动词变位（规则）': 'second-verbs',
      '短文&对话': 'weather',
      '现在时': 'seasons',
    };
    const clip = clips[title];
    return clip ? `<figure class="lesson-original-audio"><figcaption>真人录音</figcaption>
      <audio controls preload="none" src="./lesson-audio/lesson-${String(lesson).padStart(2,'0')}-${clip}.wav"></audio></figure>` : '';
  }
  if (lesson !== 4) return '';
  const name = title === '课文' ? 'dialogue' : /^(pouvoir|vouloir)\b/i.exec(title)?.[1].toLowerCase();
  if (!name) return '';
  return `<figure class="lesson-original-audio">
    <figcaption>原课件音频</figcaption>
    <audio controls preload="none" src="./lesson-audio/${name}.m4a"></audio>
  </figure>`;
}

function lessonReadingHTML(readings, originalAudio='', lesson) {
  if (!readings.length) return '';
  const passages = readings.map(reading => {
    const audio = originalLessonAudio(lesson, reading.title);
    return `<article class="lesson-passage"${audio || originalAudio ? ' data-original-audio' : ''}>
      ${audio}<div class="courseware-text" lang="fr">${renderArticle(reading.text)}</div>${reading.glossary?.length ? `<section class="article-notes"><h3>词汇解释</h3><dl class="lesson-vocabulary">${reading.glossary.map(item=>`<div><dt lang="fr">${esc(item.fr)}</dt><dd lang="zh-CN">${esc(item.zh)}</dd></div>`).join('')}</dl></section>` : ''}</article>`;
  }).join('');
  return `<section class="lesson-stage" id="lesson-reading"><h2>课文</h2>${originalAudio}${passages}</section>`;
}
function lessonExercisePool(cs){const ids=new Set(cs.map(c=>c.id));return allExercises().filter(e=>ids.has(e.course.id));}
function lessonPracticeHTML(cs){const count=lessonExercisePool(cs).length;return count?`<section class="lesson-stage" id="lesson-practice"><h2>练习</h2><div id="lesson-exercise-body"></div></section>`:'';}
function setupLessonPractice(cs){const box=document.querySelector('#lesson-exercise-body');if(!box)return;const exercises=lessonExercisePool(cs);let position=0;const draw=()=>{box.innerHTML=exerciseCard(exercises[position])+`<div class="practice-navigation"><button type="button" class="secondary" data-lesson-step="-1" ${position===0?'disabled':''}>上一题</button><span class="muted">${position+1} / ${exercises.length}</span><button type="button" class="secondary" data-lesson-step="1" ${position===exercises.length-1?'disabled':''}>下一题</button></div>`;};box.addEventListener('click',event=>{const button=event.target.closest('[data-lesson-step]');if(!button)return;position=Math.max(0,Math.min(exercises.length-1,position+Number(button.dataset.lessonStep)));draw();});draw();}
function material(id){const m=materials.find(x=>x.id===id);if(!m)return empty('课件未找到','请返回基础课。');const fallback={3:'grammar-04',10:'grammar-12',16:'grammar-09',21:'grammar-18',22:'grammar-19'};const related=courses.filter(c=>c.courseware?.some(b=>b.file===m.file)||c.article?.sourceFile===m.file||c.id===fallback[m.lesson]);const flow=buildLessonFlow(m,related.map(c=>c.article));const original=flow.grammar;const linked=new Set();const all=original.map(b=>{const topics=arr(m.supplements).filter(x=>x.anchor===b.title&&!linked.has(x.id));topics.forEach(x=>linked.add(x.id));return {...b,topics};});all.push(...arr(m.supplements).filter(x=>!linked.has(x.id)).map(b=>({...b,origin:'supplement',text:b.rule})));const nodes=all.map((b,i)=>({...b,index:i})).filter(b=>b.origin==='supplement'||b.text.length>30||arr(b.topics).length);const reading=b=>originalLessonAudio(m.lesson,b.title)+(b.origin==='supplement'?renderSupplement(b):`${ruleSummary(arr(b.topics).map(x=>x.rule))}${arr(b.topics).map(x=>x.table?`<div class="table-wrap supplement-table"><table><thead><tr>${x.table.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${x.table.rows.map(row=>`<tr>${row.map(cell=>`<td lang="fr">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'').join('')}<div class="courseware-text">${typesetOriginal(b.text,b.title)}</div>${arr(b.topics).length?`<details class="quiet-details lesson-examples"><summary>例句与辨析</summary>${b.topics.map(x=>`<h3>${esc(x.title)}</h3>${renderSupplement({...x,table:null})}`).join('')}</details>`:''}`);const initialNames={2:'être、aller 与名词',3:'地点与对话',4:'pouvoir 与 vouloir',8:'数量与否定',9:'颜色与描述',10:'过去分词',12:'复习与表达',13:'发音',15:'变位与用法',16:'数字与数量',17:'构成与用法',21:'ce qui、ce que、ce dont',22:'条件式',23:'si 条件句',24:'构成与用法'};const label=b=>b.title==='课件内容'?(initialNames[m.lesson]||m.title):({phonics:'发音','Main Topic 2':'课文'}[b.title]||b.title);main.innerHTML=`<div class="breadcrumb">${link('courses','基础课','')} / 第 ${materials.indexOf(m)+1} 课</div><article class="lesson mindmap-lesson"><p class="muted">第 ${materials.indexOf(m)+1} 课</p><h1>${esc(m.title)}</h1>${arr(m.relatedMaterials).length?`<div class="actions">${m.relatedMaterials.map(id=>link('material/'+id,'配套课件 · '+esc(materials.find(item=>item.id===id)?.title||id),'text-link')).join('')}</div>`:''}<h2 class="lesson-stage-title">语法点</h2><p class="muted">选择知识点</p><div class="map-toolbar"><span>本课知识点 · 共 ${nodes.length} 个</span><div role="group" aria-label="导图缩放"><button type="button" data-map-zoom="out" aria-label="缩小导图">−</button><button type="button" data-map-zoom="reset" aria-label="还原导图大小">100%</button><button type="button" data-map-zoom="in" aria-label="放大导图">+</button></div></div><div class="map-viewport"><div class="lesson-map" aria-label="${esc(m.title)}思维导图"><div class="map-root">${esc(m.title)}</div><div class="map-branches">${nodes.map((b,i)=>`<div class="map-branch" style="--branch-color:${['#4d5590','#8b5f43','#43678d','#805887'][i%4]}"><button type="button" class="map-node" aria-controls="map-reading" aria-pressed="${i===0}" data-map-index="${b.index}"><span class="map-node-number">${String(i+1).padStart(2,'0')}</span><span>${esc(label(b))}</span></button></div>`).join('')}</div></div></div><section id="map-reading" class="map-reading" aria-live="polite" tabindex="-1">${topicHeading(label(nodes[0]),1,nodes.length)}${reading(nodes[0])}</section>${related.flatMap(c=>arr(c.coursewareNotes)).length?`<details class="quiet-details"><summary>易错提醒</summary>${[...new Set(related.flatMap(c=>arr(c.coursewareNotes)))].map(x=>`<p>${esc(x)}</p>`).join('')}</details>`:''}${lessonReadingHTML(flow.readings,originalLessonAudio(m.lesson,'课文'),m.lesson)}${lessonPracticeHTML([...related,m])}<div class="actions">${link('courses','返回课程','text-link')}</div></article>`;setupLessonPractice([...related,m]);let mapZoom=1;main.querySelectorAll('[data-map-zoom]').forEach(button=>button.addEventListener('click',()=>{mapZoom=button.dataset.mapZoom==='reset'?1:Math.max(.7,Math.min(1.6,mapZoom+(button.dataset.mapZoom==='in'?.15:-.15)));main.querySelector('.lesson-map').style.zoom=String(mapZoom);main.querySelector('[data-map-zoom="reset"]').textContent=Math.round(mapZoom*100)+'%';}));main.querySelectorAll('[data-map-index]').forEach(button=>button.addEventListener('click',()=>{const b=all[Number(button.dataset.mapIndex)];main.querySelectorAll('[data-map-index]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));const panel=document.querySelector('#map-reading');stopReading();panel.innerHTML=`${topicHeading(label(b),nodes.findIndex(n=>n.index===Number(button.dataset.mapIndex))+1,nodes.length)}${reading(b)}`;addReadingAudio(panel);panel.focus({preventScroll:true});panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}));}


function toc(current){return `<div class="course-toc"><details ${matchMedia('(min-width:1101px)').matches?'open':''}><summary>章节目录 · ${courses.length} 单元</summary>${courses.map((c,i)=>`<a class="${c.id===current?'current':''}" href="#course/${c.id}">${String(i+1).padStart(2,'0')} ${esc(c.title)}</a>`).join('')}</details></div>`}
function course(id){if(materials.some(m=>m.id===id))return material(id);const c=courseOf(id);if(!c)return empty('课程内容尚未加载','请稍后重试。');const i=courses.indexOf(c);main.innerHTML=`<div class="breadcrumb">${link('courses','基础课','')} / ${esc(c.title)}</div><div class="lesson-layout">${toc(c.id)}<article class="lesson"><p class="muted">基础语法</p><h1>${esc(c.title)}</h1><div class="actions">${materials.filter(m=>c.courseware?.some(b=>b.file===m.file)).map(m=>link(`material/${m.id}`,`第 ${materials.indexOf(m)+1} 课 →`,'text-link')).join('')}</div>${arr(c.courseware).map((b,idx)=>`<section class="courseware-section knowledge-topic">${topicHeading(b.title,idx+1,c.courseware.length)}${idx===0?ruleSummary(arr(c.rules).map(r=>r.explanation)):''}<div class="courseware-text" lang="fr">${typesetOriginal(b.text,b.title)}</div></section>`).join('')}${arr(c.coursewareNotes).length?`<aside class="courseware-errata"><h2>易错提醒</h2>${arr(c.coursewareNotes).map(n=>`<p>${esc(n)}</p>`).join('')}</aside>`:''}<details class="quiet-details"><summary>例句与辨析</summary>${arr(c.rules).map(r=>`${arr(r.examples).map(e=>`<div class="example"><p lang="fr">${esc(e.fr)}</p><small>${esc(e.zh)}</small></div>`).join('')}`).join('')}<p>${esc(txt(c.comparison))}</p></details>${lessonReadingHTML(/原文|对话/u.test(c.article?.kind||'')?[c.article]:[])}${lessonPracticeHTML([c])}<div class="actions"><button class="secondary" data-action="favorite" data-id="${esc(c.id)}">${state.favorites.includes(c.id)?'取消收藏':'收藏'}</button><button class="secondary" data-action="complete" data-id="${esc(c.id)}">${state.completed.includes(c.id)?'已完成 · 撤销':'标记完成'}</button></div><div class="actions">${i>0?link(`course/${courses[i-1].id}`,'← 上一课'):''}${i<courses.length-1?link(`course/${courses[i+1].id}`,'下一课 →'):''}</div></article></div>`;setupLessonPractice([c]);}

function articles(){main.innerHTML='<h1>课文</h1>'+`<div class="grid article-grid">${courses.map(c=>`<article class="card"><div class="card-meta"><span class="tag">${esc(c.level)}</span><span class="count-label">${esc(c.article.kind)}</span></div><h3>${esc(c.title)}</h3><div class="card-footer">${link(`article/${c.id}`,'阅读 →','text-link')}${link(`course/${c.id}`,'语法 ↗','text-link')}</div></article>`).join('')}</div>`}
function article(id){course(id);}

function allExercises(){return [...courses,...materials.filter(m=>arr(m.exercises).length)].flatMap(c=>arr(c.exercises).map(e=>({...e,course:c})));}
function exerciseCard(e){return `<article class="card exercise" data-exercise="${esc(e.id)}"><div class="card-meta"><span class="tag">${esc(typeName(e.type))}</span><span class="tag">${esc(e.level)}</span>${link(`course/${e.course.id}`,esc(e.course.title),'text-link')}</div><div class="question" lang="fr">${esc(e.prompt)}</div>${arr(e.options).length?arr(e.options).map((o,i)=>`<label class="option"><input type="radio" name="${esc(e.id)}" value="${esc(typeof o==='object'?o.value??o.text: o)}">${esc(typeof o==='object'?o.text??o.label:o)}</label>`).join(''):`<input type="text" aria-label="你的答案" placeholder="在这里输入法语答案…" autocomplete="off">`}<div class="actions"><button class="primary" data-action="answer" data-id="${esc(e.id)}">提交答案</button><button class="secondary" data-action="favorite" data-id="${esc(e.id)}">${state.favorites.includes(e.id)?'取消收藏':'☆ 收藏'}</button></div><div class="result" aria-live="polite"></div><small>${e.accentSensitive!==false?'注意重音与拼写。':'本题不区分重音。'}</small></article>`}
function practice(id,mode,index=0){
 let exercises=allExercises();if(id)exercises=exercises.filter(e=>e.course.id===id);
 if(mode==='wrong'){const last=new Map(state.attempts.map(a=>[a.id,a]));exercises=exercises.filter(e=>last.has(e.id)&&!last.get(e.id).correct)}
 if(mode==='favorites')exercises=exercises.filter(e=>state.favorites.includes(e.id));
 const position=Math.max(0,Math.min(index,exercises.length-1));
 main.innerHTML=heading('',mode==='wrong'?'错题复习':mode==='favorites'?'收藏练习':'巩固练习','一次一题，理解后再继续。')+`<div class="filters"><select id="practice-filter" aria-label="按知识点筛选"><option value="">全部知识点</option>${courses.map(c=>`<option value="${esc(c.id)}" ${c.id===id?'selected':''}>${esc(c.title)}</option>`).join('')}</select><span class="count-label">${exercises.length?position+1:0} / ${exercises.length} 题</span></div>${exercises.length?'<div class="practice-focus">'+exerciseCard(exercises[position])+`<div class="practice-navigation" aria-label="练习翻页"><button class="secondary" id="practice-prev" ${position===0?'disabled':''}>上一题</button><span class="muted">第 ${position+1} 题，共 ${exercises.length} 题</span><button class="secondary" id="practice-next" ${position>=exercises.length-1?'disabled':''}>下一题</button></div></div>`:'<div class="empty"><strong>这里还没有题目</strong><p>完成练习后，错题会自动进入复习队列。</p>'+link('practice','开始练习')+'</div>'}`;
 document.querySelector('#practice-filter').onchange=e=>{if(mode)practice(e.target.value,mode,0);else if(location.hash==='#practice/'+e.target.value)practice(e.target.value);else location.hash='practice/'+e.target.value};
 for(const [selector,offset] of [['#practice-prev',-1],['#practice-next',1]]){const button=document.querySelector(selector);if(button)button.onclick=()=>{const latest=state.attempts.findLast(a=>a.id===exercises[position].id);const removed=mode==='wrong'&&latest?.correct;practice(id,mode,position+offset-(removed&&offset>0?1:0));document.querySelector('.exercise')?.scrollIntoView({block:'start'});main.focus({preventScroll:true})}}
}
function review(){const last=new Map(state.attempts.map(a=>[a.id,a]));const wrong=[...last.values()].filter(a=>!a.correct);main.innerHTML=heading('','复习','重做错题，回看收藏。')+`<div class="grid two"><div class="card"><div class="card-icon">↻</div><h3>${wrong.length} 道待复习错题</h3><p>按最近一次作答结果生成，不推测你的掌握程度。</p><div class="actions">${link('review/wrong','开始错题复习 →','button')}</div></div><div class="card"><div class="card-icon">☆</div><h3>${state.favorites.length} 项收藏</h3><p>收藏的知识单元与练习，集中回顾。</p><div class="actions">${link('review/favorites','查看收藏练习 →')}</div></div></div><div class="section-head"><h2>收藏的知识单元</h2></div><div class="grid">${courses.filter(c=>state.favorites.includes(c.id)).map(courseCard).join('')||'<p>尚未收藏课程。在语法页点击「收藏」。</p>'}</div><div class="section-head"><h2>最近作答</h2></div><div class="card">${state.attempts.slice(-12).reverse().map(a=>`<div class="error-row">${a.correct?'✓ 已答对':'↻ 待复习'} · ${esc(allExercises().find(e=>e.id===a.id)?.prompt||a.id)}<br><small>${new Date(a.at).toLocaleString('zh-CN')} · ${link(`course/${a.courseId}`,'回顾知识点','text-link')}</small></div>`).join('')||'<p>还没有作答记录。</p>'}</div>`}
function taskDef(kind,task){const defs=kind==='oral'?exam.oralTasks:exam.writingTasks;return Array.isArray(defs)?defs.find(t=>Number(t.task??t.id??t.number)===Number(task))||defs[Number(task)-1]:defs?.[task]||defs?.[`task${task}`]||{};}
function comprehensionPage(kind, id) {
  const listening = kind === 'listening';
  const pool = arr(exam[kind]);
  const passage = pool.find(item => item.id === id) ?? pool[0];
  if (!passage) return empty('训练材料尚未载入', '请稍后刷新。');
  const index = pool.indexOf(passage);
  const text = `<p class="article-paragraph" lang="fr">${esc(passage.text)}</p>`;
  main.innerHTML = heading(listening ? 'ÉCOUTER' : 'LIRE',
    listening ? '听力训练' : '阅读训练',
    listening ? '听懂信息、抓住细节，再核对原文。' : '阅读短文，寻找依据并理解作者的意思。') +
    `<div class="filters"><label for="comprehension-select">选择材料</label>
    <select id="comprehension-select">${pool.map(item => `<option value="${esc(item.id)}" ${item.id === passage.id ? 'selected' : ''}>${esc(item.title)} · ${esc(item.level)}</option>`).join('')}</select>
    <span class="muted">${index + 1} / ${pool.length} 组</span></div>
    <div class="comprehension-layout"><section class="card comprehension-material">
    <div class="card-meta"><span class="tag">${esc(passage.level)}</span><span class="tag">${esc(passage.source)}</span></div>
    <h2>${esc(passage.title)}</h2>${passage.sourceNote?`<p class="muted">${esc(passage.sourceNote)}</p><a class="text-link" href="${esc(passage.sourceUrl)}" target="_blank" rel="noreferrer">回忆主题出处 ↗</a>`:''}
    ${listening ? `<div class="listening-playback"><h3>播放听力</h3><p class="muted">法语合成语音 · 优先使用自然音色</p><div class="listening-audio-target" data-listening-text="${esc(passage.text)}"></div></div>
    <details class="listening-transcript"><summary>查看听力原文</summary>${text}</details>` : text}
    </section><form class="card comprehension-questions" id="comprehension-form">
    <h2>理解练习</h2>
    ${passage.questions.map((question, i) => `<fieldset><legend>${i + 1}. ${esc(question.prompt)}</legend>
      ${question.options.map((option, j) => `<label class="option"><input type="radio" name="question-${i}" value="${j}" required> ${esc(option)}</label>`).join('')}
      <div class="comprehension-feedback" id="feedback-${i}" aria-live="polite"></div></fieldset>`).join('')}
    <button class="primary" type="submit">提交并查看解析</button>
    <p id="comprehension-score" role="status"></p></form></div>
    <div class="actions">${index > 0 ? link(kind + '/' + pool[index - 1].id, '← 上一组') : ''}
    ${index + 1 < pool.length ? link(kind + '/' + pool[index + 1].id, '下一组 →') : ''}</div>`;
  document.querySelector('#comprehension-select').onchange = event => {
    location.hash = kind + '/' + event.target.value;
  };
  document.querySelector('#comprehension-form').onsubmit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const answers = new FormData(form);
    let score = 0;
    passage.questions.forEach((question, i) => {
      const correct = Number(answers.get('question-' + i)) === question.answer;
      if (correct) score++;
      document.querySelector('#feedback-' + i).innerHTML =
        `<p class="comprehension-result ${correct ? 'is-correct' : 'is-incorrect'}">${correct ? '回答正确' : '再看一下依据'} · 正确答案 ${esc(question.options[question.answer])}</p><p>${esc(question.explanation)}</p>`;
    });
    document.querySelector('#comprehension-score').textContent =
      `本组答对 ${score} / ${passage.questions.length} 题`;
  };
}

function examPage(kind,id){const isOral=kind==='oral',pool=arr(exam[kind]);let q=pool.find(x=>x.id===id);if(!q)q=pool[0];if(isOral)selectedOral=q;else selectedWriting=q;if(!q)return empty('题库尚未载入','请刷新后重试。');const def=taskDef(kind,q.task);const initialSeconds=isOral?(q.answerSeconds||def.answerSeconds||120):(q.suggestedSeconds||900);const initialMinutes=initialSeconds/60;const draft=state.drafts[q.id];main.innerHTML=heading(isOral?'PARLER AVEC CONFIANCE':'ÉCRIRE AVEC CLARTÉ',isOral?'口语训练':'写作训练',isOral?'介绍自己、提出问题、表达观点。用有意识的练习，积累真实表达。':'从一份清楚的草稿开始。回应任务，再打磨结构和语言。')+`<details class="quiet-details"><summary>练习与保存说明</summary><p>${isOral?'练习工具提供计时和自评记录。未接入实时 AI、语音识别、发音分析或自动评分。':'草稿自动保存在当前浏览器。未接入 AI 批改；反馈使用参考范文与自我检查，不提供虚构分数。'}</p></details><div class="filters"><select id="task-filter" aria-label="选择任务">${[1,2,3].map(t=>`<option value="${t}" ${Number(q.task)===t?'selected':''}>任务 ${t}</option>`).join('')}</select><select id="question-filter" aria-label="选择题目">${pool.filter(x=>Number(x.task)===Number(q.task)).map(x=>`<option value="${esc(x.id)}" ${x.id===q.id?'selected':''}>${x.source==='official'?'官方样题':['recalled','user-recalled'].includes(x.source)?'考生回忆':'补充练习'} · ${esc(x.title)}</option>`).join('')}</select><button class="secondary" id="random-question">⤨ 随机抽题</button></div><div class="grid two"><section class="card"><div class="card-meta"><span class="tag">任务 ${esc(q.task)}</span><span class="tag">${esc(q.topic)}</span></div><h2>${esc(q.title)}</h2>${q.source==='user-recalled'?'<p class="muted">用户提供的考试回忆 · 法语题干根据中文描述整理</p>':''}${q.sourceUrl ? `<div class="note"><strong>${q.source==='official'?'官方公开样题 · 中文题意导读':q.adapted?'回忆话题 · 法语改写':'考生回忆 · 中文整理'}</strong><p>${q.source==='official'?'在下方阅读法语原题，再使用本页计时与作答工具练习。':'法语题干按来源话题重新编写，可直接在本页练习。'}</p><a class="source-url" href="${esc(q.sourceUrl)}${q.sourcePage?'#page='+q.sourcePage:''}" target="_blank" rel="noreferrer">打开${q.source==='official'?'官方法语原题':'题目出处'} ↗${q.sourcePage?' · PDF 第 '+q.sourcePage+' 页':''}</a><p class="muted">审题提示、表达建议与自评清单由本应用整理。</p></div>` : ''}<p class="french" lang="${q.promptLanguage||'fr'}">${esc(q.prompt)}</p>${q.source==='official' && q.sourceUrl ? `<section class="official-exam-document"><h3>官方法语原题</h3><iframe title="${esc(q.title)} · 官方原题 PDF" src="${esc(q.sourceUrl)}#page=${q.sourcePage||1}&view=FitH" loading="lazy"></iframe><p class="muted">来源 · France Éducation international。PDF 第 ${q.sourcePage||1} 页。</p></section>` : ''}${arr(q.documents).map((d,i)=>`<div class="example"><strong>材料 ${i+1}</strong><p lang="fr">${esc(typeof d==='object'?d.text??d.content??JSON.stringify(d):d)}</p></div>`).join('')}${q.materialsNote?`<p class="muted">${esc(q.materialsNote)}</p>`:''}<details><summary>审题与组织思路</summary>${list(q.guide)}</details><details><summary>可迁移表达</summary>${list(q.expressions)}</details><details><summary>常见错误</summary>${list(q.mistakes)}</details></section><section class="card">${isOral&&Number(q.task)===2?'<div class="actions"><button class="secondary" id="prep-phase">准备阶段 · 2 分钟</button><button class="secondary" id="answer-phase">作答阶段 · 3 分 30 秒</button></div>':''}<div class="timer-panel"><div><div class="eyebrow">${isOral?'练习计时':'专注写作'}</div><div id="timer" class="timer">${String(Math.floor(initialSeconds/60)).padStart(2,'0')}:${String(initialSeconds%60).padStart(2,'0')}</div></div><div><label class="muted" for="minutes">分钟</label><input id="minutes" type="number" min="1" max="120" value="${initialMinutes}" step="0.5" style="width:72px;padding:6px"><div class="actions"><button class="primary" id="start-timer">开始</button><button class="secondary" id="pause-timer">暂停</button><button class="secondary" id="reset-timer">重置</button></div></div></div><p class="muted">计时以实际经过时间计算；切换页面或刷新会重置。此为可调练习计时；正式任务时间以${link('sources','官方说明','text-link')}为准。</p><details class="quiet-details selfcheck-panel"><summary>自我评价清单</summary><div class="checklist">${arr(q.checklist).map((x,i)=>`<label><input type="checkbox" class="selfcheck" value="${i}" ${!isOral&&arr(draft?.checks).includes(String(i))?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div></details>${isOral?`<label class="muted" for="oral-notes">本次练习反思</label><textarea id="oral-notes" placeholder="哪些表达顺畅？下次要改进什么？" style="min-height:100px"></textarea><button class="primary" id="save-oral">保存练习记录</button><p class="muted">不录制或上传音频，仅保存你填写的自评与练习时长。</p>`:''}</section></div>${!isOral?`<section class="card" style="margin-top:20px"><div class="section-head" style="margin-top:0"><h2>你的草稿</h2><span id="save-status" class="editor-status">${draft?'已恢复本地草稿':'开始输入后自动保存'}</span></div><div class="editor-bar"><span>建议范围：${q.task==1?'60–120':q.task==2?'120–150':'120–180'} 词</span><strong id="word-count">${wordCount(draft?.text||'')} 词</strong></div><textarea id="writing-editor" lang="fr" spellcheck="true" aria-label="法语写作草稿" placeholder="Écrivez votre texte ici…">${esc(draft?.text||'')}</textarea><div class="editor-bar"><span>计词方法：按空白分隔，仅含字母或数字的片段计词；纯标点不计，连字符和撇号连接形式计 1 词。仅作练习参考。</span><button class="secondary" id="snapshot">保存历史版本</button></div><label for="revision-notes" class="muted">我的修改笔记 · 原句 → 建议修改 → 修改原因</label><textarea id="revision-notes" aria-label="写作修改笔记" style="min-height:110px" placeholder="原句：…
建议修改：…
修改原因：…">${esc(draft?.revisionNotes||'')}</textarea><details><summary>草稿历史版本</summary><div id="versions">${state.history.filter(h=>h.id===q.id).slice().reverse().map(h=>`<details><summary>${new Date(h.at).toLocaleString('zh-CN')} · ${wordCount(h.text)} 词</summary><div class="translation" lang="fr">${esc(h.text)}</div></details>`).join('')||'<p class="muted">暂无历史版本。</p>'}</div></details><div class="note">修改建议可按「原句 → 建议修改 → 修改原因」记录。先检查是否回应任务，再检查信息、结构衔接、语法、词汇和语域。未配置自动批改服务。</div></section>`:''}<section class="card" style="margin-top:20px"><h2>任务说明与参考范例</h2>${renderDef(def,q.id,kind)}<p class="muted">范例用于理解组织方式，避免套用万能答案；水平标签是教学参考，不是官方成绩。</p></section>${isOral?`<div class="section-head"><h2>最近练习记录</h2></div><div class="card">${state.oralRecords.slice(-8).reverse().map(r=>`<div class="error-row">${esc(pool.find(p=>p.id===r.id)?.title||r.id)} · ${r.seconds||0} 秒<br><small>${new Date(r.at).toLocaleString('zh-CN')} · 自查 ${r.checks?.length||0} 项</small><p>${esc(r.notes)}</p></div>`).join('')||'<p>完成练习后，在上方保存第一条记录。</p>'}</div>`:''}`;
setupExam(kind,q);}
function renderDef(def,questionId=null,kind=null){if(!def)return '';return Object.entries(def).filter(([k])=>!['examples','task','id','number'].includes(k)).map(([k,v])=>`<p><strong>${esc(({title:'任务',duration:'时间',time:'时间',wordRange:'字数',description:'说明',preparation:'准备',requirements:'要求',preparationSeconds:'准备时间（秒）',answerSeconds:'作答时间（秒）',suggestedSeconds:'练习建议时间（秒）',minWords:'最少词数',maxWords:'最多词数',guide:'任务指导'})[k]||k)}：</strong>${esc(Array.isArray(v)?v.join('；'):typeof v==='object'?JSON.stringify(v):v)}</p>`).join('')+arr(def.examples).map(e=>questionId&&e.questionId&&e.questionId!==questionId?`<p class="muted">本任务示例对应其他题目：${link(`${kind}/${e.questionId}`,esc(e.title||e.questionId)+' →','text-link')}</p>`:`<details><summary>${esc(e.level)} · ${esc(e.title||'原创示例')} ${e.wordCount?`· ${e.wordCount} 词`:''}</summary><div class="article-body" lang="fr">${esc(e.text)}</div></details>`).join('')}
let elapsed=0;
function setupExam(kind,q){elapsed=0;timerRemaining=(kind==='oral'?2:15)*60;const def=taskDef(kind,q.task);timerRemaining=kind==='oral'?(q.answerSeconds||def.answerSeconds||120):(q.suggestedSeconds||900);const route=(id)=>location.hash=kind+'/'+id;document.querySelector('#task-filter').onchange=e=>{const next=arr(exam[kind]).find(x=>Number(x.task)===Number(e.target.value));if(next)route(next.id)};document.querySelector('#question-filter').onchange=e=>route(e.target.value);document.querySelector('#random-question').onclick=()=>{const all=arr(exam[kind]).filter(x=>Number(x.task)===Number(q.task));const pool=all.length>1?all.filter(x=>x.id!==q.id):all;route(pool[Math.floor(Math.random()*pool.length)].id)};const display=()=>{const el=document.querySelector('#timer');if(el)el.textContent=`${String(Math.floor(timerRemaining/60)).padStart(2,'0')}:${String(timerRemaining%60).padStart(2,'0')}`};if(document.querySelector('#prep-phase')){document.querySelector('#prep-phase').onclick=()=>{clearInterval(timer);timer=null;timerRemaining=120;elapsed=0;document.querySelector('#minutes').value=2;display();toast('已切换至准备阶段，点击开始计时。')};document.querySelector('#answer-phase').onclick=()=>{clearInterval(timer);timer=null;timerRemaining=q.answerSeconds||210;elapsed=0;document.querySelector('#minutes').value=3.5;display();toast('已切换至作答阶段，点击开始计时。')}}const syncTime=()=>{if(!timerDeadline)return;const now=Date.now();timerRemaining=Math.max(0,Math.ceil((timerDeadline-now)/1000));elapsed=elapsedBeforeStart+Math.min((timerDeadline-timerStartedAt)/1000,Math.floor((now-timerStartedAt)/1000));display()};document.querySelector('#start-timer').onclick=()=>{if(timer)return;if(timerRemaining<=0)timerRemaining=Math.max(1,Math.min(120,Number(document.querySelector('#minutes').value)||1))*60;timerStartedAt=Date.now();timerDeadline=timerStartedAt+timerRemaining*1000;elapsedBeforeStart=elapsed;timer=setInterval(()=>{syncTime();if(timerRemaining<=0){clearInterval(timer);timer=null;timerDeadline=0;toast('计时结束，回顾本次表达并保存记录。')}},250)};document.querySelector('#pause-timer').onclick=()=>{if(timer)syncTime();clearInterval(timer);timer=null;timerDeadline=0};document.querySelector('#reset-timer').onclick=()=>{clearInterval(timer);timer=null;timerRemaining=Math.max(1,Math.min(120,Number(document.querySelector('#minutes').value)||1))*60;elapsed=0;display()};document.querySelector('#minutes').onchange=()=>{if(!timer){timerRemaining=Math.max(1,Math.min(120,Number(document.querySelector('#minutes').value)||1))*60;display()}};if(kind==='oral'){document.querySelector('#save-oral').onclick=()=>{if(timer)syncTime();state.oralRecords.push({id:q.id,at:new Date().toISOString(),seconds:elapsed,checks:[...document.querySelectorAll('.selfcheck:checked')].map(c=>c.value),notes:document.querySelector('#oral-notes').value});if(save())toast('口语练习记录已保存');};}else{const editor=document.querySelector('#writing-editor');const persistDraft=()=>{state.drafts[q.id]={text:editor.value,at:new Date().toISOString(),checks:[...document.querySelectorAll('.selfcheck:checked')].map(c=>c.value),revisionNotes:document.querySelector('#revision-notes').value};document.querySelector('#word-count').textContent=wordCount(editor.value)+' 词';document.querySelector('#save-status').textContent=save()?'已自动保存 · '+new Date().toLocaleTimeString('zh-CN'):'保存失败，请备份';};editor.oninput=persistDraft;document.querySelector('#revision-notes').oninput=persistDraft;document.querySelectorAll('.selfcheck').forEach(c=>c.onchange=persistDraft);document.querySelector('#snapshot').onclick=()=>{if(!editor.value.trim())return toast('请先写下你的草稿。');state.history.push({id:q.id,text:editor.value,at:new Date().toISOString()});if(save()){toast('历史版本已保存');document.querySelector('#versions').innerHTML=state.history.filter(h=>h.id===q.id).slice().reverse().map(h=>`<details><summary>${new Date(h.at).toLocaleString('zh-CN')} · ${wordCount(h.text)} 词</summary><div class="translation" lang="fr">${esc(h.text)}</div></details>`).join('')}}}}
function sources(){main.innerHTML=heading('TRANSPARENCE & SOURCES','内容与来源','考试事实、第三方研究与原创教学内容分开记录。')+`<section class="card"><h2>官方考试结构</h2><p>口语 12 分钟，含任务 2 的 2 分钟准备；写作 60 分钟。听力 35 分钟，阅读 60 分钟。</p><p>口语任务 1：2 分钟，无准备。任务 2：3 分 30 秒，另有 2 分钟准备。任务 3：4 分 30 秒，无准备。</p><p>写作任务 1：60–120 词；任务 2：120–150 词；任务 3：120–180 词。任务 3 对照两份材料并表达观点，材料综述和个人观点的分段要求参见题目。</p><h3>评价维度</h3>${list(exam.format?.evaluation)}<h2>口语任务</h2>${arr(exam.oralTasks).map(d=>renderDef(d)).join('')}<h2>写作任务</h2>${arr(exam.writingTasks).map(d=>renderDef(d)).join('')}</section><div class="section-head"><h2>来源记录</h2></div><div class="grid two">${arr(exam.sources).map(s=>`<div class="card"><h3>${esc(s.name||s.title)}</h3>${s.url?`<a class="source-url" href="${esc(s.url)}" target="_blank" rel="noreferrer">打开来源 ↗</a>`:''}${Object.entries(s).filter(([k])=>!['name','title','url'].includes(k)).map(([k,v])=>`<p><small>${esc(k)}：${esc(txt(v))}</small></p>`).join('')}</div>`).join('')}</div><div class="section-head"><h2>实际内容规模</h2></div><div class="card table-wrap"><table><thead><tr><th>内容</th><th>已有数量</th></tr></thead><tbody><tr><td>语法单元</td><td>${courses.length}</td></tr><tr><td>配套文章</td><td>${courses.filter(c=>c.article).length}</td></tr><tr><td>基础练习 / 带解析</td><td>${allExercises().length} / ${allExercises().filter(e=>e.explanation).length}</td></tr><tr><td>口语 / 写作模拟题</td><td>${arr(exam.oral).length} / ${arr(exam.writing).length}</td></tr></tbody></table></div><div class="note">CEFR 用于教学难度，NCLC 用于加拿大语言能力等级，两者不会直接混作分数。本应用不预测官方成绩，不提供未核实的等级映射。</div>`}
function data(){main.innerHTML=heading('VOTRE CARNET PERSONNEL','学习档案与备份','你的学习，留在你的设备上。定期导出，安心继续。')+`${recoveryRaw!==null?'<div class="note warning"><strong>检测到格式异常的原始档案</strong><p>为保护现有数据，自动保存暂被阻止。先下载原始恢复备份，再继续新档案；不会把异常内容当作有效学习记录。</p><button id="recover-export" class="primary">下载原始恢复备份</button></div>':''}<div class="note warning">学习进度、错题、收藏、口语自评和写作草稿仅存于当前浏览器的 localStorage，不自动跨设备同步。清除网站数据、无痕会话结束或更换浏览器可能丢失记录。</div><div class="grid two"><div class="card"><h2>导出学习档案</h2><p>下载版本化 JSON 文件，可在另一设备导入。</p><div class="actions"><button class="primary" id="export">下载备份 ↓</button></div><small>格式版本：1 · 不包含音频或账号信息</small></div><div class="card"><h2>导入备份</h2><p>先校验格式，再确认覆盖当前档案。建议先导出已有数据。</p><div class="actions"><input id="import" type="file" accept="application/json,.json" aria-label="选择学习档案 JSON"></div><small>只接受本应用版本 1 的备份，最大 10 MB。</small></div></div><div class="section-head"><h2>当前档案</h2></div><div class="card"><p>完成单元 ${state.completed.length} · 作答记录 ${state.attempts.length} · 收藏 ${state.favorites.length} · 口语记录 ${state.oralRecords.length} · 草稿 ${Object.keys(state.drafts).length} · 历史版本 ${state.history.length}</p><p class="muted">账号、云同步、AI 批改、语音服务尚未配置。此应用不会要求 API 密钥，不会上传你的草稿。</p></div>`;if(document.querySelector('#recover-export'))document.querySelector('#recover-export').onclick=()=>{const blob=new Blob([recoveryRaw],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='french-original-recovery-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);recoveryExported=true;toast('原始恢复备份已生成；现在可保存新的学习档案。')};document.querySelector('#export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='french-learning-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已生成')};document.querySelector('#import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>10*1024*1024)throw Error('文件超过 10 MB');const next=JSON.parse(await f.text());if(!valid(next))throw Error('备份结构或版本不符合要求');if(!confirm('导入将覆盖当前学习档案。请确认已备份现有数据。'))return;state=next;if(save()){toast('档案已导入');data()}}catch(err){toast('导入失败：'+err.message)}finally{e.target.value=''}}}
function empty(title,message){main.innerHTML=`<div class="empty"><strong>${esc(title)}</strong><p>${esc(message)}</p>${link('home','返回学习总览')}</div>`}
function route(){stopReading();clearInterval(timer);timer=null;closeNav();const [page='home',id]=location.hash.slice(1).split('/');document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===({course:'courses',article:'courses',material:'courses',practice:'review'}[page]||page)));try{if(page==='home'||!page)home();else if(page==='courses')catalogue();else if(page==='course')course(id);else if(page==='material')material(id);else if(page==='articles')articles();else if(page==='article')article(id);else if(page==='practice')practice(id);else if(page==='review'){if(id)practice(null,id);else review()}else if(page==='listening'||page==='reading')comprehensionPage(page,id);else if(page==='oral'||page==='writing')examPage(page,id);else if(page==='sources'){sources();main.insertAdjacentHTML('beforeend',`<details class="quiet-details"><summary>课程资料</summary>${materials.map(m=>`<p>${esc(m.title)} · ${esc(m.file)}</p>`).join('')}<h3>参考资料</h3>${[...new Map(materials.flatMap(m=>arr(m.supplements)).map(b=>[b.sourceUrl,b])).values()].map(b=>`<p><a class="text-link" href="${esc(b.sourceUrl)}" target="_blank" rel="noreferrer">${esc(b.sourceName)} ↗</a></p>`).join('')}</details>`);}else if(page==='data')data();else empty('没有找到这一页','请从导航中选择学习内容。')}catch(err){console.error(err);empty('页面暂时无法显示','学习记录不会受影响。请返回首页或刷新后重试。')}addReadingAudio(main);main.focus({preventScroll:true});window.scrollTo(0,0)}
main.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id,action=b.dataset.action;if(action==='favorite'){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];if(save()){b.textContent=state.favorites.includes(id)?'取消收藏':'☆ 收藏';toast(state.favorites.includes(id)?'已加入收藏':'已取消收藏')}}else if(action==='complete'){state.completed=state.completed.includes(id)?state.completed.filter(x=>x!==id):[...state.completed,id];save();course(id)}else if(action==='answer'){const ex=allExercises().find(x=>x.id===id),box=b.closest('.exercise'),answer=box.querySelector('input[type=radio]:checked')?.value??box.querySelector('input[type=text]')?.value??'';if(!answer.trim())return toast('请先选择或填写答案。');const open=/情境|表达转换|开放|translation|scenario|short/i.test(ex.type)&&!ex.options?.length;const accepted=arr(ex.answers);const correct=accepted.some(a=>normalize(answer,ex.accentSensitive!==false)===normalize(String(a),ex.accentSensitive!==false));if(open&&!correct){box.querySelector('.result').innerHTML=`<div class="feedback"><strong>开放表达：请对照要点自评</strong><p>参考表达：<span lang="fr">${accepted.map(esc).join(' / ')}</span></p><p>${esc(ex.explanation)}</p><p>检查：${esc(ex.pitfall)}</p><p>你的表达可能同样合理，系统不会仅因措辞不同判错。</p><div class="actions"><button class="secondary" data-action="selfpass" data-id="${esc(id)}">符合要点，记录通过</button><button class="secondary" data-action="selfretry" data-id="${esc(id)}">需要复习，加入错题</button></div></div>`;return}recordAnswer(ex,correct,answer);box.querySelector('.result').innerHTML=`<div class="feedback ${correct?'':'wrong'}"><strong>${correct?'✓ 回答正确':'再想一想，这里需要留意'}</strong><p>参考答案：<span lang="fr">${accepted.map(esc).join(' / ')}</span></p><p>${esc(ex.explanation)}</p><p>常见误区：${esc(ex.pitfall)}</p>${link(`course/${ex.course.id}`,'回顾对应语法 →','text-link')}</div>`;}else if(action==='selfpass'||action==='selfretry'){const ex=allExercises().find(x=>x.id===id);recordAnswer(ex,action==='selfpass',b.closest('.exercise').querySelector('input[type=text]')?.value||'');b.closest('.result').innerHTML='<div class="feedback">自评结果已保存。'+link(`course/${ex.course.id}`,'回顾对应语法 →','text-link')+'</div>';}});
function recordAnswer(ex,correct,answer){state.attempts.push({id:ex.id,courseId:ex.course.id,correct,answer,at:new Date().toISOString()});save()}
window.addEventListener('hashchange',route);
try{const result=await Promise.all([fetch('./src/data/courses.json'),fetch('./src/data/exam.json?v=6'),fetch('./src/data/materials.json?v=30')]);if(result.some(r=>!r.ok))throw Error('内容文件加载失败');[courses,exam,materials]=await Promise.all(result.map(r=>r.json()));if(!Array.isArray(courses))throw Error('课程格式错误');route();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').then(reg=>{reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('发现新版本，关闭所有本应用窗口后重新打开即可更新。')})})}).catch(err=>console.warn('离线功能不可用',err));}catch(err){console.error(err);empty('学习内容未能载入','请检查网络并刷新。离线使用需先在线打开一次。');}
export {normalize,wordCount,valid};
