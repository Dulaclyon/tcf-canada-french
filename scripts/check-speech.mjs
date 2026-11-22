import assert from 'node:assert/strict';
import {speechPlan} from '../speech-segments.js';
import {correctTeachingText} from '../course-editorial.js';
const p=speechPlan(['je finirais, tu finirais; il finirait','nous finirions','vous finiriez','ils finiraient'],{conjugation:true});
assert.equal(p.segments.length,6);assert.equal(p.pause,1100);assert(p.rate>=0.75&&p.rate<0.85);assert.equal(p.segments[0],'je finirais');
assert.equal(speechPlan(['rue [ʁy]','roue [ʁu]'],{pronunciation:true}).segments[0],'rue');
assert(!correctTeachingText('记得将来时(特别是特殊的常用动词的将来时)和\nimparfait， 基本就没有问题了！！！').includes('没有问题'));
console.log('Speech checks passed: distinct conjugation segments, explicit learner pauses, natural pace and complete conditional explanation.');
