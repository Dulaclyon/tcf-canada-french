import {storage} from './student-storage.js';
import {SECTION_NOTE_LIMIT,SECTION_NOTE_KEYS} from './section-notes-model.js';
const drafts=new Map(),timers=new Map(),pending=new Map(),expanded=new Map(),statuses=new Map();
const message={saved:'笔记已保存',saving:'正在保存笔记…',editing:'尚未保存',error:'笔记保存失败，请重试。'};
function draft(kind){if(!drafts.has(kind)){let text='';try{text=JSON.parse(storage.getItem(SECTION_NOTE_KEYS[kind])||'{}').text||'';}catch{}drafts.set(kind,text);}return drafts.get(kind);}
function update(kind,status){statuses.set(kind,status);for(const root of document.querySelectorAll(`[data-section-notes="${kind}"]`)){root.querySelector('[data-notes-status]').textContent=message[status];root.querySelector('[data-notes-retry]').hidden=status!=='error';}}
async function save(kind){
 clearTimeout(timers.get(kind));timers.delete(kind);
 const text=draft(kind);if(pending.get(kind)?.text===text)return pending.get(kind).promise;
 update(kind,'saving');
 let promise;try{promise=Promise.resolve(storage.setItem(SECTION_NOTE_KEYS[kind],JSON.stringify({text})));}catch{update(kind,'error');return false;}
 pending.set(kind,{text,promise});const ok=await promise;
 if(pending.get(kind)?.promise!==promise)return ok;
 pending.delete(kind);if(draft(kind)===text)update(kind,ok?'saved':'error');return ok;
}
export function mountSectionNotes(main,kind){
 if(!SECTION_NOTE_KEYS[kind]||main.querySelector('[data-section-notes]'))return;
 const root=document.createElement('details');root.className='card section-notes';root.dataset.sectionNotes=kind;root.open=expanded.get(kind)||false;
 root.innerHTML=`<summary><span>我的笔记</span><span class="section-notes-count" data-i18n-skip></span></summary><div class="section-notes-body"><p class="muted">本板块共用，自动保存至个人账号。</p><textarea aria-label="本板块笔记" id="section-notes-editor" maxlength="${SECTION_NOTE_LIMIT}" placeholder="记录重点、词汇或下次要复习的内容…" aria-describedby="section-notes-count"></textarea><div class="section-notes-footer"><span data-notes-status role="status"></span><button type="button" class="secondary" data-notes-retry hidden>重试保存</button></div></div>`;
 const editor=root.querySelector('textarea'),counter=root.querySelector('.section-notes-count');counter.id='section-notes-count';editor.value=draft(kind);counter.textContent=`${editor.value.length} / ${SECTION_NOTE_LIMIT}`;
 root.querySelector('[data-notes-status]').textContent=message[statuses.get(kind)||'saved'];root.querySelector('[data-notes-retry]').hidden=statuses.get(kind)!=='error';
 editor.addEventListener('input',()=>{if(editor.value.length>SECTION_NOTE_LIMIT)editor.value=editor.value.slice(0,SECTION_NOTE_LIMIT);drafts.set(kind,editor.value);counter.textContent=`${editor.value.length} / ${SECTION_NOTE_LIMIT}`;update(kind,'editing');clearTimeout(timers.get(kind));timers.set(kind,setTimeout(()=>save(kind),600));});
 editor.addEventListener('blur',()=>{if(statuses.get(kind)==='editing')save(kind);});
 root.addEventListener('toggle',()=>expanded.set(kind,root.open));root.querySelector('[data-notes-retry]').addEventListener('click',()=>save(kind));
 // Above the practice body: available immediately without scrolling past a long question.
 const heading=main.querySelector('h1');if(heading)heading.insertAdjacentElement('afterend',root);else main.append(root);
}
