'use strict';

const select = (id) => document.getElementById(id);
const main = select('main');
const sidebar = select('sidebar');
const outline = select('outline');
const menu = select('menu-button');
const theme = select('theme-button');
const dialog = select('search-dialog');
const input = select('search-input');
const results = select('search-results');
const byId = new Map(lessons.map((chapter) => [chapter.id, chapter]));

const readKey = 'c-review-notes.read.v1';
const themeKey = 'c-review-notes.theme.v1';
const preferences = new Map();

function getPreference(key) {
  try { return preferences.get(key) ?? localStorage.getItem(key); }
  catch { return preferences.get(key) ?? null; }
}

function setPreference(key, value) {
  preferences.set(key, value);
  try { localStorage.setItem(key, value); }
  catch { /* Keep the preference for this session. */ }
}

function getProgress() {
  try {
    const values = JSON.parse(getPreference(readKey) ?? '[]');
    return new Set(Array.isArray(values) ? values.filter((id) => byId.has(id)) : []);
  } catch {
    return new Set();
  }
}

const progress = getProgress();
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function drawTheme() {
  const dark = (getPreference(themeKey) ?? (systemTheme.matches ? 'dark' : 'light')) === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  theme.setAttribute('aria-pressed', String(dark));
  theme.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
}
theme.addEventListener('click', () => {
  setPreference(themeKey, document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  drawTheme();
});
systemTheme.addEventListener('change', drawTheme);
drawTheme();

function setMenu(open) {
  sidebar.toggleAttribute('data-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '关闭章节目录' : '打开章节目录');
}
menu.addEventListener('click', () => setMenu(!sidebar.hasAttribute('data-open')));
sidebar.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.querySelector('.skip').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});

function drawSidebar(activeId) {
  const link = (id, label) => `<a href="#${id}"${id === activeId ? ' aria-current="page"' : ''}>${label}${progress.has(id) ? '<span class="state" aria-label="已复习">✓</span>' : ''}</a>`;
  sidebar.innerHTML = `<nav>${link('home', '复习首页')}
    ${lessonGroups.map((group) => `<div class="rail-label">${group.title}</div>${group.chapters.map((id) => link(id, byId.get(id).title)).join('')}`).join('')}
  </nav>`;
}

function drawOutline(chapterId, sections, active) {
  outline.innerHTML = `<div class="outline-label">本页内容</div><nav>${sections.map((item) =>
    `<a href="#${chapterId}/${item.id}"${item.id === active ? ' aria-current="location"' : ''}>${item.title}</a>`
  ).join('')}</nav>`;
}

function drawHome(activeSection) {
  const example = htmlEscape('#include <stdio.h>\n\nint main(void) {\n    puts("Hello, C!");\n    return 0;\n}');
  main.innerHTML = `
    <section class="hero">
      <div>
        <h1>C 语言复习手册</h1>
        <p>从语法和输入输出复习到指针、递归与算法。代码可以直接复制，考点可以随时自测。</p>
        <div class="hero-actions">
          <a class="button primary" href="#basics">开始复习</a>
          <a class="button" href="#exam/quiz">做期中自测</a>
        </div>
      </div>
      <div class="hero-example" aria-label="C 语言示例">
        <div class="hero-example-label">hello.c</div><pre><code>${example}</code></pre>
      </div>
    </section>
    <section class="home-section" id="chapter-list">
      <h2>章节目录</h2><p class="progress-text">已复习 ${progress.size} / ${lessons.length} 章</p>
      <div class="chapter-grid">${lessons.map((chapter) => `
        <a class="chapter-card" href="#${chapter.id}"><h3>${chapter.title}${progress.has(chapter.id) ? ' ✓' : ''}</h3><p>${chapter.summary}</p></a>
      `).join('')}</div>
    </section>
    <section class="home-section" id="quick-links">
      <h2>常查知识点</h2>
      <div class="hero-actions"><a class="button" href="#io/fgets">fgets 行边界</a><a class="button" href="#recursion/hanoi">汉诺塔演示</a><a class="button" href="#primes/goldbach">P1304 题解</a></div>
    </section>`;
  drawOutline('home', [{ id: 'chapter-list', title: '章节目录' }, { id: 'quick-links', title: '常查知识点' }], activeSection);
}

function drawChapter(chapter, activeSection) {
  const position = lessons.indexOf(chapter);
  const last = lessons[position - 1];
  const next = lessons[position + 1];

  main.innerHTML = `<article class="article">
    <div class="breadcrumb"><a href="#home">复习首页</a> / ${chapter.title}</div>
    <h1>${chapter.title}</h1><p class="lede">${chapter.summary}</p>
    <div class="article-body">${chapter.sections.map((item) => `<section id="${item.id}"><h2>${item.title}</h2>${item.body}</section>`).join('')}</div>
    <div class="article-footer">
      ${last ? `<a href="#${last.id}">上一篇 · ${last.title}</a>` : '<a href="#home">返回首页</a>'}
      <button class="button" type="button" id="mark-complete"></button>
      ${next ? `<a href="#${next.id}">下一篇 · ${next.title}</a>` : ''}
    </div>
  </article>`;

  const mark = select('mark-complete');
  function showProgress() {
    const completed = progress.has(chapter.id);
    mark.textContent = completed ? '已复习 ✓' : '标记为已复习';
    mark.setAttribute('aria-pressed', String(completed));
  }
  mark.addEventListener('click', () => {
    if (progress.has(chapter.id)) progress.delete(chapter.id);
    else progress.add(chapter.id);
    setPreference(readKey, JSON.stringify([...progress]));
    showProgress();
    drawSidebar(chapter.id);
  });
  showProgress();
  drawOutline(chapter.id, chapter.sections, activeSection);
  if (chapter.id === 'recursion') mountHanoi();
  if (chapter.id === 'exam') mountQuiz();
}

function drawRoute() {
  const [id, section] = location.hash.slice(1).split('/');
  const chapter = byId.get(id);
  const active = chapter?.id ?? 'home';
  document.title = chapter ? chapter.title + ' · C 语言复习手册' : 'C 语言复习手册';
  drawSidebar(active);
  if (chapter) drawChapter(chapter, section);
  else drawHome(section);
  setMenu(false);
  const destination = section && select(section);
  if (destination && main.contains(destination)) destination.scrollIntoView();
  else window.scrollTo(0, 0);
}

main.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-code');
  if (!button) return;
  const source = button.closest('.code-block').querySelector('code');
  try {
    await navigator.clipboard.writeText(source.textContent);
    button.textContent = '已复制';
  } catch {
    const selection = getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = '已选中代码';
  }
  setTimeout(() => { button.textContent = '复制'; }, 1600);
});

function mountHanoi() {
  const demo = select('hanoi-demo');
  const moves = [];
  function buildMoves(n, from, spare, to) {
    if (n === 0) return;
    buildMoves(n - 1, from, to, spare);
    moves.push({ disk: n, from, to });
    buildMoves(n - 1, spare, from, to);
  }
  buildMoves(3, 'A', 'B', 'C');

  const states = [{ A: [3, 2, 1], B: [], C: [] }];
  for (const move of moves) {
    const prior = states.at(-1);
    const following = { A: [...prior.A], B: [...prior.B], C: [...prior.C] };
    following[move.to].push(following[move.from].pop());
    states.push(following);
  }

  demo.innerHTML = `<div class="hanoi-status" aria-live="polite"></div><div class="pegs"></div>
    <div class="hanoi-actions"><button class="button" type="button">上一步</button><button class="button primary" type="button">下一步</button></div>`;
  const status = demo.querySelector('.hanoi-status');
  const board = demo.querySelector('.pegs');
  const [previous, next] = demo.querySelectorAll('button');
  let step = 0;

  function draw() {
    const move = moves[step - 1];
    const state = states[step];
    const stage = step < 4 ? '两小盘移到 B' : step === 4 ? '最大盘移到 C' : '两小盘移到 C';
    status.textContent = move
      ? `第 ${step} / 7 步 · ${stage} · 盘 ${move.disk} 从 ${move.from} 到 ${move.to}`
      : '第 0 / 7 步 · 三个盘都在 A';
    board.innerHTML = ['A', 'B', 'C'].map((peg) => `<div role="img" aria-label="柱 ${peg}${state[peg].length ? '，自底向上为 ' + state[peg].join('、') + ' 号盘' : ' 为空'}">
      <div class="peg-stack" aria-hidden="true">${state[peg].map((disk) => `<span class="disk" data-size="${disk}">${disk}</span>`).join('')}</div>
      <div class="peg-label" aria-hidden="true">${peg}</div>
    </div>`).join('');
    previous.disabled = step === 0;
    next.disabled = step === moves.length;
  }
  previous.addEventListener('click', () => { if (step > 0) { step--; draw(); } });
  next.addEventListener('click', () => { if (step < moves.length) { step++; draw(); } });
  draw();
}

const responses = new Map();
function mountQuiz() {
  const quiz = select('quiz');
  quiz.innerHTML = '<div class="progress-text" id="quiz-score" aria-live="polite"></div>' +
    quizQuestions.map(([question, options], index) => `
      <fieldset class="question"><legend>${index + 1}. ${htmlEscape(question)}</legend>
        ${options.map((option, choice) => `<label><input type="radio" name="q${index}" data-index="${index}" value="${choice}"${responses.get(index) === choice ? ' checked' : ''}> ${htmlEscape(option)}</label>`).join('')}
        <div class="feedback" aria-live="polite"></div>
      </fieldset>`).join('');

  function showAnswer(index) {
    const answer = responses.get(index);
    const [, options, correct, reason] = quizQuestions[index];
    const feedback = quiz.querySelectorAll('.feedback')[index];
    feedback.dataset.correct = String(answer === correct);
    feedback.textContent = (answer === correct ? '答对了。' : '正确选项是「' + options[correct] + '」。') + reason;
  }
  function updateScore() {
    const count = [...responses].filter(([index, value]) => quizQuestions[index][2] === value).length;
    select('quiz-score').textContent = `已答 ${responses.size} / ${quizQuestions.length} 题 · 答对 ${count} 题`;
  }

  responses.forEach((_, index) => showAnswer(index));
  updateScore();
  quiz.addEventListener('change', (event) => {
    const index = Number(event.target.dataset.index);
    responses.set(index, Number(event.target.value));
    showAnswer(index);
    updateScore();
  });
}

function plainText(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent.trim().replace(/\s+/g, ' ');
}
const searchIndex = lessons.flatMap((chapter) => [
  { url: '#' + chapter.id, title: chapter.title, subtitle: chapter.summary, text: chapter.summary },
  ...chapter.sections.map((item) => ({
    url: '#' + chapter.id + '/' + item.id,
    title: item.title, subtitle: chapter.title, text: plainText(item.body)
  }))
]);

function drawSearch() {
  const query = input.value.trim().toLowerCase();
  if (!query) {
    results.innerHTML = '<p class="search-message">输入关键词查找章节和知识点。</p>';
    return;
  }
  const words = query.split(/\s+/);
  const matches = searchIndex.filter((item) => {
    const haystack = (item.title + ' ' + item.subtitle + ' ' + item.text).toLowerCase();
    return words.every((word) => haystack.includes(word));
  }).sort((a, b) => Number(b.title.toLowerCase().includes(query)) - Number(a.title.toLowerCase().includes(query)));

  results.innerHTML = matches.length
    ? matches.slice(0, 12).map((item) => `<a class="search-result" href="${item.url}">${htmlEscape(item.title)}<small>${htmlEscape(item.subtitle)}</small></a>`).join('')
    : '<p class="search-message">没有找到匹配的知识点。</p>';
}
function openSearch() {
  drawSearch();
  if (!dialog.open) dialog.showModal();
  input.focus();
  input.select();
}
select('search-button').addEventListener('click', openSearch);
select('search-close').addEventListener('click', () => dialog.close());
input.addEventListener('input', drawSearch);
results.addEventListener('click', (event) => {
  if (event.target.closest('a')) dialog.close();
});
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') results.querySelector('a')?.click();
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    results.querySelector('a')?.focus();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dialog.open && sidebar.hasAttribute('data-open')) {
    setMenu(false);
    menu.focus();
  }
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
      !dialog.open && !event.target.closest('input, textarea, [contenteditable]')) {
    event.preventDefault();
    openSearch();
  }
});

window.addEventListener('hashchange', drawRoute);
drawRoute();
