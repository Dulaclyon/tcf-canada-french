import assert from 'node:assert/strict';
import {serve} from '../worker/handler.mjs';
const files={'index.html':{body:'HERO /signin-with-chatgpt?return_to=%2Fapp.html%23home',type:'text/html'},'app.html':{body:'APP',type:'text/html'}};
const legacyEnv={AUTH_PROVIDER:'chatgpt'};
const request=(path,signedIn=false)=>new Request('https://example.test'+path,{headers:signedIn?{'oai-authenticated-user-id':'test-user'}:{}});
assert.equal((await serve(request('/'),files,legacyEnv)).status,200);
assert((await (await serve(request('/'),files,legacyEnv)).text()).startsWith('HERO'));
const anon=(await serve(request('/app.html'),files,legacyEnv));assert.equal(anon.status,302);assert(anon.headers.get('location').includes('/signin-with-chatgpt?return_to='));
assert.equal(await (await serve(request('/app.html',true),files,legacyEnv)).text(),'APP');
assert((await (await serve(request('/',true),files,legacyEnv)).text()).includes('/app.html#home'));
assert.deepEqual(await (await serve(request('/session'),files,legacyEnv)).json(),{signedIn:false,mode:'chatgpt'});
assert.equal((await serve(request('/not-found'),files,legacyEnv)).status,404);
assert((await serve(request('/app.html',true),files,legacyEnv)).headers.get('Cache-Control').includes('no-store'));
console.log('Auth tests passed: anonymous Hero, protected app redirect, verified identity, no-store, 404.');

assert.equal((await serve(request('/app.html'),files)).status,200);
assert.deepEqual(await (await serve(request('/session'),files,{AUTH_PROVIDER:'none'})).json(),{signedIn:false,mode:'none'});
assert.equal((await serve(request('/auth/google'),files,{AUTH_PROVIDER:'none'})).status,303);
console.log('Public access checks passed: app available without cookies or identity; no login redirects.');
