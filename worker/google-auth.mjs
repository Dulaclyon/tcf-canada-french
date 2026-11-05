import {createRemoteJWKSet,jwtVerify,SignJWT,base64url} from 'jose';
const googleKeys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const SESSION='__Host-french_google_session',NONCE='__Host-french_google_nonce';
const TTL=30*24*60*60;
const htmlEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cookies=req=>Object.fromEntries((req.headers.get('cookie')||'').split(';').map(s=>s.trim().split(/=(.*)/s)).filter(p=>p.length>=2).map(p=>[p[0],p[1]]));
const secretKey=env=>{if(typeof env.GOOGLE_SESSION_SECRET!=='string'||env.GOOGLE_SESSION_SECRET.length<43)throw Error('Session secret not configured');return new TextEncoder().encode(env.GOOGLE_SESSION_SECRET)};
export function googleConfigured(env){return /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(env.GOOGLE_CLIENT_ID||'')&&typeof env.GOOGLE_SESSION_SECRET==='string'&&env.GOOGLE_SESSION_SECRET.length>=43;}
export async function verifyGoogleCredential(token,{clientId,nonce,keyResolver=googleKeys}){
 if(typeof token!=='string'||token.length>16000||!nonce)throw Error('Invalid credential');
 const {payload}=await jwtVerify(token,keyResolver,{algorithms:['RS256'],audience:clientId,issuer:['https://accounts.google.com','accounts.google.com'],requiredClaims:['sub','iat','exp','nonce'],clockTolerance:5,maxTokenAge:'2h'});
 if(payload.nonce!==nonce||typeof payload.sub!=='string'||payload.sub.length>255||payload.iat>Date.now()/1000+60)throw Error('Invalid identity');
 return {sub:payload.sub};
}
export async function createGoogleSession(sub,env){return new SignJWT({provider:'google'}).setProtectedHeader({alg:'HS256',typ:'JWT'}).setSubject(sub).setIssuer('french-learning').setAudience('french-web').setIssuedAt().setExpirationTime('30d').sign(secretKey(env));}
export async function googleSession(request,env){try{const token=cookies(request)[SESSION];if(!token)return null;const {payload}=await jwtVerify(token,secretKey(env),{algorithms:['HS256'],issuer:'french-learning',audience:'french-web',requiredClaims:['sub','iat','exp'],maxTokenAge:'30d'});return payload.provider==='google'&&typeof payload.sub==='string'?{sub:payload.sub,provider:'google'}:null}catch{return null}}
function responseHtml(body,status=200,extra={}){return new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',...extra}})}
function page(content){return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Google 登录 · 法语通关</title><link rel="icon" href="/icon.svg"><link rel="stylesheet" href="/landing.css"></head><body><header class="topbar"><a class="brand" href="/">法语通关</a></header><main class="hero wrap"><p class="eyebrow">法语通关 · TCF Canada</p>${content}</main></body></html>`;}
export async function googleAuthRoute(request,env,{keyResolver=googleKeys}={}){
 const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith('/auth/'))return null;
 if(path==='/auth/logout'){
  if(request.method!=='POST'||request.headers.get('origin')!==url.origin)return new Response('请求来源无法验证',{status:403});
  return new Response(null,{status:303,headers:{Location:'/', 'Cache-Control':'no-store','Set-Cookie':`${SESSION}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}});
 }
 if(!googleConfigured(env))return responseHtml(page('<h1>Google 登录待配置</h1><p class="hero-desc">请管理员完成 Google 客户端和服务器会话配置。</p><a href="/">返回首页</a>'),503);
 if(path==='/auth/google'&&request.method==='GET'){
  if(await googleSession(request,env))return Response.redirect(url.origin+'/app.html#home',303);
  const nonce=base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
  const content=`<h1>用 Google 账号登录</h1><p class="hero-desc">登录后，继续你的法语学习。</p><div id="g_id_onload" data-client_id="${htmlEscape(env.GOOGLE_CLIENT_ID)}" data-login_uri="${htmlEscape(url.origin+'/auth/google/callback')}" data-ux_mode="redirect" data-auto_prompt="false" data-nonce="${nonce}"></div><div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="signin_with" data-shape="rectangular"></div><script src="https://accounts.google.com/gsi/client?hl=zh-CN" async defer></script><p class="scope-note">登录状态可保留最多 30 天。学习记录仍保存在当前浏览器。</p>`;
  return responseHtml(page(content),200,{'Set-Cookie':`${NONCE}=${nonce}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`,'Cross-Origin-Opener-Policy':'same-origin-allow-popups'});
 }
 if(path==='/auth/google/callback'&&request.method==='POST'){
  try{
   if(Number(request.headers.get('content-length')||0)>32768)throw Error('Oversize');
   if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))throw Error('Unsupported content');
   const raw=await request.text();if(raw.length>32768)throw Error('Oversize');const form=new URLSearchParams(raw),cookie=cookies(request);
   const csrf=form.get('g_csrf_token');if(!csrf||csrf.length>1024||csrf!==cookie.g_csrf_token||!cookie[NONCE])throw Error('Invalid CSRF');
   const user=await verifyGoogleCredential(form.get('credential'),{clientId:env.GOOGLE_CLIENT_ID,nonce:cookie[NONCE],keyResolver});
   const token=await createGoogleSession(user.sub,env),headers=new Headers({Location:'/app.html#home','Cache-Control':'no-store'});
   headers.append('Set-Cookie',`${SESSION}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL}`);
   headers.append('Set-Cookie',`${NONCE}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`);
   return new Response(null,{status:303,headers});
  }catch{return responseHtml(page('<h1>登录未完成</h1><p class="hero-desc">本次登录已过期或无法验证，请重新尝试。</p><a class="button primary" href="/auth/google">重新用 Google 登录</a>'),400)}
 }
 return new Response('页面不存在',{status:404});
}
