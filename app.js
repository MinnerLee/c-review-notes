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
const reviewLessons = [...lessons, examChapter];
const chapters = [...reviewLessons, ...detailedLessons];
const chapterGroups = [
  ...lessonGroups,
  { title: '专题详解', chapters: detailedLessons.map((chapter) => chapter.id) }
];
const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));

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
    ${chapterGroups.map((group) => `<div class="rail-label">${group.title}</div>${group.chapters.map((id) => link(id, byId.get(id).title)).join('')}`).join('')}
  </nav>`;
}

function outlineLinks(chapterId, sections) {
  return sections.map((item) => `<a href="#${chapterId}/${item.id}">${htmlEscape(item.title)}</a>`).join('');
}

const homeSections = [
  { id: 'chapter-list', title: '快速复习' },
  { id: 'detailed-library', title: '专题详解' },
  { id: 'quick-links', title: '常查知识点' },
];

function drawHome() {
  const example = htmlEscape('#include <stdio.h>\n\nint main(void) {\n    int ch;\n    while ((ch = getchar()) != EOF)\n        putchar(ch);\n    return 0;\n}');
  main.innerHTML = `
    <section class="hero">
      <div>
        <h1>C 语言<span>复习手册</span></h1>
        <p>从输入输出复习到指针、递归和算法。读完一个知识点，就用代码例子或自测检查理解。</p>
        <div class="hero-actions">
          <a class="button primary" href="#basics">开始复习</a>
          <a class="button" href="#home/detailed-library">查专题详解</a>
          <a class="button" href="#exam/quiz">做考试自测</a>
        </div>
      </div>
      <div class="hero-example" aria-label="C 语言示例">
        <div class="hero-example-label">echo.c</div><pre><code>${example}</code></pre>
      </div>
    </section>
    <section class="home-section" id="chapter-list">
      <h2>快速复习</h2><p class="progress-text">已复习 ${progress.size} / ${chapters.length} 章</p>
      <div class="chapter-grid">${reviewLessons.map((chapter) => `
        <a class="chapter-card" href="#${chapter.id}"><h3>${chapter.title}${progress.has(chapter.id) ? ' ✓' : ''}</h3><p>${chapter.summary}</p></a>
      `).join('')}</div>
    </section>
    <section class="home-section" id="detailed-library">
      <h2>专题详解</h2>
      <p>收录 C 语言笔记中的完整章节、练习代码和递归调用图。</p>
      <div class="chapter-grid">${detailedLessons.map((chapter) => `
        <a class="chapter-card" href="#${chapter.id}"><h3>${chapter.title}${progress.has(chapter.id) ? ' ✓' : ''}</h3><p>${chapter.summary}</p></a>
      `).join('')}</div>
    </section>
    <section class="home-section" id="quick-links">
      <h2>常查知识点</h2>
      <div class="hero-actions"><a class="button" href="#io/fgets">fgets 行边界</a><a class="button" href="#recursion/hanoi">汉诺塔演示</a><a class="button" href="#primes/goldbach">P1304 题解</a></div>
    </section>`;
}

function drawChapter(chapter) {
  const collection = chapter.id.startsWith('notes-') ? detailedLessons : reviewLessons;
  const position = collection.indexOf(chapter);
  const last = collection[position - 1];
  const next = collection[position + 1];
  const locationLabel = collection === detailedLessons
    ? '<a href="#home/detailed-library">专题详解</a>' : '<a href="#home">复习首页</a>';

  main.innerHTML = `<article class="article">
    <div class="breadcrumb">${locationLabel} / ${htmlEscape(chapter.title)}</div>
    <h1>${chapter.title}</h1><p class="lede">${chapter.summary}</p>
    <details class="mobile-outline"><summary>本章目录</summary><nav aria-label="本章目录">${outlineLinks(chapter.id, chapter.sections)}</nav></details>
    <div class="article-body">${chapter.sections.map((item) => `<section id="${item.id}"><h2>${htmlEscape(item.title)}</h2>${item.body}</section>`).join('')}</div>
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
  if (chapter.id === 'recursion') mountHanoi();
  if (chapter.id === 'exam') {
    mountQuiz();
    mountSampleChecks(main.querySelector('.article-body'));
  }
}

let visibleChapter;
function drawRoute() {
  const [id, section] = location.hash.slice(1).split('/');
  const chapter = byId.get(id);
  const active = chapter?.id ?? 'home';
  const routeGroup = active === 'exam' ? 'exam' : active.startsWith('notes-') || section === 'detailed-library' ? 'notes' : active !== 'home' || section === 'chapter-list' ? 'review' : '';
  document.querySelectorAll('.top-nav a').forEach((link) => {
    if (link.dataset.nav === routeGroup) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  document.title = chapter ? chapter.title + ' · C 语言复习手册' : 'C 语言复习手册';
  const sections = chapter?.sections ?? homeSections;
  if (active !== visibleChapter) {
    drawSidebar(active);
    if (chapter) drawChapter(chapter);
    else drawHome();
    outline.innerHTML = `<div class="outline-label">本页内容</div><nav>${outlineLinks(active, sections)}</nav>`;
    visibleChapter = active;
  }
  const parent = sections.find((item) => item.id === section || item.subsections?.some((nested) => nested.id === section));
  outline.querySelectorAll('a').forEach((link) => {
    if (parent && link.getAttribute('href') === '#' + active + '/' + parent.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
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

function plainText(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent.trim().replace(/\s+/g, ' ');
}
const searchIndex = chapters.flatMap((chapter) => [
  { url: '#' + chapter.id, title: chapter.title, subtitle: chapter.summary, text: chapter.summary },
  ...chapter.sections.flatMap((item) => [{
    url: '#' + chapter.id + '/' + item.id, title: item.title, subtitle: chapter.title, text: plainText(item.body)
  }, ...(item.subsections ?? []).map((nested) => ({
    url: '#' + chapter.id + '/' + nested.id, title: nested.title, subtitle: chapter.title + ' · ' + item.title, text: ''
  }))])
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
