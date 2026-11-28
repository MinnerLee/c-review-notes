'use strict';

const main = select('main');
const sidebar = select('sidebar');
const outline = select('outline');
const menu = select('menu-button');
const dialog = select('search-dialog');
const input = select('search-input');
const results = select('search-results');
const catalog = select('top-catalog');
const reviewLessons = [...lessons, patternChapter, examChapter];
const chapters = [...reviewLessons, ...detailedLessons];
const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));
const groupsByChapter = new Map(lessonGroups.flatMap((group) => group.chapters.map((id) => [id, group])));
const catalogHash = (group) => '#home/topic-' + group.id;
const chapterUrl = (id, section) => id === 'patterns'
  ? 'review.html' + (section ? '#' + section : '')
  : '#' + id + (section ? '/' + section : '');

select('catalog-menu').innerHTML = `
  <a class="catalog-overview" href="#home/course-guide">查看全部知识点</a>
  <div class="catalog-topics">${lessonGroups.map((group) => `<a href="${catalogHash(group)}">
    <strong>${group.title}</strong><span>${group.summary}</span>
  </a>`).join('')}</div>`;

const readKey = 'c-review-notes.read.v1';

function getProgress() {
  try {
    const values = JSON.parse(getPreference(readKey) ?? '[]');
    return new Set(Array.isArray(values) ? values.filter((id) => byId.has(id)) : []);
  } catch {
    return new Set();
  }
}

const progress = getProgress();
mountTheme();

function setMenu(open) {
  sidebar.toggleAttribute('data-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '关闭章节目录' : '打开章节目录');
}
menu.addEventListener('click', () => setMenu(!sidebar.hasAttribute('data-open')));
menu.addEventListener('click', () => { catalog.open = false; });
catalog.addEventListener('toggle', () => { if (catalog.open) setMenu(false); });
catalog.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  catalog.open = false;
  if (link.hash === location.hash) drawRoute();
});
document.addEventListener('click', (event) => {
  if (catalog.open && !catalog.contains(event.target)) catalog.open = false;
});
sidebar.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.querySelector('.skip').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});

function drawSidebar(activeId, activeGroup) {
  const opened = new Set([...sidebar.querySelectorAll('.sidebar-group[open]')].map((item) => item.dataset.group));
  const scroll = sidebar.scrollTop;
  const link = (id, label) => `<a href="${chapterUrl(id)}"${id === activeId ? ' aria-current="page"' : ''}>${label}${progress.has(id) ? '<span class="state" aria-label="已复习">✓</span>' : ''}</a>`;
  sidebar.innerHTML = `<nav>${link('home', '复习首页')}
    ${lessonGroups.map((group) => `<details class="sidebar-group" data-group="${group.id}"${group === activeGroup || opened.has(group.id) ? ' open' : ''}>
      <summary>${group.title}</summary>
      ${group.chapters.map((id) => link(id, byId.get(id).title)).join('')}
    </details>`).join('')}
  </nav>`;
  sidebar.scrollTop = scroll;
  const current = sidebar.querySelector('[aria-current="page"]');
  if (current && sidebar.clientHeight) {
    const bounds = sidebar.getBoundingClientRect();
    const row = current.getBoundingClientRect();
    if (row.bottom > bounds.bottom) sidebar.scrollTop += row.bottom - bounds.bottom + 8;
    if (row.top < bounds.top) sidebar.scrollTop += row.top - bounds.top - 8;
  }
}

function outlineLinks(chapterId, sections) {
  return sections.map((item) => `<a href="#${chapterId}/${item.id}">${htmlEscape(item.title)}</a>`).join('');
}

const homeSections = [
  { id: 'course-guide', title: '知识目录' },
  ...lessonGroups.map((group) => ({ id: 'topic-' + group.id, title: group.title })),
  { id: 'quick-links', title: '常查知识点' },
];

const oldCatalogSections = new Set(['chapter-list', 'detailed-library']);

function drawHome() {
  const example = htmlEscape('#include <stdio.h>\n\nint main(void) {\n    int ch;\n    while ((ch = getchar()) != EOF)\n        putchar(ch);\n    return 0;\n}');
  main.innerHTML = `
    <section class="hero">
      <div>
        <h1>C 语言<span>复习手册</span></h1>
        <p>读讲义、按题型找方法，再用自测检验。覆盖输入输出、指针、递归和历年考点。</p>
        <div class="hero-actions">
          <a class="button primary" href="#home/course-guide">浏览知识目录</a>
          <a class="button" href="review.html">按题型复习</a>
          <a class="button" href="exam.html">做考试自测</a>
        </div>
      </div>
      <div class="hero-example" aria-label="C 语言示例">
        <div class="hero-example-label">echo.c</div><pre><code>${example}</code></pre>
      </div>
    </section>
    <section class="home-section" id="course-guide">
      <h2>知识目录</h2>
      <p class="progress-text">已复习 ${progress.size} / ${chapters.length} 章</p>
      <div class="home-topics">${lessonGroups.map((group) => `
        <details class="home-topic" id="topic-${group.id}">
          <summary><span class="home-topic-title">${group.title}</span><span class="home-topic-count">${group.chapters.length} 章</span>
            <span class="home-topic-description">${group.summary}</span></summary>
          <ul>${group.chapters.map((id) => {
            const chapter = byId.get(id);
            return `<li><a href="${chapterUrl(id)}">${chapter.title}${progress.has(id) ? ' ✓' : ''}</a><p>${chapter.summary}</p></li>`;
          }).join('')}</ul>
        </details>
      `).join('')}</div>
    </section>
    <section class="home-section" id="quick-links">
      <h2>常查知识点</h2>
      <div class="hero-actions"><a class="button" href="#io/fgets">fgets 行边界</a><a class="button" href="#recursion/hanoi">汉诺塔演示</a><a class="button" href="#primes/goldbach">P1304 题解</a></div>
    </section>`;
}

function drawChapter(chapter) {
  const group = groupsByChapter.get(chapter.id);
  const collection = group.chapters.map((id) => byId.get(id));
  const position = collection.indexOf(chapter);
  const last = collection[position - 1];
  const next = collection[position + 1];
  const locationLabel = `<a href="#home/course-guide">知识目录</a> / <a href="${catalogHash(group)}">${group.title}</a>`;

  main.innerHTML = `<article class="article">
    <div class="breadcrumb">${locationLabel} / ${htmlEscape(chapter.title)}</div>
    <h1>${chapter.title}</h1><p class="lede">${chapter.summary}</p>
    <details class="mobile-outline"><summary>本章目录</summary><nav aria-label="本章目录">${outlineLinks(chapter.id, chapter.sections)}</nav></details>
    <div class="article-body">${chapter.sections.map((item) => `<section id="${item.id}"><h2>${htmlEscape(item.title)}</h2>${item.body}</section>`).join('')}</div>
    <div class="article-footer">
      ${last ? `<a href="${chapterUrl(last.id)}">上一篇 · ${last.title}</a>` : `<a href="${catalogHash(group)}">返回主题目录</a>`}
      <button class="button" type="button" id="mark-complete"></button>
      ${next ? `<a href="${chapterUrl(next.id)}">下一篇 · ${next.title}</a>` : ''}
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
    drawSidebar(chapter.id, group);
  });
  showProgress();
  if (chapter.id === 'recursion') mountHanoi();
  if (chapter.id === 'exam') {
    mountSampleChecks(main.querySelector('.article-body'));
  }
}

let visibleChapter;
function drawRoute() {
  const [id, requestedSection] = location.hash.slice(1).split('/');
  if (id === 'patterns') {
    location.replace(chapterUrl('patterns', requestedSection));
    return;
  }
  if (id === 'exam' && requestedSection === 'quiz') {
    location.replace('exam.html');
    return;
  }
  const chapter = byId.get(id);
  const active = chapter?.id ?? 'home';
  const section = active === 'home' && oldCatalogSections.has(requestedSection) ? 'course-guide' : requestedSection;
  const activeGroup = chapter ? groupsByChapter.get(active) : lessonGroups.find((group) => 'topic-' + group.id === section);
  const routeGroup = active === 'exam' ? active : '';
  select('top-catalog-label').toggleAttribute('data-current', !routeGroup && Boolean(chapter || activeGroup || section === 'course-guide'));
  for (const link of select('catalog-menu').querySelectorAll('a')) {
    if (activeGroup && link.hash === catalogHash(activeGroup)) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  document.querySelectorAll('.top-nav a').forEach((link) => {
    if (link.dataset.nav === routeGroup) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  document.title = chapter ? chapter.title + ' · C 语言复习手册' : 'C 语言复习手册';
  const sections = chapter?.sections ?? homeSections;
  if (active !== visibleChapter || active === 'home') drawSidebar(active, activeGroup);
  if (active !== visibleChapter) {
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
  catalog.open = false;
  const destination = section && select(section);
  if (destination?.matches('.home-topic')) destination.open = true;
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
const searchIndex = lessonGroups.map((group) => ({
  url: catalogHash(group), title: group.title, subtitle: '知识目录', text: group.summary, chapterId: 'home'
})).concat(chapters.flatMap((chapter) => [
  { url: chapterUrl(chapter.id), title: chapter.title, subtitle: chapter.summary, text: chapter.summary },
  ...chapter.sections.flatMap((item) => [{
    url: chapterUrl(chapter.id, item.id), title: item.title, subtitle: chapter.title, text: plainText(item.body)
  }, ...(item.subsections ?? []).map((nested) => ({
    url: chapterUrl(chapter.id, nested.id), title: nested.title, subtitle: chapter.title + ' · ' + item.title, text: ''
  }))])
].map((item) => ({ ...item, chapterId: chapter.id }))));

function searchSnippet(item, words) {
  const source = item.text || item.subtitle;
  const offsets = words.map((word) => source.toLowerCase().indexOf(word)).filter((index) => index >= 0);
  const start = offsets.length ? Math.max(0, Math.min(...offsets) - 15) : 0;
  const chunk = source.slice(start, start + 76);
  return (start ? '…' : '') + chunk + (start + chunk.length < source.length ? '…' : '');
}

function drawSearch() {
  const query = input.value.trim().toLowerCase();
  if (!query) {
    results.innerHTML = '<p class="search-message">输入关键词查找章节和知识点。</p>';
    return;
  }
  const words = query.split(/\s+/);
  const thisChapter = select('search-scope').value === 'chapter';
  const matches = searchIndex.filter((item) => {
    const haystack = (item.title + ' ' + item.subtitle + ' ' + item.text).toLowerCase();
    return (!thisChapter || item.chapterId === visibleChapter) && words.every((word) => haystack.includes(word));
  }).sort((a, b) => Number(b.title.toLowerCase().includes(query)) - Number(a.title.toLowerCase().includes(query)));

  results.innerHTML = matches.length
    ? `<p class="search-message">找到 ${matches.length} 项${matches.length > 12 ? '，显示前 12 项' : ''}</p>` +
      matches.slice(0, 12).map((item) => `<a class="search-result" href="${item.url}">${htmlEscape(item.title)}<small>${htmlEscape(item.subtitle)}</small><span class="search-snippet">${htmlEscape(searchSnippet(item, words))}</span></a>`).join('')
    : '<p class="search-message">没有找到匹配的知识点。</p>';
}
function openSearch() {
  const scope = select('search-scope');
  scope.options[1].disabled = visibleChapter === 'home';
  if (scope.options[1].disabled) scope.value = 'all';
  drawSearch();
  if (!dialog.open) dialog.showModal();
  input.focus();
  input.select();
}
select('search-button').addEventListener('click', openSearch);
select('search-close').addEventListener('click', () => dialog.close());
input.addEventListener('input', drawSearch);
select('search-scope').addEventListener('change', drawSearch);
results.addEventListener('click', (event) => {
  const target = event.target.closest('a');
  if (!target) return;
  dialog.close();
  if (target.pathname === location.pathname && target.hash === location.hash) drawRoute();
});
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') results.querySelector('a')?.click();
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    results.querySelector('a')?.focus();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dialog.open && catalog.open) {
    catalog.open = false;
    select('top-catalog-label').focus();
  } else if (event.key === 'Escape' && !dialog.open && sidebar.hasAttribute('data-open')) {
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
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...main.querySelectorAll('details:not([open]):not(.mobile-outline)')];
  for (const detail of printDetails) detail.open = true;
});
window.addEventListener('afterprint', () => {
  for (const detail of printDetails) detail.open = false;
  printDetails = [];
});
drawRoute();
