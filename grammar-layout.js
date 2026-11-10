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
const conjugationStart = /^(?:([\p{L}]+)\s*(?::|→)\s*)?((?:que\s+)?(?:je\s|j[’']).*)$/iu;
const conjugationForm = /^(?:que\s+|qu[’'])?(?:je\s|j[’']|tu\s|ils?\b|elles?\b|nous\s|vous\s)/iu;

function inlineConjugation(lines, start) {
  const first = lines[start].match(conjugationStart);
  if (!first) return null;

  for (let length = 1; length <= 8 && start + length <= lines.length; length++) {
    const text = [first[2], ...lines.slice(start + 1, start + length)].join(' ');
    const forms = text.split(/[,;，；]/u).map(form => form.trim()).filter(Boolean);
    const namedSubjunctive = first[1] && /^que\s/iu.test(first[2]);
    if (forms.length < (namedSubjunctive ? 3 : 5) || !/^\s*(?:que\s+)?tu\s/iu.test(forms[1]) || !forms.every(form => conjugationForm.test(form))) continue;
    if (!namedSubjunctive && !forms.some(form => /^(?:que\s+)?vous\s/iu.test(form))) continue;
    const next = lines[start + length];
    if (next && !/[.!?]$/u.test(text) && (/[,;，；]$/u.test(text) || /(?:vous|ils\/elles)\s*$/iu.test(text))) continue;
    const heading = first[1] ? `<h3>${escape(first[1] === 'Etre' ? 'Être' : first[1])}</h3>` : '';
    const slots = [/^j(?:e\s|[’'])/iu, /^tu\s/iu, /^(?:il|elle)\b/iu,
      /^nous\s/iu, /^vous\s/iu, /^(?:ils|elles)\b/iu];
    const groups = slots.map(slot => forms.filter(form => slot.test(form.replace(/^(?:que\s+|qu[’'])/iu, ''))));
    const columns = ['单数', '复数'].map((label, column) => {
      const cells = groups.slice(column * 3, column * 3 + 3).map(group =>
        `<li>${group.length ? group.map(form => `<span lang="fr">${escape(form)}</span>`).join(' · ') : '—'}</li>`
      ).join('');
      return `<h4 lang="zh-CN">${label}</h4><ol>${cells}</ol>`;
    }).join('');
    return { length, html: `<section class="conjugation-card" lang="fr">${heading}<div class="conjugation-columns">${columns}</div></section>` };
  }
  return null;
}

function articleTables(text) {
  const sections = text.replace(/^冠词\s*\n/u, '').split(/部分冠词\s*[-－]\s*一些/u);
  const contractionText = sections[0].replace(/^缩合冠词\s*/u, '').replace(/\n/g, ' ').replace(/他\s+们/gu, '他们');
  const contractions = [...contractionText.matchAll(/(à|de)\s*\+\s*(le|les)\s+(au|aux|du|des)\s*-\s*(.*?)(?=(?:à|de)\s*\+|$)/gu)];
  if (contractions.length !== 4 || sections.length !== 2) return '';
  const splitGloss = value => {
    const match = value.trim().match(/^([^\u3400-\u9fff]*)(.*)$/u);
    return [match[1].trim(), match[2].trim()];
  };
  const rules = [], examples = [];
  for (const line of sections[1].split('\n').map(line=>line.trim()).filter(Boolean)) {
    const rule = line.match(/^(des|du|de la|de l')\s*\+?\s*(.*)$/u);
    if (rule) rules.push([rule[1] + (line.includes('+') ? ' +' : ''), rule[2]]);
    else examples.push(splitGloss(line));
  }
  return '<div class="grammar-content article-reference"><section class="article-rule-card"><h3 class="grammar-subhead">01 · 缩合冠词</h3>' +
    table(['组合', '缩合形式', '例句', '中文释义'], contractions.map(([,prep,article,result,example])=>[prep+' + '+article,result,...splitGloss(example)])) +
    '</section><section class="article-rule-card"><h3 class="grammar-subhead">02 · 部分冠词 · 一些</h3>' + table(['冠词', '用法'], rules) +
    '<h4 class="article-examples-heading">部分冠词例句</h4>' + table(['法语', '中文释义'], examples) + '</section></div>';
}

function vowelGroups(text) {
  const lines = text.split('\n').map(line=>line.trim()).filter(Boolean);
  const first = lines.findIndex(line=>line.startsWith('eau / au / aux'));
  const second = lines.findIndex(line=>line.startsWith('u / eux'));
  if (first < 0 || second < 0) return '';
  const exampleRows = group => group.map(line => {
    const match = line.match(/^(.+?)\s*→\s*(\[[^\]]+\])\s*(.*)$/u);
    return match ? [match[1], match[2], match[3].replace(/^→\s*/u, '')] : [line, '', ''];
  });
  return '<div class="grammar-content article-reference">' +
    '<section class="article-rule-card"><h3 class="grammar-subhead">01 · eau / au / aux → [o]</h3>' +
    '<p class="grammar-rule">这三种拼写在本组例词中均读 [o]。</p>' +
    table(['单词', '音标', '释义'], exampleRows(lines.slice(first+1, second))) +
    '</section><section class="article-rule-card"><h3 class="grammar-subhead">02 · eu → [ø]</h3>' +
    '<p class="grammar-rule">以下例词中的 eu 均读 [ø]。eu、œu 在其他词中也可读 [œ]，如 sœur [sœʁ]（姐妹）。单独的 u 通常读 [y]。</p>' +
    table(['单词', '音标', '释义'], exampleRows(lines.slice(second+1))) +
    '<details class="quiet-details"><summary>原课件记法</summary><p>' +
    escape(lines.slice(0,first+1).join(' ')) + '</p><p>' + escape(lines[second]) +
    '</p></details></section></div>';
}

function relativePronounGroups(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const groups = ['ce qui', 'ce que', 'ce dont'];
  const positions = groups.map(label => lines.indexOf(label));
  if (positions.some(index => index < 0)) return '';
  const introductions = [
    '在从句中作主语，后面的动词可带宾语或间接宾语。',
    '在从句中作直接宾语，从句另有自己的主语。',
    '替代与 de 搭配的补语，先确认原搭配是否需要 de。'
  ];
  let result = '<div class="grammar-content article-reference relative-reference"><p class="grammar-rule">先行词不明确，或指代前面整件事时，可使用 ce qui, ce que, ce dont。选择取决于它在从句中的作用。</p>';
  groups.forEach((label, index) => {
    const block = lines.slice(positions[index] + 1, positions[index + 1] ?? lines.length);
    const rule = block.shift();
    const pairs = [];
    const examples = [];
    for (let i = 0; i < block.length; i++) {
      const line = block[i];
      if (line.includes('→')) {
        pairs.push(line.split(/\s*→\s*/u));
        continue;
      }
      const pair = line.match(/^([^\u3400-\u9fff]+?)\s*([\u3400-\u9fff].*)$/u);
      if (!pair) continue;
      let translation = pair[2];
      while (i + 1 < block.length && /^[\u3400-\u9fff，。！？、]+$/u.test(block[i + 1])) {
        translation += block[++i];
      }
      examples.push([pair[1].trim(), translation]);
    }
    result += '<section class="article-rule-card"><h3 class="grammar-subhead">' +
      String(index + 1).padStart(2, '0') + ' · ' + escape(label) + '</h3>' +
      '<p class="grammar-rule">' + escape(rule) + '</p><p class="grammar-rule">' +
      escape(introductions[index]) + '</p>' +
      (pairs.length ? table(['原搭配', '替换后的结构'], pairs) : '') +
      table(['法语例句', '中文释义'], examples) + '</section>';
  });
  return result + '</div>';
}

// Recover logical lines from PDF wraps before assigning semantic layouts.
function reflowSourceLines(text) {
  const lines = text.split('\n').map(line => line.trim());
  const boundary = /^(?:[•·]|\d+[.、)]|Step \d|Subtopic|Main Topic|conjugation$|example$|[\u3400-\u9fff]{2,14}[：:]?$)/u;
  const entry = /^(?:[^\s（(]{1,28}\s*[（(]|[^→←]+\s[→←–—]\s|[^:：]{1,18}[:：])/u;
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i], next = lines[i + 1];
    if (!current || !next) continue;
    const translation = /^[（(][^A-Za-zÀ-ÿ]*[\u3400-\u9fff][^A-Za-zÀ-ÿ]*[）)]$/u.test(next);
    const chineseTail = /[\u3400-\u9fff]$/u.test(current) &&
      /^[\u3400-\u9fff]/u.test(next) && !boundary.test(current) &&
      (next.length <= 16 || /^[\u3400-\u9fff，。！？、]+[。！？]$/u.test(next));
    const frenchTail = /[A-Za-zÀ-ÿ]/u.test(current) && !/[\u3400-\u9fff]/u.test(current) &&
      !/[.!?。？！;；:：]$/u.test(current) && /^[a-zà-ÿ]/u.test(next) &&
      !boundary.test(current) && !boundary.test(next) && !entry.test(next) &&
      !subject.test(next) && !/[→←]/u.test(current + next) &&
      !/^[-–—]/u.test(next) && !/^\[.+\]$/u.test(current);
    const mixedTail = /[A-Za-zÀ-ÿ]/u.test(current) &&
      /[\u3400-\u9fff]/u.test(current) && !/[。！？;；:：）)]$/u.test(current) &&
      /^[\u3400-\u9fff]/u.test(next) && !boundary.test(next) &&
      (next.length <= 22 || /^[的在和，]/u.test(next));
    if (translation || chineseTail || frenchTail || mixedTail) {
      const space = chineseTail || (/[\u3400-\u9fff]$/u.test(current) && /^[\u3400-\u9fff]/u.test(next)) ? '' : ' ';
      lines.splice(i, 2, current + space + next);
      i--;
    }
  }
  return lines;
}

export function renderGrammar(text, title = '') {
  if (/^ce qui, ce que, ce dont\s*\n/u.test(String(text))) {
    const organized = relativePronounGroups(text);
    if (organized) return organized;
  }
  if (title === '发音' && text.includes('eau / au / aux') && text.includes('u / eux')) {
    return vowelGroups(text);
  }
  if (title === '冠词' && /缩合冠词/u.test(text)) {
    const organized = articleTables(text);
    if (organized) return organized;
  }
  const lines = reflowSourceLines(String(text ?? '')).map(s=>s.replace(/^[•·]\s*/u,'')).flatMap(s=>s.replace(/([\u3400-\u9fff])\s+(?=(?:Je|J[’']|Tu|Il|Elle|Nous|Vous|Ils|Elles)\b)/gu,'$1\n').split('\n')).filter(Boolean);
  if (lines[0] === title.trim()) lines.shift();
  if (title === '发音' && /^Phonics?\s+发音/iu.test(lines[0] ?? '')) lines.shift();
  // Rejoin adjacent PDF lines when the second line closes a parenthetical.
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const open = line.match(/[（(][^()（）]*$/u);
    if (!open || !/^[^()（）]*[）)]/u.test(next)) continue;
    const space = /[\u3400-\u9fff]$/u.test(line) && /^[\u3400-\u9fff]/u.test(next) ? '' : ' ';
    lines.splice(i, 2, line + space + next);
    i--;
  }
  // A dash-delimited glossary entry starts a new row, even without spaces around the dashes.
  const glossaryEntry = /^(.+?)\s*-{2,}\s*(.+)$/u;
  // Rejoin PDF wraps inside a transformation so an infinitive is not detached from its phrase.
  for(let n=0;n<lines.length-1;n++) {
    if(!glossaryEntry.test(lines[n+1])&&!/→/u.test(lines[n+1])&&!conjugationStart.test(lines[n+1])&&/→|-{3,}/u.test(lines[n])&&!/[.;!?]$/u.test(lines[n])&&/^[a-zà-ÿ]/u.test(lines[n+1])&&!/^(?:je |j[’']|tu |il |elle |nous |vous |ils |elles )/iu.test(lines[n+1])) {lines[n]+=' '+lines[n+1];lines.splice(n+1,1);n--;}
  }
  const output = [];
  let groupOpen = false;
  const prose = /短文|对话|课文|应用/u.test(title) && !/变位|规则/u.test(title);
  for (let i=0; i<lines.length; i++) {
    const line = lines[i];
    const subheading = /^(?:发音部分|主格&宾格|疑问词|动词&变位复习|形容词总结|拼读|结构|用法|常用时间状语|房间|称呼|例子|conjugation|example|总结[：:]?|尝试一下[：:]?|表示同时性[：:]?|表示原因[：:]?|表示方式\/手段[：:]?|avoir besoin de|faire attention à|se mettre à|être obligé\(e\) de|avoir envie de|s’occuper de|avoir l’habitude de|prendre soin de|être fier \/ fière de)$/u.test(line);
    if (subheading) {
      if (groupOpen) output.push('</section>');
      const label = ({conjugation:'动词变位 · conjugation',example:'例句 · example'})[line] ?? line;
      output.push('<section class="grammar-group"><h3 class="grammar-subhead">' + escape(label) + '</h3>');
      groupOpen = true;
      continue;
    }
    const labelledWord = value => value?.match(/^([\u3400-\u9fff][^：:]{0,16})([：:])\s*([A-Za-zÀ-ÿ].*)$/u);
    const glossedWord = value => value?.match(/^([^（(。！？!?]+?)([（(][^()（）]*[\u3400-\u9fff][^()（）]*[）)])\s*$/u);
    if (labelledWord(line) && labelledWord(lines[i + 1])) {
      const rows = [];
      while (labelledWord(lines[i])) {
        const [,meaning,delimiter,word] = labelledWord(lines[i++]);
        rows.push([meaning+delimiter,word]);
      }
      output.push(table(['中文含义','法语表达'], rows));
      i--;
      continue;
    }
    if (glossedWord(line) && glossedWord(lines[i + 1]) && !/^\d/u.test(line)) {
      const rows = [];
      while (glossedWord(lines[i]) && !/^\d/u.test(lines[i])) {
        const [,word,meaning] = glossedWord(lines[i++]);
        rows.push([word.trim(),meaning]);
      }
      output.push(table(['（词语）','（中文释义）'], rows));
      i--;
      continue;
    }
    const soundRules = [
      ['et 在单字末尾', '词尾 -et、ai、è、ê、ei', '[ɛ]', '本组例词读 [ɛ]，ai 的读音随单词变化。'],
      ['i, î, y', 'i、î、y', '[i]', '本组例词读 [i]。'],
      ['oi', 'oi', '[wa]', '本组 moi、toi、loi 等词中的 oi 均读 [wa]。'],
      ['tion 的发音', '-tion', '[sjɔ̃]', '本组例词的词尾均读 [sjɔ̃]。'],
      ['发音部分 in, im', 'in、im、ain、aim、ein、yn、ym', '[ɛ̃]', '本组例词中均表示鼻元音 [ɛ̃]，n、m 不单独发音。'],
      ['eau / au / aux', 'eau、au、aux', '[o]', '本组例词中均读 [o]。'],
      ['u / eux', 'eu、œu', '[ø] / [œ]', 'feu、peu、eux、heureux 中读 [ø]，sœur 中读 [œ]。单独的 u 通常读 [y]。'],
      ['[j]', 'i / y + 元音、部分 -il / -ill', '[j]', '本组例词含半元音 [j]，接近英语 yes 的开头。-ill 有例外，如 ville。'],
      ['ou', 'ou', '[u]', '本组例词中的 ou 均读 [u]。']
    ];
    const soundRule = soundRules.find(([start]) => line === start || (start.length > 2 && line.startsWith(start)));
    if (soundRule) {
      output.push('<section class="sound-rule"><h3 class="grammar-subhead">拼写与发音</h3>' +
        table(['拼写组合', '音标', '适用说明'], [soundRule.slice(1)]) + '</section>');
    }
    if (/^(?:phonics|发音)$/iu.test(title) && /^é;\s*单词末尾的\s*es;\s*ez;\s*er$/u.test(line)) {
      output.push('<section class="sound-rule"><h3 class="grammar-subhead">相同发音 [e]</h3>' +
        '<p class="grammar-rule">本组例词中的 é，以及词尾 es、ez、er，均读作 [e]。</p>' +
        '<p class="grammar-rule">词尾 es 读 [e] 的例子有 mes、tes、ses、les。其他单词的词尾 es 常不发音，词尾 er 也有例外。</p>' +
        '<details class="quiet-details"><summary>原课件记法</summary><p>' + inline(line, title) + '</p></details></section>');
      continue;
    }
    const soundPair = value => value?.match(/^([^（(]+)([（(][^）)]+[）)])\s*[-–—]\s*([^（(]+)([（(][^）)]+[）)])$/u);
    if (/^(?:phonics|发音)$/iu.test(title) && soundPair(lines[i + 1])) {
      const rows = [];
      let pair;
      while ((pair = soundPair(lines[i + 1]))) {
        rows.push(pair.slice(1).map(cell => cell.trim()));
        i++;
      }
      output.push('<section class="vocabulary-reference sound-reference"><h3 class="grammar-subhead">' +
        escape(line) + ' · 成对例词</h3>' +
        table(['单词一', '释义', '单词二', '释义'], rows) + '</section>');
      continue;
    }
    const vocabularyRow = value => value?.match(/^(\d+[.]\s*[^（(]+)([（(][^）)]+[）)])(.*)$/u);
    if (vocabularyRow(line) && vocabularyRow(lines[i + 1])) {
      const rows = [];
      while (vocabularyRow(lines[i])) {
        const [,word,meaning,phrase] = vocabularyRow(lines[i]);
        rows.push([word.trim(), meaning, phrase.trim()]);
        i++;
      }
      output.push('<section class="vocabulary-reference"><h3 class="grammar-subhead">例词与短语</h3>' +
        table(['单词', '释义', '短语 / 备注'], rows) + '</section>');
      i--;
      continue;
    }
    if (/^\d+[.、]\s*[\u3400-\u9fff]/u.test(line) &&
        [lines[i - 1], lines[i + 1]].some(neighbor => /^\d+[.、]\s*[\u3400-\u9fff]/u.test(neighbor ?? ''))) {
      output.push(`<p class="grammar-step">${inline(line, title)}</p>`);
      continue;
    }
    if (glossaryEntry.test(line) && !/[.!?;]/u.test(line.split(/-{2,}/u)[0]) && glossaryEntry.test(lines[i + 1] ?? '')) {
      const rows = [];
      let entry;
      while ((entry = (lines[i] ?? '').match(glossaryEntry))) {
        let translation = entry[2];
        if (/^do you have$/iu.test(translation) && /^the time\?$/iu.test(lines[i + 1] ?? '')) {
          translation += ' ' + lines[++i];
        }
        rows.push([entry[1], translation]);
        i++;
      }
      output.push(table(['（法语 / 原结构）', '（释义 / 对应形式）'], rows));
      i--;
      continue;
    }
    if ((line.match(/\b\d+\b/gu) ?? []).length >= 4) {
      let end = i + 1;
      while (end < lines.length && /\d/u.test(lines[end]) && /^[\p{L}\d]/u.test(lines[end])) end++;
      const numberText = lines.slice(i, end).join(' ').replace(/-\s+(?=\p{L})/gu, '-');
      const pairs = [...numberText.matchAll(/([\p{L}-]+(?:\s+[\p{L}-]+)*)\s+(\d+)\s*[,;]?\s*/gu)];
      if (pairs.length >= 4 && pairs.map(pair => pair[0]).join('') === numberText) {
        output.push(`<dl class="grammar-number-grid">${pairs.map(([,word,number]) =>
          `<div><dt lang="fr">${escape(word)}</dt><dd>${escape(number)}</dd></div>`
        ).join('')}</dl>`);
        i = end - 1;
        continue;
      }
    }
    if (line === '问时间' || /^numbers\s*[（(]?数字[）)]?$/iu.test(line)) {
      output.push(`<h3 class="grammar-topic-term">${inline(line, title)}</h3>`);
      continue;
    }
    const question = line.match(/^(.+?\?)\s*(?:-{2,}\s*)?(.*)$/u);
    const answer = /^(?:Oui\b|Non\b|Il est\b)/iu;
    if (question && (answer.test(question[2]) || (!question[2] && answer.test(lines[i + 1] ?? '')))) {
      const reply = question[2] || lines[++i];
      output.push(`<div class="grammar-question-pair" lang="fr"><p>${inline(question[1], title)}</p><p>${inline(reply, title)}</p></div>`);
      continue;
    }
    const conjugation = inlineConjugation(lines, i);
    if (conjugation) {
      output.push(conjugation.html);
      i += conjugation.length - 1;
      continue;
    }
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
    if(/^(?:[•·]\s*)?.+\s(?:→|←|–|—|-)\s.+/u.test(line)&&!/[.!?]\s*→/u.test(line)&&line.length<130) {
      const rows=[];let j=i;
      while(j<lines.length) {
        const m=lines[j].match(/^(?:[•·]\s*)?(.+?)\s(?:→|←|–|—|-)\s(.+)$/u);
        if(!m||lines[j].length>=130)break;
        rows.push([m[1],m[2]]);j++;
      }
      if(rows.length){output.push(table(['（词语 / 原结构）','（释义 / 对应形式）'], rows));i=j-1;continue;}
    }
    if ((line.includes('→')||/-{3,}/u.test(line))&&/[A-Za-zÀ-ÿ]/u.test(line)) {output.push(transform(line,title));continue;}
    // Join only PDF soft-wrapped prose; stop at source headings, arrows, or complete sentences.
    if(prose && !chinese.test(line) && !/^(?:[•\d]|[A-Za-zÀ-ÿ]+\s*:)/u.test(line) && !/→/.test(line)) {
      let paragraph=line;
      while(!/[.!?…]$/.test(paragraph)&&i+1<lines.length&&!chinese.test(lines[i+1])&&!/→|^-|^\d/u.test(lines[i+1])) paragraph+=' '+lines[++i];
      output.push(`<p class="grammar-prose" lang="fr">${inline(paragraph,title)}</p>`);continue;
    }
    const preposition = /介词|préposition/iu.test(title) &&
      line.match(/^(à(?= 加地点)|avec|dans|chez)(?:\s+|$)(.*)$/u);
    if (preposition) {
      output.push(`<h3 class="grammar-topic-term" lang="fr">${escape(preposition[1])}</h3>`);
      if (preposition[2]) output.push(`<p class="grammar-rule">${inline(preposition[2], title)}</p>`);
      continue;
    }
    const bilingual = line.match(/^([^\u3400-\u9fff（(]+?)\s*([\u3400-\u9fff].*)$/u);
    if (bilingual && /^[\p{L}]/u.test(bilingual[1])) {
      const sentence = subject.test(bilingual[1]) || /[.!?]/u.test(bilingual[1]);
      output.push(`<div class="grammar-bilingual${sentence ? ' grammar-sentence' : ''}"><p lang="fr">${inline(bilingual[1], title)}</p><p lang="zh-CN">${inline(bilingual[2], title)}</p></div>`);
      continue;
    }
    if(chinese.test(line) && (line.match(/[\u3400-\u9fff]/gu)||[]).length>line.length*.48) {
      output.push(`<p class="grammar-rule">${inline(line,title)}</p>`);continue;
    }
    if(subject.test(line)||/^(?:C[’']est|Ce sont|Si |Est-ce|Nous |Vous |Ils |Elles |Il |Elle |Je |Tu )/u.test(line)) {output.push(example(line,title));continue;}
    if(line.length<75&&!/[.;!?。？！]$/u.test(line)&&chinese.test(line)) {output.push(`<h3 class="grammar-subhead">${inline(line,title)}</h3>`);continue;}
    output.push(`<p class="grammar-line" lang="fr">${inline(line,title)}</p>`);
  }
  if (groupOpen) output.push('</section>');
  return `<div class="grammar-content">${output.join('')}</div>`;
}

// Preserve existing parentheticals and mark unbracketed Chinese glosses in reading text.
function markReadingGlosses(text) {
  return text.replace(
    /\([^()（）]*\)|（[^()（）]*）|[\u3400-\u9fff][\u3400-\u9fff，。；：！？、…“”《》]*(?:(?:[ \t]+|[ \t]*\.{2,}[ \t]*)[\u3400-\u9fff][\u3400-\u9fff，。；：！？、…“”《》]*)*/gu,
    part=>/^[（(]/u.test(part)?part:`（${part}）`
  );
}

export const isReadingLabel = line => /^(?:对话(?:部分)?|短文|短文\s*[&＆]\s*对话|课文|(?:4\.\s*)?应用|Main Topic 2)[：:]?$/u.test(line.trim());

// Reading passages use paragraph flow, not the source PDF's physical line lengths.
// Editorial corrections for Chinese reading notes. Keep the imported PDF text intact.
const readingCorrections = [
  ['在...家里', '在……家里'],
  ['我在我家。', '我在家。'],
  ['和.... 一起', '和……一起'],
  ['vous 除了表示你们，还可以表示您', 'vous 可以指“你们”，也可礼貌地称呼一个人，译为“您”。'],
  ['se dépêcher 赶快、加快速度', 'se dépêcher 赶紧、抓紧时间'],
  ['Julie 很享受', '朱莉很喜欢'],
  ['Julie 脸红', '朱莉脸红了'],
  ['Paul 跳了起来', '保罗跳了起来'],
  ['她在心里成长', '她内心成熟了不少'],
  ['没有巴黎那么游客泛滥', '没有巴黎那么多游客'],
  ['它的老城和巴黎一样美', '里昂老城和巴黎老城一样美'],
  ['里昂菜是法国最好吃的', '里昂菜是法国最好吃的菜'],
  ['我赶火车迟到了。', '我赶火车快迟到了。'],
  ['我在想我的下一个计划。', '我在想接下来的计划。'],
  ['我想起我有个约会。', '我想起自己还有个约。'],
  ['我利用这个时间回复邮件。', '我趁这段时间回复了邮件。'],
  ['避免晚出发。', '别出发太晚。'],
  ['un professeur 教授', 'un professeur 教师（大学语境中可指教授）'],
  ['我们明天要参加一个会议。', '我们明天要参加一场会议。'],
  ['她努力学习以通过考试', '她努力学习，争取通过考试。'],
  ['我确信他说的是真的', '我确信他说的是实话。'],
  ['她觉得她哥哥很丢脸。', '她为自己的兄弟感到羞愧。'],
  ['我害怕/不好意思在公众面前讲话。', '我不好意思当众讲话。'],
  ['不耐心的做什么事\n情， faire qch qvec patience 耐心做什么事\n情， patient adj 耐心的， impatient adj 不耐\n心的',
    '急切地做某事，也可指不耐烦地做某事。faire qch avec patience 耐心地做某事。patient adj. 有耐心的，impatient adj. 不耐烦的或急切的'],
  ['忘记干什么事情', '忘了做某事'],
  ['必须整个团队一起工作', '整个团队必须一起工作'],
  ['希望每个人都提出想法', '希望每个人都提出自己的想法'],
  ['想要我们表现出团结', '希望我们团结起来'],
  ['我们必须集中在唯一目标上', '我们必须专注于一个目标'],
  ['达到真正的合作', '实现真正的合作'],
];

export function polishReadingChinese(text) {
  return readingCorrections.reduce((result, [original, revised]) => result.replaceAll(original, revised), text);
}

export function renderArticle(text) {
  const lines=reflowSourceLines(polishReadingChinese(String(text??'')).replace(/（下次）/gu,'').replace(/（下次[：:]\s*/gu,'（'));
  const output=[],notes=[];
  const noteLabel=/^(?:第[一二三]类动词|代动词|动词短语|名词|动词|形容词|副词(?:短语)?|介词短语|表达|搭配|问时间|充满)[：:]?$/u;let paragraph='',dialogue=false,hasDialogue=false;
  const flushNotes=()=>{
    if(!notes.length)return;
    output.push(`<section class="article-notes"><h3 lang="zh-CN">词汇与句型备注</h3>${renderGrammar(notes.map(line=>noteLabel.test(line)?line:markReadingGlosses(line)).join('\n'))}</section>`);
    notes.length=0;
  };
  const flush=()=> {
    if(!paragraph)return;
    let body=inline(markReadingGlosses(paragraph),'');
    if(dialogue&&!/^[—–-]/u.test(paragraph))body=body.replace(/^([^:：]+?)\s*[:：]\s*/u,'<strong class="article-speaker">$1 :</strong> ');
    output.push(`<p class="article-paragraph${dialogue?' article-dialogue':''}" lang="fr">${body}</p>`);
    paragraph='';
    dialogue=false;
  };
  const speaker=/^(?:[—–-]\s|[A-ZÀ-Ÿ][\p{L}’' -]{0,28}\s*[:：])/u;
  const transition=/^(?:Le lendemain|Le soir|L’après-midi|L'après-midi|En arrivant|Un peu plus tard|Finalement|À la gare|Quand |L’année|L'année)/u;
  for(let i=0;i<lines.length;i++) {
    const line=lines[i];if(!line){if(!notes.length)flush();continue;}
    if(isReadingLabel(line)){flush();flushNotes();continue;}
    const noteHeading=/^(?:第一类动词$|充满$|Phonic 发音|rencontrer un professeur$|il faut que toute l’équipe travaille ensemble$|动词短语[：:]?|名词[：:]?|动词[：:]?|形容词[：:]?|副词[：:]?|介词短语[：:]?|表达[：:]?|搭配[：:]?|Adjectives:|Nouns:|Verbs:|others:|[1-5]\.\s*(?:à condition|à moins|pour que|au cas|pourvu))/u.test(line);
    const heading=(!output.length&&!paragraph&&/^(?:Les quatre saisons en France|Un Voyage à Paris|Paris et Lyon[^.]*[?？])$/u.test(line))||/^(?:短文\d+[：:]?|[\u3400-\u9fff]{2,12}[：:]|\d+[.、]\s*[\u3400-\u9fff]{1,12})$/u.test(line);
    if(!notes.length&&heading){flush();output.push(`<h3 class="article-subtitle">${escape(line)}</h3>`);continue;}
    if(!noteHeading&&(!notes.length||hasDialogue)&&speaker.test(line)){
      flush();
      flushNotes();
      hasDialogue=dialogue=true;
      paragraph=line.replace(/(là-bas \?) là-bas$/u,'$1 （là-bas）');
      continue;
    }
    const phraseHeading=paragraph.length>100&&line.length<65&&!/[.!?;]$/u.test(line)&&/^(?:avoir |être |faire |se |s[’'])/u.test(line);
    const gloss=hasDialogue&&/^(?:\S+\s+(?:n\.[fm]|prep\.)|vous 除了|se dépêcher 赶快)/u.test(line);
    if(notes.length||noteHeading||gloss||/[→←]|\s[–—]\s|-{2,}/u.test(line)||phraseHeading){flush();notes.push(line);continue;}
    if(paragraph&&!dialogue&&/[.!?…]$/u.test(paragraph)&&(paragraph.length>550||transition.test(line)))flush();
    paragraph+=(paragraph?' ':'')+line;
  }
  flush();
  flushNotes();
  return `<div class="article-typeset">${output.join('')}</div>`;
}
