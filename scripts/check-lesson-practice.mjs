import fs from 'node:fs';
import {buildLessonFlow} from '../lesson-flow.js';
import assert from 'node:assert/strict';
import {buildPracticeCatalogue,pronunciationHomes} from '../lesson-practice.js';
const materials=JSON.parse(fs.readFileSync('src/data/materials.json','utf8'));
const courses=JSON.parse(fs.readFileSync('src/data/courses.json','utf8'));
const units=materials.filter(m=>!m.id.startsWith('grammar-sounds-'));
const pool=buildPracticeCatalogue(courses,materials),ids=new Set(),prompts=new Map();
const normalize=prompt=>prompt.normalize('NFKC').replace(/[’‘]/gu,"'").replace(/\s+/gu,' ').trim().toLowerCase();
for(const course of courses)assert(units.some(m=>m.id===course.practiceUnit),`${course.id}: explicit visible practice home`);
for(const q of pool){
 assert(!ids.has(q.id),`${q.id}: duplicate ID`);ids.add(q.id);
 assert(units.some(m=>m.id===q.course.id),`${q.id}: visible lesson home`);
 const prompt=normalize(q.prompt);assert(!prompts.has(prompt),`${q.id}: repeated prompt from ${prompts.get(prompt)}`);prompts.set(prompt,q.id);
 assert(q.answers?.length&&q.explanation&&q.pitfall&&q.prompt,`${q.id}: complete question`);
 if(q.options){assert.equal(new Set(q.options).size,q.options.length,`${q.id}: distinct choices`);assert(q.answers.some(a=>q.options.includes(a)),`${q.id}: answer in choices`);}
 if(q.id.includes('-practice-context-'))assert.equal(q.options.filter(o=>q.answers.includes(o)).length,1,`${q.id}: one correct choice`);
}
for(const unit of units){
 const exercises=pool.filter(q=>q.course.id===unit.id);
 assert(exercises.length>=22,`${unit.id}: at least 22 distinct exercises, got ${exercises.length}`);
 // Match the actual related-course selector used by the UI, including shared source files.
 const fallback={3:'grammar-04',10:'grammar-12',16:'grammar-09',21:'grammar-18',22:'grammar-19'};
 const related=courses.filter(c=>c.courseware?.some(b=>b.file===unit.file)||c.article?.sourceFile===unit.file||c.id===fallback[unit.lesson]);
 const selected=new Set([...related,unit,...materials.filter(m=>pronunciationHomes[m.id]===unit.id)].map(c=>c.id));
 assert.deepEqual(pool.filter(q=>selected.has(q.course.id)).map(q=>q.id),exercises.map(q=>q.id),`${unit.id}: no shared-source leakage`);
}
const allOriginal=[...courses,...materials].flatMap(c=>c.exercises||[]);
assert.equal(pool.length,allOriginal.length,'Every question remains available exactly once');
const six=pool.filter(q=>q.course.id===units[5].id),seven=pool.filter(q=>q.course.id===units[6].id);
assert(!six.some(a=>seven.some(b=>a.id===b.id||normalize(a.prompt)===normalize(b.prompt))),'Visible Units 6 and 7 share no questions');
// Unit 2 must assess the simple structures actually introduced in this lesson.
const unitTwo=pool.filter(q=>q.course.id==='lesson-03');
assert.equal(unitTwo.length,22);
assert(!unitTwo.some(q=>/cinéma|marché|Canada|France|États-Unis|boulanger/u.test(q.prompt)), 'Unit 2 does not test the prepositions taught in Unit 3');
const flowTwo=buildLessonFlow(materials.find(m=>m.id==='lesson-03'));
assert(!flowTwo.grammar.some(s=>s.title==='介词'), 'Repeated preposition teaching belongs to Unit 3');
assert(unitTwo.every(q=>q.level==='A1'),'Unit 2 remains beginner level');
for(const topic of ['stressed-pronouns','questions','present-tense','articles','elision','liaison'])
 assert(unitTwo.some(q=>q.curriculumTopic===topic),`Unit 2 covers ${topic}`);
assert(!unitTwo.some(q=>/revien|reviens|viens ___|inquiète|la poste et le café|la chaise|la table/u.test(q.prompt)),
 'Unit 2 does not assess untaught source-country contractions, advanced questions or spatial vocabulary');
const ui=fs.readFileSync('app.js','utf8');
assert(ui.includes('return buildPracticeCatalogue(courses,materials)'));
assert(ui.includes("if(c.practiceUnit)return material(c.practiceUnit)"),'Legacy course links lead to the question home');
assert(ui.includes('${foundationUnits().map(c=>`<option value='),'Practice filters use visible units');
console.log(`${units.length} units audited; ${pool.length} questions each have one home, zero repeated prompts, no shared-source leakage, at least 22 questions per unit; IDs preserved.`);
