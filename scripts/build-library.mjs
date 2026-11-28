import { readFile, writeFile } from 'node:fs/promises';
import MarkdownIt from 'markdown-it';

const input = new URL('../notes/c-study-notes.md', import.meta.url);
const extension = new URL('../notes/c-course-guide.md', import.meta.url);
const output = new URL('../library.js', import.meta.url);
const markdown = new MarkdownIt({ html: false });
const { escapeHtml } = markdown.utils;
const chapters = new Map([
  ['阅读路线与题型索引', ['index', '题型索引', '按题号、专题和知识点查找练习。']],
  ['基础知识与算法速查', ['basics', '基础知识与算法速查', '从字符输入、质数筛到常用算法。']],
  ['数组题专题', ['arrays', '数组习题详解', '从数组交换到有序插入，按题复习。']],
  ['字符串专题', ['strings', '字符串详解', '字符数组、整行输入、字符串函数和动态数组。']],
  ['指针入门专题', ['pointers', '指针与内存详解', '指针类型、数组形参、二级指针和生存期。']],
  ['函数练习专题', ['functions', '函数习题详解', '多结果输出、求和、表达式解析与阿克曼函数。']],
  ['递归与位运算专题', ['recursion', '递归与位运算详解', '调用图、汉诺塔、进制转换和位掩码。']],
  ['网格搜索专题', ['grid', '网格搜索详解', '油田、消除星星与连通块计数。']],
  ['课程知识点与考前复习', ['exam', '考前知识点详解', '课程复习路线、概念判读、单选与简答。']],
  ['做题检查与自测', ['checks', '做题检查与自测', '边界、自测和排错方法。']],
  ['环境搭建与调试实训', ['toolchain', '环境搭建与调试实训', '从 Hello World 到断点、输入与链接问题。']],
  ['数制、类型与表达式讲义', ['language', '数制、类型与表达式讲义', '按位权手算、补码、类型转换、求值和宏。']],
  ['流、字符与字符串讲义', ['streams', '流、字符与字符串讲义', '看输入流里的字节，补上整行读入和字符串边界。']],
  ['数组模型与 PTA 题解串讲', ['array-patterns', '数组模型与 PTA 题解串讲', '五道 PTA 数组题、二维窗口、原地写入和排序。']],
  ['指针、函数与动态内存讲义', ['memory-guide', '指针、函数与动态内存讲义', '读声明、画内存、传地址、管理变长数据。']],
  ['结构体、排序与标准库', ['records', '结构体、排序与标准库', '记录建模、比较函数、文件流与标准库边界。']],
  ['递归、搜索与整数算法讲义', ['algorithm-guide', '递归、搜索与整数算法讲义', '调用树、欧几里得算法、回文、质数与连通块。']],
  ['计算机基础与考试作答讲义', ['exam-guide', '计算机基础与考试作答讲义', '计算机组成、OS 与网络，附纸笔和机试作答步骤。']],
]);

const [studyNotes, courseGuide] = (await Promise.all([input, extension].map((file) => readFile(file, 'utf8'))))
  .map((document) => document.replace(/\r\n/g, '\n').trimEnd());
const guideStart = studyNotes.split('\n').length + 1;
const source = studyNotes + '\n\n' + courseGuide.replace(/^# [^\n]+\n+/, '') + '\n';
const lines = source.split('\n');
const sourceAnchors = [];
const cleanLines = lines.map((line, number) => {
  const anchor = line.match(/^\s*<a name="([a-z0-9-]+)"><\/a>\s*$/);
  if (!anchor) return line;
  sourceAnchors.push([number, anchor[1]]);
  return '';
});
const tokens = markdown.parse(cleanLines.join('\n'), {});
const headings = tokens.flatMap((token, index) => {
  if (token.type !== 'heading_open') return [];
  const inline = tokens[index + 1];
  const text = inline.children.map((child) => child.content).join('');
  return [{ start: token.map[0], end: token.map[1], level: Number(token.tag[1]), text }];
});
const originalSlug = (text) => text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

const book = [];
const destinations = new Map();
const targets = new Map();
const levelTwo = headings.filter((heading) => heading.level === 2);
for (const [index, heading] of levelTwo.entries()) {
  const info = chapters.get(heading.text);
  if (!info) continue;
  const [slug, title, summary] = info;
  const id = 'notes-' + slug;
  const end = levelTwo[index + 1]?.start ?? cleanLines.length;
  const subheads = headings.filter((item) => item.start > heading.start && item.start < end);
  const roots = subheads.filter((item) => item.level === 3);
  const introEnd = roots[0]?.start ?? end;
  const sections = [];
  destinations.set(originalSlug(heading.text), '#' + id);
  targets.set(heading.start, { url: '#' + id });

  function addSection(sectionId, sectionTitle, start, finish, includedHeadings) {
    const subsectionEntries = includedHeadings.map((item) => {
      const subId = sectionId + '-s' + (item.start - start + 1);
      const data = { id: subId, title: item.text, line: item.start };
      targets.set(item.start, { ...data, url: '#' + id + '/' + data.id });
      return data;
    });
    sections.push({ id: sectionId, title: sectionTitle, start, finish, subsectionEntries });
  }

  if (cleanLines.slice(heading.end, introEnd).join('\n').trim()) {
    addSection('overview', '本章概览', heading.end, introEnd, subheads.filter((item) => item.start < introEnd));
  }
  for (const [number, root] of roots.entries()) {
    const sectionId = 'part-' + (number + 1);
    const finish = roots[number + 1]?.start ?? end;
    targets.set(root.start, { url: '#' + id + '/' + sectionId });
    destinations.set(originalSlug(root.text), '#' + id + '/' + sectionId);
    addSection(sectionId, root.text, root.end, finish, subheads.filter((item) => item.start > root.start && item.start < finish));
  }
  book.push({ id, title, summary, guide: heading.start >= guideStart, sections });
}

for (const [line, name] of sourceAnchors) {
  const next = headings.find((item) => item.start > line && targets.has(item.start));
  const previous = headings.findLast((item) => item.start < line && targets.has(item.start));
  const target = next && !cleanLines.slice(line + 1, next.start).join('\n').trim() ? next : previous;
  if (!target) throw new Error('Unresolved note anchor: ' + name);
  destinations.set(name, targets.get(target.start).url);
}

const originalLink = markdown.renderer.rules.link_open;
const unresolved = new Set();
markdown.renderer.rules.link_open = (list, index, options, env, renderer) => {
  const token = list[index];
  const href = token.attrGet('href');
  if (href?.startsWith('#') || href?.startsWith('c-study-notes.md#')) {
    const key = decodeURIComponent(href.slice(href.indexOf('#') + 1));
    if (destinations.has(key)) token.attrSet('href', destinations.get(key));
    else unresolved.add(key);
  } else if (href && !href.startsWith('https://')) {
    throw new Error('Unsupported outbound link: ' + href);
  }
  return originalLink
    ? originalLink(list, index, options, env, renderer)
    : renderer.renderToken(list, index, options);
};

markdown.renderer.rules.heading_open = (list, index, options, env, renderer) => {
  const token = list[index];
  const target = targets.get(env.offset + token.map[0]);
  if (target?.id) token.attrSet('id', target.id);
  token.tag = 'h' + Math.max(3, Number(token.tag[1]) - 1);
  return renderer.renderToken(list, index, options);
};
markdown.renderer.rules.heading_close = (list, index, options, env, renderer) => {
  list[index].tag = 'h' + Math.max(3, Number(list[index].tag[1]) - 1);
  return renderer.renderToken(list, index, options);
};

function callTree(sourceText) {
  const [direction, ...rows] = sourceText.trim().split('\n');
  if (direction !== 'flowchart TD') throw new Error('Expected a top-down call tree.');
  const nodes = new Map();
  const roots = [];
  const pattern = /^\s*(?:([A-Z0-9]+) -->\s*(?:\|([^|]+)\|\s*)?)?([A-Z0-9]+)(?:\["([^"]+)"\]|\(\["([^"]+)"\]\))$/;
  for (const row of rows) {
    const match = row.match(pattern);
    if (!match) throw new Error('Unsupported call tree row: ' + row);
    const [, parent, edgeLabel, id, rectangular, rounded] = match;
    if (nodes.has(id)) throw new Error('Duplicate call tree node: ' + id);
    const node = { label: (rectangular ?? rounded).replace(/<br\s*\/?>/gi, '\n'), edgeLabel, children: [] };
    nodes.set(id, node);
    if (parent) {
      if (!nodes.has(parent)) throw new Error('Missing parent node: ' + parent);
      nodes.get(parent).children.push(node);
    } else {
      roots.push(node);
    }
  }

  function draw(items) {
    return '<ul>' + items.map((node) => '<li>' +
      (node.edgeLabel ? '<span class="tree-edge">' + escapeHtml(node.edgeLabel) + '</span>' : '') +
      '<span class="tree-node">' + escapeHtml(node.label).replace(/\n/g, '<br>') + '</span>' +
      (node.children.length ? draw(node.children) : '') + '</li>').join('') + '</ul>';
  }
  return '<div class="call-tree" aria-label="递归调用树">' + draw(roots) + '</div>';
}

markdown.renderer.rules.fence = (list, index) => {
  const { info, content } = list[index];
  const language = info.trim().split(/\s+/)[0];
  if (language === 'mermaid') return callTree(content);
  if (language === 'text' || !language) return '<pre class="tree">' + escapeHtml(content.trimEnd()) + '</pre>';
  const label = { c: 'C11', powershell: 'PowerShell', sh: 'Shell' }[language] ?? language;
  return '<div class="code-block"><div class="code-head"><span>' + escapeHtml(label) +
    '</span><button class="copy-code" type="button">复制</button></div><pre><code>' +
    escapeHtml(content.trimEnd()) + '</code></pre></div>';
};

markdown.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';

const library = book.map(({ id, title, summary, guide, sections }) => ({
  id, title, summary, ...(guide ? { guide } : {}), sections: sections.map(({ id: sectionId, title: sectionTitle, start, finish, subsectionEntries }) => ({
    id: sectionId,
    title: sectionTitle,
    subsections: subsectionEntries.map(({ id, title }) => ({ id, title })),
    body: markdown.render(cleanLines.slice(start, finish).join('\n'), { offset: start }),
  })),
}));
if (unresolved.size) throw new Error('Unresolved internal links: ' + [...unresolved].join(', '));
if (library.length !== chapters.size) throw new Error('One or more chapters are missing from the notes.');
await writeFile(output, '/* Generated by npm run build from the public study notes. */\nconst detailedLessons = ' + JSON.stringify(library) + ';\n');
console.log(library.length + ' chapters and ' + library.flatMap((chapter) => chapter.sections).length + ' sections built.');
