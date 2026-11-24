export const LISTENING_MEMORY_KEY='listening-question-memory-v1';
export const LISTENING_MEMORY_LIMIT=20;
export const memoryLength=text=>Array.from(text).length;
export const trimMemory=text=>Array.from(text).slice(0,LISTENING_MEMORY_LIMIT).join('');
export function validListeningMemory(value){
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=5000&&Object.entries(value).every(([key,text])=>/^[a-zA-Z0-9_-]+:[1-9][0-9]{0,2}$/u.test(key)&&typeof text==='string'&&memoryLength(text)<=LISTENING_MEMORY_LIMIT&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text));
}
