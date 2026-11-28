/* Short representative exercises, with links to their original patterns. */
const reviewPatterns = [
  {
    id: 'line-input', title: '整行输入与换行', cue: '题目要求保留空格，或者数字之后还要读一整行。',
    method: '先确定读取单位。检查 fgets 的返回值，只在需要时移除行末换行。',
    prompt: '输入流是 42↵red fox↵。执行 scanf("%d", &n) 成功后，马上用容量足够的 fgets 读入。缓冲区中第一个字符是什么？怎样读到 red fox 这一行？',
    steps: ['%d 只消耗组成整数的字符，紧随 42 的换行还在流里。', '这一轮 fgets 遇到换行就结束，所以缓冲区为 \\n\\0。下一次 fgets 可读到 red fox 及其换行。'],
    answer: '第一个字符是换行。若目标就是下一行，先读完当前行余下字符，再用 fgets。',
    pitfall: '当前行可能还有空格或别的字符，只调用一次 getchar 不能保证消耗整行。用 int 接住 getchar 的返回值。',
    source: '自编例题 · 对照《C 语言学习笔记汇编》字符输入专题', href: '#notes-streams/part-1'
  },
  {
    id: 'compact-array', title: '稳定地原地搬运', cue: '保留元素的相对顺序，且不能另外开结果数组。',
    method: '用 read 扫描，write 记录下一个输出位置。保留项写入后才移动 write。',
    prompt: '把 [0, 4, 0, -2, 4] 中的零移到末尾，其他元素保持顺序。写出结束时 write 的值和整个数组。',
    steps: ['read 到 1 时，把 4 写到 0；到 3 时，把 −2 写到 1；到 4 时，把 4 写到 2。', 'write 为 3，说明前三格已存满非零元素。把下标 3 和 4 补成零。'],
    answer: 'write = 3，结果为 [4, -2, 4, 0, 0]。扫描耗时 O(n)，额外空间 O(1)。',
    pitfall: '写下标不会超过读下标。填零放到扫描之后，避免将还没读到的值覆盖。',
    source: '自编例题 · 同型原题 PTA 7-24', href: '#notes-arrays/part-19'
  },
  {
    id: 'balance-index', title: '左右和与前缀和', cue: '需要比较当前位置左右的总和，或反复查询区间和。',
    method: '先求总和。检查 i 时令 right = total − left − a[i]，核对完再更新 left。',
    prompt: '找出 [3, -3, 7] 的第一个中心下标，位置从 0 开始。写出命中时的左右和。',
    steps: ['总和为 7。下标 0 的左右和是 0、4，下标 1 的左右和是 3、7。', '到下标 2 时，左侧和 3 − 3 = 0，右侧为空也是 0。'],
    answer: '中心下标是 2，左右和都为 0。',
    pitfall: '先比较再更新 left，否则当前项会被重复扣除。累加类型要容纳总和。',
    source: '自编例题 · 同型原题 PTA 7-25', href: '#notes-arrays/part-20'
  },
  {
    id: 'matrix-pointer', title: '二维数组和数组指针', cue: '题目让你写二维数组形参，或询问 p + 1 究竟跨多远。',
    method: '先判断数组第一个元素的类型。二维数组的第一个元素是一整行。',
    prompt: '已知 int a[2][4]。声明 p 让它指向首行，写出 p + 1 指到哪里，以及如何通过 p 访问 a[1][2]。',
    steps: ['首行的类型是 int[4]，指向它的指针写成 int (*p)[4]。a 在初始化的表达式中提供首行地址。', 'p + 1 跨过一个 int[4]，指向第二行。p[1] 取第二行，p[1][2] 再取这一行下标 2 的格子。'],
    answer: 'int (*p)[4] = a;。p + 1 指向 a[1] 这一行，p[1][2] 访问目标元素。',
    pitfall: 'int *p[4] 声明了四个指针格子的数组。括号改变了 p 和 [] 的结合方式。',
    source: '自编例题 · 对照期末数组指针考点与内存讲义', href: '#notes-memory-guide/part-2'
  },
  {
    id: 'call-tree', title: '递归返回与输出顺序', cue: '输出语句写在递归前后，或者题目要求写出调用与返回。',
    method: '标记每层参数、出口，以及返回后当前层还有哪句要执行。',
    prompt: 'f(n) 在 n > 0 时依次执行 printf("%d", n)、f(n-1)、printf("%d", n)。n = 0 立即返回。求 f(3) 的输出。',
    diagram: 'f(3) 先输出 3\n└─ f(2) 先输出 2\n   └─ f(1) 先输出 1\n      └─ f(0) 返回\n返回时补印   1 → 2 → 3',
    steps: ['进入 3、2、1 三层时，先依次输出 321。', 'f(0) 没有输出。返回到 f(1)、f(2)、f(3) 时，分别执行各自最后一条 printf。'],
    answer: '321123。',
    pitfall: '调用完并不会跳过后面的语句。每层保存的是自身的 n。',
    source: '自编例题 · 对照原笔记的返回顺序与汉诺塔', href: '#notes-algorithm-guide/part-1'
  },
  {
    id: 'prime-pair', title: '试除、埃氏筛与质数配对', cue: '多次查质数，且要求第一个加数最小。',
    method: '预先标出合数，从小到大枚举 p ≤ n/2，检查 p 与 n − p。',
    prompt: '按洛谷 P1304 的规则分解 22，哪个质数最先成为有效的第一个加数？',
    steps: ['从 2 开始，另一项是 20，失败。试 3 时另一项是 19，两项都是质数。', '此时已经找到最小的第一项。若改为输出全部方案，继续枚举到 11。'],
    answer: '22=3+19。',
    pitfall: '试除在找到因子时才返回非质数，循环完整结束要返回质数。0 和 1 先排除。',
    source: '自编例题 · 沿用洛谷 P1304 的输出规则', href: '#notes-algorithm-guide/part-4'
  }
];

const patternModes = [
  ['explain', '讲解'],
  ['practice', '只做题'],
  ['reference', '方法速查']
];

function patternDetails(pattern) {
  return `
    <div class="review-problem"><h3>代表题</h3><p>${htmlEscape(pattern.prompt)}</p></div>
    <div class="review-solution">
      <h3>解题过程</h3>
      ${pattern.diagram ? tree(pattern.diagram) : ''}
      <ol>${pattern.steps.map((step) => `<li>${htmlEscape(step)}</li>`).join('')}</ol>
      <p class="review-answer"><strong>结论</strong> ${htmlEscape(pattern.answer)}</p>
      <p class="review-warning"><strong>易错点</strong> ${htmlEscape(pattern.pitfall)}</p>
    </div>
    <p class="review-source"><span>${htmlEscape(pattern.source)}</span> <a href="${pattern.href}">回查讲义或题解</a></p>
    <label class="review-mastered"><input type="checkbox" data-mastered="${pattern.id}"> 已掌握</label>`;
}

const patternChapter = {
  id: 'patterns', title: '题型复习', summary: '先认出题型，再选方法。可以只做题、看完整推导或考前速查。',
  sections: [
    lesson('map', '题型地图', `
      <div class="review-toolbar">
        <div class="review-modes" aria-label="复习模式" role="group">
          ${patternModes.map(([mode, label]) => `<button class="button" type="button" data-review-mode="${mode}" aria-pressed="false">${label}</button>`).join('')}
        </div>
        <div class="review-tools"><span id="mastery-count" role="status"></span><button class="button" id="review-print" type="button">打印讲义</button></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">题型</th><th scope="col">识别线索</th><th scope="col">核心方法</th></tr></thead>
        <tbody>${reviewPatterns.map((pattern) => `<tr><th scope="row"><a href="#patterns/${pattern.id}">${pattern.title}</a></th><td>${pattern.cue}</td><td>${pattern.method}</td></tr>`).join('')}</tbody>
      </table></div>`),
    ...reviewPatterns.map((pattern) => lesson(pattern.id, pattern.title, patternDetails(pattern)))
  ]
};

function mountPatternReview() {
  const savedKey = 'c-review-notes.pattern-mastery.v1';
  let saved = [];
  try { saved = JSON.parse(getPreference(savedKey) ?? '[]'); } catch { /* Start with no saved marks. */ }
  const mastered = new Set(reviewPatterns.map(({ id }) => id).filter((id) => Array.isArray(saved) && saved.includes(id)));
  const article = main.querySelector('.article');
  const switches = [...article.querySelectorAll('[data-review-mode]')];
  const markings = [...article.querySelectorAll('[data-mastered]')];

  function setMode(mode) {
    article.dataset.reviewMode = mode;
    for (const button of switches) button.setAttribute('aria-pressed', String(button.dataset.reviewMode === mode));
    for (const card of article.querySelectorAll('.review-problem')) card.hidden = mode === 'reference';
    for (const lesson of article.querySelectorAll('.review-solution')) lesson.hidden = mode !== 'explain';
  }

  function updateMastery() {
    select('mastery-count').textContent = `已掌握 ${mastered.size} / ${reviewPatterns.length}`;
    for (const checkbox of markings) checkbox.checked = mastered.has(checkbox.dataset.mastered);
  }

  for (const button of switches) button.addEventListener('click', () => setMode(button.dataset.reviewMode));
  for (const checkbox of markings) checkbox.addEventListener('change', () => {
    const id = checkbox.dataset.mastered;
    if (checkbox.checked) mastered.add(id);
    else mastered.delete(id);
    setPreference(savedKey, JSON.stringify([...mastered]));
    updateMastery();
  });
  select('review-print').addEventListener('click', () => window.print());
  setMode('explain');
  updateMastery();
}
