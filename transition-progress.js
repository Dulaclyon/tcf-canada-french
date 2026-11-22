import {transitionVerbs,transitionPrepositions,transitionPhrases} from './transition-content.js';
export const TRANSITION_PROGRESS_KEY='transition-completed-v1';
export const transitionItemId=(kind,item)=>`${kind}:${item.id}`;
export const transitionItemIds=[...transitionVerbs.map(v=>transitionItemId('verbs',v)),...transitionPrepositions.map(v=>transitionItemId('prepositions',v)),...transitionPhrases.map(v=>transitionItemId('phrases',v))];
const allowed=new Set(transitionItemIds);
export const validTransitionProgress=value=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===1&&Array.isArray(value.completed)&&value.completed.length<=allowed.size&&new Set(value.completed).size===value.completed.length&&value.completed.every(id=>typeof id==='string'&&allowed.has(id));
export function transitionMetric(value){const completed=new Set(Array.isArray(value?.completed)?value.completed:[]);const done=transitionItemIds.filter(id=>completed.has(id)).length,total=allowed.size;return {done,total,inProgress:0,percent:total?Math.round(done/total*1000)/10:0,available:true};}
