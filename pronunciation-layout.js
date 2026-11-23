// Pronunciation is structured teaching data, never inferred from paragraph separators.
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const soundGroups={
 e:{sound:'[e]',spelling:'é · -es · -ez · -er',audio:'e',note:'这些拼写在所列例词中读 [e]；并非所有 -es 都发音，-er 也有 mer [mɛʁ] 等例外。',words:[['mes','我的'],['fée','仙女'],['été','夏天'],['assez','足够'],['thé','茶'],['tes','你的'],['dé','骰子'],['épée','剑'],['étaler','摊开'],['venez','来'],['ses','他／她的'],['chez','在某人家'],['aller','去'],['limiter','限制'],['clé','钥匙'],['les','定冠词复数；或宾语代词'],['nez','鼻子'],['quitter','离开'],['répéter','重复']],phrases:[['cet été','今年夏天'],['c’est assez','这就够了。']]},
 ou:{sound:'[u]',spelling:'ou',audio:'ou',note:'ou 在这些词中读 [u]；注意与 u [y] 区分。',words:[['pou','虱子'],['bout','末端'],['nous','我们'],['loup','狼'],['tout','全部'],['doux','温柔的'],['fou','疯的'],['vous','您／你们'],['chou','卷心菜'],['joue','脸颊'],['sous','在……下面'],['zou','走吧'],['cou','脖子'],['goût','味道'],['jouer','玩'],['zoulou','祖鲁人']],phrases:[]},
 y:{sound:'[y]',spelling:'u',audio:'y',note:'u [y] 和 ou [u] 都要圆唇；用 rue 和 roue 对照听辨。',words:[['rue [ʁy]','街道'],['roue [ʁu]','轮子（对照 [u]）']],phrases:[]},
 'open-e':{sound:'[ɛ]',spelling:'è · ê · ai · ei · -et',audio:'open-e',note:'这些例词读 [ɛ]；ai 的读音随单词变化。',words:[['faire','做'],['faites','做（vous 形式）'],['lait','牛奶'],['mais','但是'],['un père','父亲'],['très','很'],['une fête','节日'],['une tête','头'],['seize','十六'],['la peine','痛苦'],['un jouet','玩具'],['un livret','小册子']],phrases:[['très bien','很好']]},
 i:{sound:'[i]',spelling:'i · î · y',audio:'i',note:'本组例词读 [i]。',words:[['une île','岛'],['si','如果'],['Fanny','人名']],phrases:[]},
 wa:{sound:'[wa]',spelling:'oi',audio:'wa',note:'本组例词中的 oi 读 [wa]。',words:[['moi','我'],['toi','你'],['la foi','信仰'],['le foie','肝脏'],['la loi','法律'],['soi','自己']],phrases:[]},
 tion:{sound:'[sjɔ̃]',spelling:'-tion',audio:'tion',note:'situation、nation、solution 等词的词尾读 [sjɔ̃]；décision 中读 [zjɔ̃]，不可一概而论。',words:[['la situation','情况'],['la nation','国家'],['la conversation','对话'],['la solution','解决办法'],['la formation','培训'],['la construction','建造'],['la présentation','介绍；展示'],['la protection','保护'],['la traduction','翻译']],phrases:[['Est-ce que je peux avoir une conversation avec toi ?','我能和你聊一聊吗？']]},
 sion:{sound:'[zjɔ̃]',spelling:'-sion · décision',audio:'sion',note:'décision 的词尾读 [zjɔ̃]，与上面的 [sjɔ̃] 区分。',words:[['la décision','决定']],phrases:[]},
 'nasal-an':{sound:'[ɑ̃]',spelling:'an · en · am · em',audio:'nasal-an',note:'本组例词含鼻元音 [ɑ̃]；不要把 n、m 单独读出来。',words:[['enfant','孩子'],['manger','吃'],['temps','时间；天气'],['penser','想'],['chambre','房间'],['ambulance','救护车'],['emballer','打包']],phrases:[]},
 'nasal-in':{sound:'[ɛ̃]',spelling:'in · im · ain · aim · ein · yn · ym',audio:'nasal-in',note:'这些拼写在所列词中表示鼻元音 [ɛ̃]；后接元音或双写辅音时，不能直接套用。',words:[['le vin','葡萄酒'],['la fin','结束'],['le matin','早晨'],['quinze','十五'],['important','重要的'],['impossible','不可能的'],['imbécile','愚蠢的'],['impoli','不礼貌的'],['imperméable','防水的'],['pain','面包'],['demain','明天'],['certain','确定的'],['humain','人类的'],['faim','饥饿'],['daim','鹿；鹿皮'],['plein','满的'],['rein','肾脏'],['seins','胸部'],['ceinture','腰带'],['bientôt','很快'],['syndicat','工会'],['sympathique','友好的'],['symbole','符号']],phrases:[['J’ai faim.','我饿了。']]},
 o:{sound:'[o]',spelling:'eau · au · aux',audio:'o',note:'这三种拼写在本组例词中均读 [o]。',words:[['eau','水'],['chaud','热的'],['cadeaux','礼物（复数）'],['aux','à + les']],phrases:[]},
 eu:{sound:'[ø]',spelling:'eu · eux',audio:'eu',note:'以下例词中的 eu 均读 [ø]；其他词中也可读 [œ]，如 sœur。',words:[['feu','火'],['peu','少'],['eux','他们'],['heureux','幸福的']],phrases:[]},
 j:{sound:'[j]',spelling:'i / y · -ail / -aille · -ill',audio:'j',note:'接近英语 yes 的开头。fille、famille 中有 [j]；ville、mille、tranquille 保留 [l]。',words:[['bien','好'],['pied','脚'],['voyage','旅行'],['travail','工作'],['détail','细节'],['fille','女孩'],['famille','家庭'],['bouteille','瓶子'],['ville [vil]','城市（例外）'],['mille [mil]','一千（例外）'],['tranquille [tʁɑ̃kil]','安静的（例外）']],phrases:[]}
};
export function pronunciationKeys(text){
 const s=String(text);const keys=[];
 if(/é;\s*单词末尾的/u.test(s))keys.push('e','ou','y');
 if(/et 在单字末尾/u.test(s))keys.push('open-e','i','wa');
 if(/tion 的发音/u.test(s))keys.push('tion','sion');
 if(/an[：:]|an \/ en \/ am \/ em/u.test(s))keys.push('nasal-an');
 if(/发音部分 in, im/u.test(s))keys.push('nasal-in');
 if(/eau \/ au \/ aux/u.test(s))keys.push('o','eu','y');
 if(/\[j\]/u.test(s))keys.push('j');
 if(/^i, î, y$/mu.test(s))keys.push('i');if(/^oi$/mu.test(s))keys.push('wa');if(/^ou$/mu.test(s))keys.push('ou');if(/^u \/ eux/mu.test(s))keys.push('eu','y');
 return [...new Set(keys)];
}
// Displayed examples are the single source of truth for saved speech.
export const spokenExample=value=>String(value).replace(/\s*\[[^\]]+\]/gu,'').trim();
export const speechExamples=examples=>[...new Map(examples.map(example=>[example.fr||example[0],example.fr||example[0]])).values()].map(spokenExample);
export const speechScript=examples=>speechExamples(examples).map(value=>/[.!?…]$/u.test(value)?value:value+'.').join(' ');
export function speechFingerprint(examples){let hash=2166136261;for(const char of speechScript(examples)){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,'0');}
export const contextAudioKey=examples=>'context-'+speechFingerprint(examples);
export function pronunciationPlayback(key,examples){return `<figure class="phonics-playback"><figcaption>分类发音录音 <small>合成语音 · 听后跟读</small></figcaption><audio controls preload="none" data-phonics-audio data-speech-key="${esc(key)}" src="./pronunciation-audio/${esc(key)}.mp3?v=${speechFingerprint(examples)}" aria-label="例词发音示范"></audio></figure>`;}
export function pronunciationExamplesAudio(examples){return examples?.length?pronunciationPlayback(contextAudioKey(examples),examples):'';}
const renderWords=items=>`<dl class="phonics-word-list">${items.map(([fr,meaning])=>`<div><dt lang="fr">${esc(fr)}</dt><dd>${esc(meaning)}</dd></div>`).join('')}</dl>`;
export function renderSoundGroups(keys){return `<div class="grammar-content phonics-reference">${[...new Set(keys)].map(key=>{const g=soundGroups[key];if(!g)return '';return `<section class="phonics-sound" data-sound="${esc(key)}"><header class="phonics-sound-heading"><h3 lang="fr">${esc(g.sound)}</h3><p lang="fr">${esc(g.spelling)}</p></header><p class="phonics-note">${esc(g.note)}</p>${pronunciationPlayback(g.audio,[...g.words,...g.phrases])}${renderWords(g.words)}${g.phrases.length?renderWords(g.phrases):''}</section>`;}).join('')}</div>`;}
export function renderPronunciation(text,extraExamples=[]){
 const keys=pronunciationKeys(text);if(!keys.length)return '';
 const examples=[...new Map(extraExamples.map(e=>[e.fr,e])).values()];
 return renderSoundGroups(keys)+(examples.length?`<section class="phonics-context"><h3>例句</h3>${pronunciationExamplesAudio(examples)}${renderWords(examples.map(e=>[e.fr,e.zh]))}</section>`:'');
}
