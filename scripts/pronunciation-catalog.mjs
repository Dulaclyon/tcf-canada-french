import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {soundGroups,contextAudioKey,speechExamples,speechScript,speechFingerprint} from '../pronunciation-layout.js';
export function pronunciationCatalog(){
 const clips={};
 const add=(key,examples)=>{const entry={examples:speechExamples(examples),text:speechScript(examples),fingerprint:speechFingerprint(examples)};if(clips[key]&&clips[key].text!==entry.text)throw Error('Conflicting pronunciation clip: '+key);clips[key]=entry;};
 for(const [key,g] of Object.entries(soundGroups))add(g.audio,[...g.words,...g.phrases]);
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const materials=JSON.parse(readFileSync(path.join(root,'src/data/materials.json'),'utf8'));
 for(const material of materials){
  const topics=(material.supplements||[]).filter(t=>material.id.startsWith('grammar-sounds-')||/发音|读音|音变|省音|phonics|元音|目标音|拼读/u.test(t.title)||['发音','phonics'].includes(t.anchor));
  for(const topic of topics)if(topic.title==='省音与连读'&&topic.examples?.length){for(const group of topic.pronunciationGroups||[topic])add(contextAudioKey(group.examples),group.examples);}
  const combined=topics.filter(t=>t.title!=='省音与连读').flatMap(t=>t.examples||[]);
  if(combined.length)add(contextAudioKey(combined),combined);
 }
 return clips;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(pronunciationCatalog(),null,2));
