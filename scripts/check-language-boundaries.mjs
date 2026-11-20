import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {translate} from '../i18n.js';
import {recordings} from '../human-audio.js';
const hasChinese=value=>/[\u3400-\u9fff]/u.test(value);
for(const filename of ['materials','courses']){
 const rows=JSON.parse(await readFile(`src/data/${filename}.json`,'utf8'));
 for(const row of rows)assert(!hasChinese(translate(row.title,'en')),`${filename}: untranslated title ${row.title}`);
}
for(const recording of recordings)assert(!hasChinese(translate(recording.label,'en')),`Untranslated audio caption: ${recording.label}`);
for(const label of ['规则要点','形式 / 结构','用法 / 示例','真人录音','词汇与句型备注','返回课程','单项选择','主题练习']){
 assert(!hasChinese(translate(label,'en')),label);
 assert(translate(label,'zh-TW'),label);
 assert.equal(translate(label,'zh-CN'),label);
}
assert.equal(translate('原创结构片段；不是完整考试时长示范','en'),'Sample excerpt, not a full-length timed response');
assert.equal(translate('未知结构内容','en'),'未知结构内容','Do not create half-translated Chinese phrases');
assert.equal(translate('0 道待复习错题','en'),'0 mistakes to review');
assert.equal(translate('3 项收藏','en'),'3 bookmarks');
assert.equal(translate('已作答 2 / 39 题 · 答对 1 题','en'),'Answered 2 / 39 questions · 1 correct');
assert.equal(translate('Présentez-vous.','en'),'Présentez-vous.');
console.log('All lesson titles and human-audio captions covered; structural labels, dynamic counters, French preservation and phrase boundaries passed.');
