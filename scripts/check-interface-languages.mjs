import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {translate} from '../i18n.js';import {messages} from '../ui-locales.js';
assert.equal(translate('学生登录'),'Student login');assert.equal(translate('学生登录','zh-CN'),'学生登录');assert.equal(translate('学生登录','zh-TW'),'學生登入');
assert.equal(translate('退出登录','zh-TW'),'登出');assert.equal(translate('已完成 1 / 69 题','en'),'Completed 1 / 69 questions');assert.equal(translate('任务 2 · 已完成 3 / 23 题','zh-TW'),'任務 2 · 已完成 3 / 23 題');
assert.equal(translate('Présentez-vous.','en'),'Présentez-vous.');assert.equal(translate('第 3 组','en'),'Set 3');assert(Object.keys(messages).length>350);
const exam=JSON.parse(await readFile('src/data/exam.json','utf8'));const chinese=/[\u3400-\u9fff]/u;
for(const kind of ['oral','writing','reading','listening'])for(const q of exam[kind]){assert.equal(q.promptLanguage,'fr');assert(!chinese.test(q.prompt||''),q.id);assert(!chinese.test(q.title),q.id);for(const sub of q.questions||[]){assert(!chinese.test(sub.prompt));assert(sub.options.every(o=>!chinese.test(o)));}}
for(const file of ['index.html','landing.html','login.html','admin.html','submissions.html','privacy.html'])assert((await readFile(file,'utf8')).includes('src="/i18n.js"'),file);
const app=await readFile('app.js','utf8');assert(app.includes('Longueur :'));assert(app.includes('lang="fr" data-i18n-skip'));assert(app.includes('Tâche ${esc(q.task)}'));
console.log('English default, Simplified and Taiwan Traditional UI, French-only preparation prompts, protected question text, shared language selector and dynamic progress labels passed.');

const bank=await readFile('bank.js','utf8');assert(bank.includes('Choisissez une réponse.'));assert(!bank.includes('请听录音选项'));
