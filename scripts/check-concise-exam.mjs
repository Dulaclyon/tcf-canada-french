import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile('app.js','utf8'),examPage=source.slice(source.indexOf('function examPage('),source.indexOf('function questionExamples('));
for(const label of ['审题与组织思路','可迁移表达','常见错误','自我评价清单','练习与保存说明','计词方法：','未配置自动批改服务'])assert(!examPage.includes(label),label);
for(const id of ['timer','start-timer','pause-timer','reset-timer','writing-editor','word-count','writing-complete','snapshot'])assert(examPage.includes(`id="${id}"`),id);
assert(source.includes('mountWritingSubmission(editor,q,account'));
assert(source.includes("e.questionId===id"));assert(examPage.includes('official-exam-document'));assert(examPage.includes('esc(q.prompt)'));
assert(source.includes("document.querySelector('#start-timer').onclick"));assert(source.includes("document.querySelector('#pause-timer').onclick"));
console.log('Concise exam pages retain prompts, official source documents, timer controls, drafts, word count, completion and submission; redundant guidance is absent.');
