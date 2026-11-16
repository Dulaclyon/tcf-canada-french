import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const f of ['human-audio.js','login.html','admin.html','login.js','admin.js','account.css','lesson-recaps.js','weather-lesson.js','possessive-recap.js','basic-verbs.js','student-storage.js','index.html','app.js','bank.js','bank-progress.js','grammar-layout.js','lesson-flow.js','grammar.css','styles.css','manifest.webmanifest','sw.js','icon.svg','privacy.html']) await copyFile(f,`dist/${f}`);
await cp('human-audio','dist/human-audio',{recursive:true});
await cp('pronunciation-audio','dist/pronunciation-audio',{recursive:true});
await cp('src/data','dist/src/data',{recursive:true});
await copyFile('index.html','dist/app.html');
await copyFile('landing.html','dist/index.html');
await copyFile('landing.css','dist/landing.css');
await copyFile('landing.html','dist/404.html');

await copyFile('.nojekyll','dist/.nojekyll');
console.log('Built static application in dist; no raw learning files included.');

if (process.env.TCF_BANK_LOCAL === '1') await cp('imports/tcf-bank/bank','dist/bank',{recursive:true});
