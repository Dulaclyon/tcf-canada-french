const recordings = [
 {lesson:31,title:'课文',label:'本课课堂录音 1',file:'penny-cres-67.m4a',source:'新增加的单元/Penny Cres 67.m4a'},
 {lesson:31,title:'课文',label:'本课课堂录音 2',file:'penny-cres-68.m4a',source:'新增加的单元/Penny Cres 68.m4a'},
  {
    "lesson": 2,
    "title": "基础动词与变位",
    "label": "基础动词朗读",
    "file": "original-02-01.m4a",
    "source": "leçon 2/Amica Swan Lake 3.m4a"
  },
  {
    "lesson": 3,
    "title": "发音",
    "label": "发音示范",
    "file": "original-03-02.m4a",
    "visible": false,
    "source": "leçon 3/Amica Swan Lake 6.m4a"
  },
  {
    "lesson": 4,
    "title": "Pouvoir 能，能够",
    "label": "pouvoir 变位与例句",
    "file": "original-04-03.m4a",
    "source": "leçon 4/pouvoir.m4a"
  },
  {
    "lesson": 4,
    "title": "Vouloir 想要 ，愿意 =",
    "label": "vouloir 变位与例句",
    "file": "original-04-04.m4a",
    "source": "leçon 4/Vouloir.m4a"
  },
  {
    "lesson": 4,
    "title": "Préposition",
    "label": "介词朗读",
    "file": "original-04-05.m4a",
    "source": "leçon 4/Preposition.m4a"
  },
  {
    "lesson": 4,
    "title": "对话",
    "label": "对话录音",
    "file": "original-04-06.m4a",
    "source": "leçon 4/dialogue.m4a"
  },
  {
    "lesson": 5,
    "title": "数字",
    "label": "日期与星期朗读",
    "file": "original-05-07.m4a",
    "source": "leçon 5/Amica Swan Lake 70(1).m4a"
  },
  {
    "lesson": 5,
    "title": "数字",
    "label": "数字朗读",
    "file": "original-05-08.m4a",
    "source": "leçon 5/Amica Swan Lake 71(1).m4a"
  },
  {
    "lesson": 5,
    "title": "天气",
    "label": "天气表达朗读",
    "file": "original-05-09.m4a",
    "source": "leçon 5/Amica Swan Lake 72(1).m4a"
  },
  {
    "lesson": 5,
    "title": "发音",
    "label": "-tion 发音示范",
    "file": "original-05-10.m4a",
    "source": "leçon 5/Amica Swan Lake 73(1).m4a",
    "visible": false
  },
  {
    "lesson": 6,
    "title": "发音",
    "label": "鼻化元音示范",
    "file": "original-05-11.m4a",
    "source": "leçon 5/Amica Swan Lake 80(1).m4a",
    "visible": false
  },
  {
    "lesson": 7,
    "title": "短文",
    "label": "课文朗读与讲解",
    "file": "original-08-12.m4a",
    "source": "leçon 8/短文解释.m4a"
  },
  {
    "lesson": 7,
    "title": "冠词",
    "label": "冠词例句朗读",
    "file": "original-08-13.m4a",
    "source": "leçon 8/冠词.m4a"
  },
  {
    "lesson": 8,
    "title": "形容词与副词",
    "label": "形容词例句朗读",
    "file": "original-08-14.m4a",
    "source": "leçon 8/Amica Swan Lake 65.m4a"
  },
  {
    "lesson": 14,
    "title": "Main Topic 2",
    "label": "课文录音",
    "file": "original-14-15.m4a",
    "source": "leçon 14/Amica Swan Lake 27.m4a"
  },
  {
    "lesson": 6,
    "title": "短文&对话",
    "label": "天气对话",
    "file": "penny-cres-62.m4a",
    "source": "人工发音待上传/Penny Cres 62.m4a"
  },
  {
    "lesson": 6,
    "title": "现在时",
    "label": "法国的四季",
    "file": "penny-cres-63.m4a",
    "source": "人工发音待上传/Penny Cres 63.m4a"
  }
];
export {recordings};
export function originalLessonAudio(lesson,title) {
 // Phonics uses only exact, category-specific synthesized recordings.
 if(/发音|拼读|phonics?|prononciation/iu.test(String(title)))return ''; 
 return recordings.filter(r=>r.visible!==false && r.lesson===lesson && r.title===title).map(r=>`<figure class="lesson-original-audio" data-human-recording><figcaption><span data-ui-label>真人录音</span> · <span data-ui-label>${r.title==='发音'?'原始课堂发音录音':r.title==='Préposition'?'原始课堂介词录音':r.label}</span></figcaption><audio controls preload="none" src="./human-audio/${r.file}"></audio></figure>`).join('');
}
