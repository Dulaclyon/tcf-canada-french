import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
await import('./build-course-translations.mjs');
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const f of ['notifications.js','notifications.css','culture-reader-model.js','culture-reader.js','culture-reader.css','culture-readings.json','speech-segments.js','transition-phrases.js','transition-prepositions.js','transition-extra-verbs.js','transition-verb-examples.js','transition-progress.js','transition-content.js','transition-to-prep.js','section-notes-model.js','section-notes.js','lesson-practice.js','register.html','register.js','learning-dashboard.js','learning-progress.js','essay-assessment.js','pronunciation-layout.js','course-editorial.js','course-translations.js','i18n.js','ui-locales.js','writing-submission.js','submissions.html','submissions.js','writing-progress.js','section-access.js','human-audio.js','login.html','admin.html','login.js','admin.js','account.css','brand.css','lesson-recaps.js','weather-lesson.js','possessive-recap.js','basic-verbs.js','student-storage.js','index.html','app.js','bank.js','bank-progress.js','grammar-layout.js','lesson-flow.js','grammar.css','styles.css','manifest.webmanifest','sw.js','icon.svg','privacy.html']) await copyFile(f,`dist/${f}`);
await cp('assets','dist/assets',{recursive:true});
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
