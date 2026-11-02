/** Sites supplies verified visitor identity; never trust a client-side login flag. */
export function serve(request, files) {
  const url = new URL(request.url);
  const identity = request.headers.get('oai-authenticated-user-id');
  const headers = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
  if (url.pathname === '/session') {
    return Response.json({signedIn: Boolean(identity)}, {headers:{...headers,'Cache-Control':'private, no-store','Vary':'Cookie'}});
  }
  let path = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (path === 'app.html' && !identity) {
    const login = new URL('/signin-with-chatgpt', url.origin);
    login.searchParams.set('return_to', '/app.html#home');
    return Response.redirect(login.toString(),302);
  }
  if (!path || path === 'index.html') path='index.html';
  const asset=files[path];
  if (!asset) return new Response('页面不存在',{status:404,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});
  let body=asset.body;
  if (path==='index.html' && identity) {
    body=body.replaceAll('/signin-with-chatgpt?return_to=%2Fapp.html%23home','/app.html#home');
  }
  return new Response(request.method==='HEAD'?null:body,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':path.endsWith('.html')?'private, no-store':'public, max-age=0, must-revalidate',...(path==='index.html'?{'Vary':'Cookie'}:{}),...(path==='sw.js'?{'Service-Worker-Allowed':'/'}:{})}});
}
