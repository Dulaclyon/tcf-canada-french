import {googleAuthRoute,googleSession} from './google-auth.mjs';
/** Sites supplies verified visitor identity; never trust a client-side login flag. */
export async function serve(request, files, env={}) {
  const url = new URL(request.url);
  const provider=env.AUTH_PROVIDER||'none';
  const publicMode=provider==='none';
  const googleMode=provider==='google';
  if(googleMode){const authResponse=await googleAuthRoute(request,env);if(authResponse)return authResponse;}
  const identity=publicMode?null:googleMode?(await googleSession(request,env))?.sub:request.headers.get('oai-authenticated-user-id');
  const headers = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
  if (url.pathname === '/session') {
    return Response.json({signedIn: Boolean(identity),mode:provider}, {headers:{...headers,'Cache-Control':'private, no-store','Vary':'Cookie'}});
  }
  let path = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (path === 'app.html' && !publicMode && !identity) {
    const login = new URL(googleMode?'/auth/google':'/signin-with-chatgpt', url.origin);
    login.searchParams.set('return_to', '/app.html#home');
    return Response.redirect(login.toString(),302);
  }
  if(publicMode&&path.startsWith('auth/'))return Response.redirect(url.origin+'/app.html#home',303);
  if (!path || path === 'index.html') path='index.html';
  if(path==='privacy')path='privacy.html';
  const asset=files[path];
  if (!asset) return new Response('页面不存在',{status:404,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});
  let body=asset.body;
  if(googleMode&&path.endsWith('.html')){if(path==='index.html'&&!identity)body=body.replaceAll('href="./app.html#home"','href="/auth/google"').replace('>开始学习<','>使用 Google 登录，开始学习<');body=body.replaceAll('/signin-with-chatgpt?return_to=%2Fapp.html%23home','/auth/google').replaceAll('ChatGPT','Google');
    body=body.replace('<a href="/signout-with-chatgpt?return_to=%2F" target="_top">退出登录</a>','<form method="post" action="/auth/logout" class="logout-form"><button type="submit">退出登录</button></form>');
  }
  if (path==='index.html' && identity) {
    body=body.replaceAll(googleMode?'/auth/google':'/signin-with-chatgpt?return_to=%2Fapp.html%23home','/app.html#home').replaceAll(googleMode?'使用 Google 登录，开始学习':'使用 ChatGPT 登录，开始学习','进入我的学习空间').replace('>登录 <span','>进入学习 <span');
  }
  return new Response(request.method==='HEAD'?null:body,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':path.endsWith('.html')?'private, no-store':'public, max-age=0, must-revalidate',...(path==='index.html'?{'Vary':'Cookie'}:{}),...(path==='sw.js'?{'Service-Worker-Allowed':'/'}:{})}});
}
