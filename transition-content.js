import {prepositionEntries} from './transition-prepositions.js';
import {transitionPhraseEntries} from './transition-phrases.js';
const L=(en,zh,tw)=>({en,'zh-CN':zh,'zh-TW':tw});
const endings=['ai','as','a','ons','ez','ont'],conditional=['ais','ais','ait','ions','iez','aient'];
const avoir=['ai','as','a','avons','avez','ont'],etre=['suis','es','est','sommes','êtes','sont'];
function verb(id,meaning,present,imperfect,stem,participle,example,auxiliary='avoir'){
 const past=auxiliary==='être'?etre.map((a,i)=>`${a} ${participle}${i===3?'(e)s':i===4?'(e)(s)':i===5?'(e)s':'(e)'}`):avoir.map(a=>`${a} ${participle}`);
 const auxImperfect=auxiliary==='être'?['étais','étais','était','étions','étiez','étaient']:['avais','avais','avait','avions','aviez','avaient'];
 const pluperfect=past.map((form,i)=>auxImperfect[i]+' '+form.split(' ').slice(1).join(' '));
 return {id,meaning,example,auxiliary,forms:{present,imperfect,future:endings.map(e=>stem+e),conditional:conditional.map(e=>stem+e),past,pluperfect}};
}
export const transitionVerbs=[
 verb('être',L('to be','是；处于某种状态','是；處於某種狀態'),etre,['étais','étais','était','étions','étiez','étaient'],'ser','été','Je suis disponible demain.'),
 verb('avoir',L('to have','有','有'),avoir,['avais','avais','avait','avions','aviez','avaient'],'aur','eu','J’ai une question.'),
 verb('aller',L('to go','去','去'),['vais','vas','va','allons','allez','vont'],['allais','allais','allait','allions','alliez','allaient'],'ir','allé','Nous allons à la bibliothèque.','être'),
 verb('venir',L('to come','来','來'),['viens','viens','vient','venons','venez','viennent'],['venais','venais','venait','venions','veniez','venaient'],'viendr','venu','Vous venez avec nous ?','être'),
 verb('faire',L('to do / make','做；制作','做；製作'),['fais','fais','fait','faisons','faites','font'],['faisais','faisais','faisait','faisions','faisiez','faisaient'],'fer','fait','Je fais du sport le week-end.'),
 verb('prendre',L('to take','拿；乘坐','拿；搭乘'),['prends','prends','prend','prenons','prenez','prennent'],['prenais','prenais','prenait','prenions','preniez','prenaient'],'prendr','pris','Je prends le bus pour aller au travail.'),
 verb('pouvoir',L('can / to be able to','能够','能夠'),['peux','peux','peut','pouvons','pouvez','peuvent'],['pouvais','pouvais','pouvait','pouvions','pouviez','pouvaient'],'pourr','pu','Pouvez-vous m’aider ?'),
 verb('vouloir',L('to want','想要','想要'),['veux','veux','veut','voulons','voulez','veulent'],['voulais','voulais','voulait','voulions','vouliez','voulaient'],'voudr','voulu','Nous voulons participer à cette activité.'),
 verb('devoir',L('must / to have to','必须；应当','必須；應當'),['dois','dois','doit','devons','devez','doivent'],['devais','devais','devait','devions','deviez','devaient'],'devr','dû','Je dois terminer ce dossier.'),
 verb('parler',L('to speak','说；交谈','說；交談'),['parle','parles','parle','parlons','parlez','parlent'],['parlais','parlais','parlait','parlions','parliez','parlaient'],'parler','parlé','Je parle français avec mes collègues.'),
 verb("chercher",{"en": "to look for", "zh-CN": "寻找", "zh-TW": "尋找"},["cherche", "cherches", "cherche", "cherchons", "cherchez", "cherchent"],["cherchais", "cherchais", "cherchait", "cherchions", "cherchiez", "cherchaient"],"chercher","cherché","Je cherche un logement près de la gare.","avoir"),
 verb("monter",{"en": "to go up", "zh-CN": "上去；登上", "zh-TW": "上去；登上"},["monte", "montes", "monte", "montons", "montez", "montent"],["montais", "montais", "montait", "montions", "montiez", "montaient"],"monter","monté","Nous montons au troisième étage.","être"),
 verb("dire",{"en": "to say / tell", "zh-CN": "说；告诉", "zh-TW": "說；告訴"},["dis", "dis", "dit", "disons", "dites", "disent"],["disais", "disais", "disait", "disions", "disiez", "disaient"],"dir","dit","Vous dites la même chose.","avoir"),
 verb("savoir",{"en": "to know", "zh-CN": "知道；会", "zh-TW": "知道；會"},["sais", "sais", "sait", "savons", "savez", "savent"],["savais", "savais", "savait", "savions", "saviez", "savaient"],"saur","su","Je sais utiliser ce logiciel.","avoir"),
 verb("écrire",{"en": "to write", "zh-CN": "写", "zh-TW": "寫"},["écris", "écris", "écrit", "écrivons", "écrivez", "écrivent"],["écrivais", "écrivais", "écrivait", "écrivions", "écriviez", "écrivaient"],"écrir","écrit","J’écris au propriétaire pour demander des renseignements.","avoir"),
 verb("boire",{"en": "to drink", "zh-CN": "喝", "zh-TW": "喝"},["bois", "bois", "boit", "buvons", "buvez", "boivent"],["buvais", "buvais", "buvait", "buvions", "buviez", "buvaient"],"boir","bu","Nous buvons de l’eau après le sport.","avoir"),
 verb("naître",{"en": "to be born", "zh-CN": "出生", "zh-TW": "出生"},["nais", "nais", "naît", "naissons", "naissez", "naissent"],["naissais", "naissais", "naissait", "naissions", "naissiez", "naissaient"],"naîtr","né","De nouvelles idées naissent de cette discussion.","être"),
 verb("ouvrir",{"en": "to open", "zh-CN": "打开", "zh-TW": "打開"},["ouvre", "ouvres", "ouvre", "ouvrons", "ouvrez", "ouvrent"],["ouvrais", "ouvrais", "ouvrait", "ouvrions", "ouvriez", "ouvraient"],"ouvrir","ouvert","Le magasin ouvre à neuf heures.","avoir"),
 verb("nettoyer",{"en": "to clean", "zh-CN": "清洁", "zh-TW": "清潔"},["nettoie", "nettoies", "nettoie", "nettoyons", "nettoyez", "nettoient"],["nettoyais", "nettoyais", "nettoyait", "nettoyions", "nettoyiez", "nettoyaient"],"nettoier","nettoyé","Je nettoie la cuisine après le repas.","avoir"),
 verb("mettre",{"en": "to put", "zh-CN": "放；穿上", "zh-TW": "放；穿上"},["mets", "mets", "met", "mettons", "mettez", "mettent"],["mettais", "mettais", "mettait", "mettions", "mettiez", "mettaient"],"mettr","mis","Je mets mon manteau avant de sortir.","avoir"),
 verb("courir",{"en": "to run", "zh-CN": "跑", "zh-TW": "跑"},["cours", "cours", "court", "courons", "courez", "courent"],["courais", "courais", "courait", "courions", "couriez", "couraient"],"courr","couru","Nous courons le long de la rivière.","avoir"),
 verb("appeler",{"en": "to call", "zh-CN": "打电话；叫", "zh-TW": "打電話；叫"},["appelle", "appelles", "appelle", "appelons", "appelez", "appellent"],["appelais", "appelais", "appelait", "appelions", "appeliez", "appelaient"],"appeller","appelé","J’appelle la mairie pour prendre rendez-vous.","avoir"),
 verb("lever",{"en": "to raise", "zh-CN": "举起；抬起", "zh-TW": "舉起；抬起"},["lève", "lèves", "lève", "levons", "levez", "lèvent"],["levais", "levais", "levait", "levions", "leviez", "levaient"],"lèver","levé","Elle lève la main pour poser une question.","avoir"),
 verb("préférer",{"en": "to prefer", "zh-CN": "更喜欢", "zh-TW": "更喜歡"},["préfère", "préfères", "préfère", "préférons", "préférez", "préfèrent"],["préférais", "préférais", "préférait", "préférions", "préfériez", "préféraient"],"préférer","préféré","Je préfère le train à l’avion.","avoir"),
 verb("entendre",{"en": "to hear", "zh-CN": "听见", "zh-TW": "聽見"},["entends", "entends", "entend", "entendons", "entendez", "entendent"],["entendais", "entendais", "entendait", "entendions", "entendiez", "entendaient"],"entendr","entendu","J’entends les annonces dans la gare.","avoir"),
 verb("mouvoir",{"en": "to move / set in motion", "zh-CN": "使移动", "zh-TW": "使移動"},["meus", "meus", "meut", "mouvons", "mouvez", "meuvent"],["mouvais", "mouvais", "mouvait", "mouvions", "mouviez", "mouvaient"],"mouvr","mû","Ce moteur meut le mécanisme.","avoir"),
 verb("vivre",{"en": "to live", "zh-CN": "生活；居住", "zh-TW": "生活；居住"},["vis", "vis", "vit", "vivons", "vivez", "vivent"],["vivais", "vivais", "vivait", "vivions", "viviez", "vivaient"],"vivr","vécu","Nous vivons à Québec depuis deux ans.","avoir"),
 verb("sortir",{"en": "to go out", "zh-CN": "出去", "zh-TW": "出去"},["sors", "sors", "sort", "sortons", "sortez", "sortent"],["sortais", "sortais", "sortait", "sortions", "sortiez", "sortaient"],"sortir","sorti","Je sors avec mes amis ce soir.","être"),
 verb("voir",{"en": "to see", "zh-CN": "看见", "zh-TW": "看見"},["vois", "vois", "voit", "voyons", "voyez", "voient"],["voyais", "voyais", "voyait", "voyions", "voyiez", "voyaient"],"verr","vu","Je vois un parc en face de l’école.","avoir"),
 verb("commencer",{"en": "to begin", "zh-CN": "开始", "zh-TW": "開始"},["commence", "commences", "commence", "commençons", "commencez", "commencent"],["commençais", "commençais", "commençait", "commencions", "commenciez", "commençaient"],"commencer","commencé","Nous commençons la réunion à dix heures.","avoir"),
 verb("manger",{"en": "to eat", "zh-CN": "吃", "zh-TW": "吃"},["mange", "manges", "mange", "mangeons", "mangez", "mangent"],["mangeais", "mangeais", "mangeait", "mangions", "mangiez", "mangeaient"],"manger","mangé","Nous mangeons ensemble à midi.","avoir"),
 verb("acquérir",{"en": "to acquire", "zh-CN": "获得", "zh-TW": "獲得"},["acquiers", "acquiers", "acquiert", "acquérons", "acquérez", "acquièrent"],["acquérais", "acquérais", "acquérait", "acquérions", "acquériez", "acquéraient"],"acquerr","acquis","Elle acquiert de l’expérience pendant son stage.","avoir"),
 verb("lire",{"en": "to read", "zh-CN": "读", "zh-TW": "讀"},["lis", "lis", "lit", "lisons", "lisez", "lisent"],["lisais", "lisais", "lisait", "lisions", "lisiez", "lisaient"],"lir","lu","Je lis les consignes avant de commencer.","avoir"),
 verb("conduire",{"en": "to drive / lead", "zh-CN": "驾驶；带领", "zh-TW": "駕駛；帶領"},["conduis", "conduis", "conduit", "conduisons", "conduisez", "conduisent"],["conduisais", "conduisais", "conduisait", "conduisions", "conduisiez", "conduisaient"],"conduir","conduit","Elle conduit ses enfants à l’école.","avoir")
];
export const transitionPrepositions=prepositionEntries;
export const transitionPhrases=transitionPhraseEntries;

const notes={
 monter:L('These tables use être for going up. With a direct object, use avoir: j’ai monté les valises.','表中表示上去，用 être；接直接宾语时用 avoir：j’ai monté les valises。','表中表示上去，用 être；接直接受詞時用 avoir：j’ai monté les valises。'),
 sortir:L('These tables use être for going out. With a direct object, use avoir: j’ai sorti les poubelles.','表中表示出去，用 être；接直接宾语时用 avoir：j’ai sorti les poubelles。','表中表示出去，用 être；接直接受詞時用 avoir：j’ai sorti les poubelles。'),
 préférer:L('The traditional future stem préférer- is shown. The spelling préfèrer- is also accepted.','表中采用传统将来时词干 préférer-；新拼写 préfèrer- 也可接受。','表中採用傳統未來式詞幹 préférer-；新拼寫 préfèrer- 也可接受。'),
 mouvoir:L('A formal, less frequent verb. In everyday speech, use bouger or déplacer when the meaning fits.','较正式、低频；日常表达可按语义选用 bouger 或 déplacer。','較正式、低頻；日常表達可按語義選用 bouger 或 déplacer。')
};
for(const v of transitionVerbs)if(notes[v.id])v.note=notes[v.id];
function reflexive(base,id,meaning,example){
 const pronouns=['me','te','se','nous','vous','se'];
 const add=(form,i)=>/^[aeiouéèêâîôûh]/u.test(form)&&i!==3&&i!==4?pronouns[i].slice(0,-1)+'’'+form:pronouns[i]+' '+form;
 const forms={};for(const key of ['present','imperfect','future','conditional'])forms[key]=base.forms[key].map(add);
 const pp=base.forms.past[0].split(' ').slice(1).join(' ').replace(/\(e\)/g,'');
 const agreed=i=>pp+(i===3||i===5?'(e)s':i===4?'(e)(s)':'(e)');
 forms.past=etre.map((a,i)=>add(a+' '+agreed(i),i));
 forms.pluperfect=['étais','étais','était','étions','étiez','étaient'].map((a,i)=>add(a+' '+agreed(i),i));
 return {id,meaning,example,auxiliary:'être',reflexive:true,forms,note:id==='se laver'?L('The table shows the verb used without a following direct object. With a body part, agreement can change: elle s’est lavé les mains.','表中为后面不接直接宾语的用法；接身体部位时，配合规则会改变：elle s’est lavé les mains。','表中為後面不接直接受詞的用法；接身體部位時，配合規則會改變：elle s’est lavé les mains。'):undefined};
}
const regular=(id,stem,example)=>verb(id,L(id,id,id),['e','es','e','ons','ez','ent'].map(e=>stem+e),conditional.map(e=>stem+e),id,stem+'é',example);
const reflexiveData=[
 ['se réveiller',regular('réveiller','réveill'),L('to wake up','醒来','醒來'),'Je me réveille à sept heures.'],
 ['se lever',transitionVerbs.find(v=>v.id==='lever'),L('to get up','起床','起床'),'Je me lève tôt pour aller au travail.'],
 ['se laver',regular('laver','lav'),L('to wash oneself','洗漱；洗澡','盥洗；洗澡'),'Je me lave après le sport.'],
 ['se préparer',regular('préparer','prépar'),L('to get ready','准备','準備'),'Nous nous préparons à passer l’examen.'],
 ['se concentrer',regular('concentrer','concentr'),L('to concentrate','集中注意力','集中注意力'),'Vous vous concentrez sur vos études.'],
 ['se reposer',regular('reposer','repos'),L('to rest','休息','休息'),'Je me repose un peu après le déjeuner.'],
 ['s’habiller',regular('habiller','habill'),L('to get dressed','穿衣','穿衣'),'Elle s’habille avant de prendre son petit-déjeuner.'],
 ['se coucher',regular('coucher','couch'),L('to go to bed','上床睡觉','上床睡覺'),'Nous nous couchons à vingt-deux heures.'],
 ['s’amuser',regular('amuser','amus'),L('to have fun','玩得开心','玩得開心'),'Les enfants s’amusent dans le parc.']
];
for(const [id,base,meaning,example] of reflexiveData)transitionVerbs.push(reflexive(base,id,meaning,example));
const baseById=id=>transitionVerbs.find(v=>v.id===id);
const addReflexive=(base,id,meaning,example)=>transitionVerbs.push(reflexive(base,id,meaning,example));
addReflexive(verb('détendre',L('to relax','放松','放鬆'),['détends','détends','détend','détendons','détendez','détendent'],conditional.map(e=>'détend'+e),'détendr','détendu',''), 'se détendre',L('to relax','放松','放鬆'),'Nous nous détendons après le travail.');
addReflexive(verb('endormir',L('to put to sleep','哄睡','哄睡'),['endors','endors','endort','endormons','endormez','endorment'],conditional.map(e=>'endorm'+e),'endormir','endormi',''), 's’endormir',L('to fall asleep','入睡','入睡'),'Il s’endort vers vingt-trois heures.');
addReflexive(regular('doucher','douch'),'se doucher',L('to take a shower','淋浴','淋浴'),'Je me douche après le sport.');
addReflexive(regular('relaxer','relax'),'se relaxer',L('to relax','放松','放鬆'),'Elle se relaxe en écoutant de la musique.');
addReflexive(baseById('mettre'),'se mettre',L('to start / put oneself','开始；使自己处于','開始；使自己處於'),'Nous nous mettons à travailler.');
addReflexive(regular('débarrasser','débarrass'),'se débarrasser',L('to get rid of','摆脱','擺脫'),'Elle se débarrasse des objets inutiles.');
const rappeler={...baseById('appeler'),forms:Object.fromEntries(Object.entries(baseById('appeler').forms).map(([t,forms])=>[t,forms.map(f=>f.replace(/appel/g,'rappel'))]))};
addReflexive(rappeler,'se rappeler',L('to remember','记得','記得'),'Je me rappelle cette journée.');
transitionVerbs.at(-1).note=L('In standard French: se rappeler quelque chose, without de; se souvenir de quelque chose uses de.','规范表达为 se rappeler quelque chose，不加 de；se souvenir de quelque chose 则用 de。','規範表達為 se rappeler quelque chose，不加 de；se souvenir de quelque chose 則用 de。');
const souvenir={...baseById('venir'),forms:Object.fromEntries(Object.entries(baseById('venir').forms).map(([t,forms])=>[t,forms.map(f=>f.replace(/\b(vi|ven)/g,'sou$1'))]))};
addReflexive(souvenir,'se souvenir',L('to remember','记得；想起','記得；想起'),'Je me souviens de cette rencontre.');
const efforcer=regular('efforcer','efforc');efforcer.forms.present[3]='efforçons';efforcer.forms.imperfect=['efforçais','efforçais','efforçait','efforcions','efforciez','efforçaient'];
addReflexive(efforcer,'s’efforcer',L('to strive / make an effort','努力；尽力','努力；盡力'),'Nous nous efforçons de parler clairement.');
const brosser=reflexive(regular('brosser','bross'),'se brosser les dents',L('to brush one’s teeth','刷牙','刷牙'),'Je me brosse les dents après le petit-déjeuner.');
for(const [tense,forms] of Object.entries(brosser.forms))brosser.forms[tense]=forms.map(f=>f.replace(/\(e\)\(s\)|\(e\)s|\(e\)/g,'')+' les dents');
brosser.note=L('Les dents is a direct object placed after the verb: elle s’est brossé les dents, without agreement on brossé.','les dents 是后置的直接宾语，因此说 elle s’est brossé les dents，brossé 不配合。','les dents 是後置的直接受詞，因此說 elle s’est brossé les dents，brossé 不配合。');
transitionVerbs.push(brosser);
