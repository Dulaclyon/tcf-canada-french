export function writingStatus(draft){return draft?.completed===true?'completed':draft?.text?.trim()?'in-progress':'not-started';}
export function writingSummary(questions,drafts){
 const counts={completed:0,'in-progress':0,'not-started':0};
 for(const q of questions)counts[writingStatus(drafts[q.id])]++;
 return {...counts,total:questions.length,percent:questions.length?Math.round(counts.completed/questions.length*100):0};
}
export function renderWritingProgress(questions,drafts,task){
 const total=writingSummary(questions,drafts),group=writingSummary(questions.filter(q=>Number(q.task)===Number(task)),drafts);
 return `<section class="card writing-progress" aria-label="写作进度"><div class="section-head"><h2>写作进度</h2><strong>${total.percent}%</strong></div><progress aria-label="写作总体完成进度" max="${total.total||1}" value="${total.completed}"></progress><p>已完成 ${total.completed} / ${total.total} 题</p><div class="writing-states"><span>未开始 ${total['not-started']}</span><span>进行中 ${total['in-progress']}</span><span>已完成 ${total.completed}</span></div><p class="muted">任务 ${Number(task)} · 已完成 ${group.completed} / ${group.total} 题</p><progress aria-label="当前写作任务完成进度" max="${group.total||1}" value="${group.completed}"></progress></section>`;
}
