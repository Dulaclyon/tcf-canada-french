// Present original teaching text by grammatical role. The source dataset stays intact.
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chinese = /[\u3400-\u9fff]/u;
const subject = /^(?:je |j[’']|tu |il(?:\/elle(?:\/on)?)? |elle |nous |vous |ils(?:\/elles)? |elles )/iu;
function inline(text, title) {
  let html = escape(text);
  if (/être|Être/u.test(title)) html = html.replace(/(?<![\p{L}])(suis|es|est|sommes|êtes|sont)(?![\p{L}])/gu, '<mark>$1</mark>');
  return html.replace(/([\u3400-\u9fff，。；：！？、（）《》【】]+)/gu, '<span class="grammar-zh">$1</span>');
}
function example(text, title) {
  // Keep translations visually separate when the PDF puts them on the same line.
  const pair = text.match(/^(.+?)([（(][^()（）]*[\u3400-\u9fff][^()（）]*[）)])\s*$/u);
  if (pair && !chinese.test(pair[1])) return `<div class="grammar-example"><p lang="fr">${inline(pair[1], title)}</p><p class="grammar-translation" lang="zh-CN">${escape(pair[2])}</p></div>`;
  return `<div class="grammar-example"><p lang="fr">${inline(text, title)}</p></div>`;
}
function table(headers, rows, caption = '') {
  return `<div class="grammar-table-wrap"><table class="grammar-table">${caption ? `<caption>${escape(caption)}</caption>` : ''}<thead><tr>${headers.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${escape(cell)}</th>`:`<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function formula(text) {
  const pieces = text.split(/(→|\+)/u);
  return `<div class="grammar-formula" aria-label="句型结构">${pieces.map(p=>/^(→|\+)$/u.test(p)?`<span class="formula-operator">${escape(p)}</span>`:`<span class="formula-term">${escape(p)}</span>`).join('')}</div>`;
}
function transform(text, title) {
  const steps = text.split(/(?:\s*→\s*|\s*-{3,}\s*)/u).filter(Boolean);
  return `<div class="grammar-transform">${steps.map((p,i)=>`${i?'<span class="transform-arrow" aria-hidden="true">→</span>':''}<span lang="fr">${inline(p,title)}</span>`).join('')}</div>`;
}
export function renderGrammar(text, title = '') {
  const lines = String(text ?? '').split('\n').map(s=>s.trim().replace(/^[•·]\s*/u,'')).filter(Boolean);
  if (lines[0] === title.trim()) lines.shift();
  // Rejoin PDF wraps inside a transformation so an infinitive is not detached from its phrase.
  for(let n=0;n<lines.length-1;n++) {
    if(/→|-{3,}/u.test(lines[n])&&!/[.;!?]$/u.test(lines[n])&&/^[a-zà-ÿ]/u.test(lines[n+1])&&!/^(?:je |j[’']|tu |il |elle |nous |vous |ils |elles )/iu.test(lines[n+1])) {lines[n]+=' '+lines[n+1];lines.splice(n+1,1);n--;}
  }
  const output = [];
  const prose = /短文|对话|课文|应用/u.test(title) && !/变位|规则/u.test(title);
  for (let i=0; i<lines.length; i++) {
    const line = lines[i];
    // Pronoun charts: preserve the original categories instead of displaying a flat text dump.
    if (/^人称\s+单数\s+复数$/u.test(line)) {
      const rows=[];
      for(let j=i+1;j<Math.min(lines.length,i+4);j++) {
        const m=lines[j].match(/^(第[一二三]人称)\s+(.+)\s+(nous|vous|les|leur)$/u);
        if(!m) break;
        rows.push([m[1],m[2],m[3]]);
      }
      if(rows.length){output.push(table(['人称','单数','复数'],rows));i+=rows.length;continue;}
    }
    // Six-person conjugations are read down two columns: singular, then plural.
    const six=lines.slice(i,i+6);
    if(six.length===6&&six.every(s=>subject.test(s))&&/^(?:je |j[’'])/iu.test(six[0])&&/^tu /iu.test(six[1])&&/^nous /iu.test(six[3])&&/^vous /iu.test(six[4])) {
      const parsed=six.map(s=>s.match(/^((?:il\/elle\/on|ils\/elles|il\/elle|je|tu|il|elle|nous|vous|ils|elles)\s+|j[’'])(.+)$/iu));
      if(parsed.every(Boolean)){output.push(table(['Singulier','Pluriel'],[0,1,2].map(n=>[six[n],six[n+3]])));i+=5;continue;}
    }
    if (/^(?:Si\s*\+|(?:avoir|être|passé composé)\s*\+)|→.*(?:conditionnel|futur|impératif)/iu.test(line)) {output.push(formula(line));continue;}
    // Lexical lists and word families become aligned rows, rather than miniature paragraphs.
    if(/^(?:[•·]\s*)?.+\s(?:→|–|—)\s.+/u.test(line)&&!/[.!?]\s*→/u.test(line)&&line.length<130) {
      const rows=[];let j=i;
      while(j<lines.length) {
        const m=lines[j].match(/^(?:[•·]\s*)?(.+?)\s(?:→|–|—)\s(.+)$/u);
        if(!m||lines[j].length>=130)break;
        rows.push(`<div class="lexical-row"><span lang="fr">${inline(m[1],title)}</span><span>${inline(m[2],title)}</span></div>`);j++;
      }
      if(rows.length){output.push(`<div class="grammar-lexicon">${rows.join('')}</div>`);i=j-1;continue;}
    }
    if ((line.includes('→')||/-{3,}/u.test(line))&&/[A-Za-zÀ-ÿ]/u.test(line)) {output.push(transform(line,title));continue;}
    // Join only PDF soft-wrapped prose; stop at source headings, arrows, or complete sentences.
    if(prose && !chinese.test(line) && !/^(?:[•\d]|[A-Za-zÀ-ÿ]+\s*:)/u.test(line) && !/→/.test(line)) {
      let paragraph=line;
      while(!/[.!?…]$/.test(paragraph)&&i+1<lines.length&&!chinese.test(lines[i+1])&&!/→|^-|^\d/u.test(lines[i+1])) paragraph+=' '+lines[++i];
      output.push(`<p class="grammar-prose" lang="fr">${inline(paragraph,title)}</p>`);continue;
    }
    if(chinese.test(line) && (line.match(/[\u3400-\u9fff]/gu)||[]).length>line.length*.48) {
      output.push(`<p class="grammar-rule">${inline(line,title)}</p>`);continue;
    }
    if(subject.test(line)||/^(?:C[’']est|Ce sont|Si |Est-ce|Nous |Vous |Ils |Elles |Il |Elle |Je |Tu )/u.test(line)) {output.push(example(line,title));continue;}
    if(line.length<75&&!/[.;!?。？！]$/u.test(line)&&chinese.test(line)) {output.push(`<h3 class="grammar-subhead">${inline(line,title)}</h3>`);continue;}
    output.push(`<p class="grammar-line" lang="fr">${inline(line,title)}</p>`);
  }
  return `<div class="grammar-content">${output.join('')}</div>`;
}
