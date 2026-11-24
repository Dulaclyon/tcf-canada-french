import {translate as t} from './i18n.js';
let mounted=false;
export async function mountGuestView(account){
 if(mounted)return;const me=account||await fetch('/api/me',{cache:'no-store'}).then(r=>r.ok?r.json():null);if(me?.role!=='guest')return;mounted=true;
 const banner=document.createElement('p');banner.className='guest-view-banner';banner.style.cssText='padding:12px 20px;margin:0;background:#f4ecef;color:#642736;border-bottom:1px solid #dfcbd3;font-size:14px';banner.textContent='访客：可以练习并保存自己的学习记录；管理与批改页面仅供查看。';document.body.prepend(banner);
 const apply=()=>{
  const management=['/admin.html','/submissions.html','/roles.html'].includes(location.pathname);
  const scope=management?document.querySelector('main'):location.hash.startsWith('#notifications')?document.querySelector('.notification-compose'):null;
  if(!scope)return;
  scope.querySelectorAll('input,textarea,button,select').forEach(el=>{
   const browsing=el.closest('.submission-filters,.student-status-filter')||['refresh-submissions','load-more','ai-refresh'].includes(el.id)||el.classList.contains('submission-item');
   if(!browsing&&!el.disabled){el.disabled=true;el.title=t('管理页面仅供查看');}
  });
 };
 apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});
}
