import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const f of ['index.html','app.js','styles.css','manifest.webmanifest','sw.js','icon.svg']) await copyFile(f,`dist/${f}`);
await cp('src/data','dist/src/data',{recursive:true});
await copyFile('index.html','dist/404.html');
await copyFile('.nojekyll','dist/.nojekyll');
console.log('Built static application in dist; no raw learning files included.');
