import {transitionPhraseEntries} from './transition-phrases.js';
const L=(en,zh,tw)=>({en,'zh-CN':zh,'zh-TW':tw});
const endings=['ai','as','a','ons','ez','ont'],conditional=['ais','ais','ait','ions','iez','aient'];
const avoir=['ai','as','a','avons','avez','ont'],etre=['suis','es','est','sommes','êtes','sont'];
function verb(id,meaning,present,imperfect,stem,participle,example,auxiliary='avoir'){
 const past=auxiliary==='être'?etre.map((a,i)=>`${a} ${participle}${i===3?'(e)s':i===4?'(e)(s)':i===5?'(e)s':'(e)'}`):avoir.map(a=>`${a} ${participle}`);
 return {id,meaning,example,auxiliary,forms:{present,imperfect,future:endings.map(e=>stem+e),conditional:conditional.map(e=>stem+e),past}};
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
 verb('parler',L('to speak','说；交谈','說；交談'),['parle','parles','parle','parlons','parlez','parlent'],['parlais','parlais','parlait','parlions','parliez','parlaient'],'parler','parlé','Je parle français avec mes collègues.')
];
export const transitionPrepositions=transitionPhraseEntries.filter(entry=>entry.prepositions.length);
export const transitionPhrases=transitionPhraseEntries;
