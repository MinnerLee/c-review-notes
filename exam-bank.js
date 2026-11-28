'use strict';

const examQuestionTypes = {
  choice: '单选题', judge: '判断题', blank: '填空题', 'code-blank': '程序填空',
  short: '简答题', design: '算法设计', function: '函数题', coding: '编程题'
};

const examPaperSources = [
  ['pdf09', '2009–10 上 · 期中', 'midterm'],
  ['pdf23', '2023–24 上 · 期中', 'midterm'],
  ['pdf22en', '2022–23 上 · 期末（英文卷）', 'final'],
  ['pdf22net', '2022–23 上 · 期末（网安）', 'final'],
  ['byr24mid', '24–25 上 · 期中（网安）', 'midterm', '24-25-1-计算导论与程序设计-期中'],
  ['byr25mid', '25–26 上 · 期中', 'midterm', '25-26-1-计算导论与程序设计-期中'],
  ['byr24final', '24–25 上 · 期末', 'final', '24-25-1-计算导论与程序设计-期末'],
  ['byr24net', '24–25 上 · 期末（网安）', 'final', '24-25-1-计算导论与程序设计-期末（网络空间安全学院）'],
  ['byr25com', '25–26 上 · 期末（信通）', 'final', '25-26-1-计算导论与程序设计-期末（信息与通信工程学院）']
].map(([id, title, stage, slug]) => ({
  id, title, stage, url: slug ? 'https://wiki.byrdocs.org/exam/' + encodeURIComponent(slug) + '/' : ''
}));

const topicTitle = (topic) => examTopics.find(([id]) => id === topic)[1];

const paperDiagrams = {
  'pdf22en-h': 'gcd(48, 18)\n└─ gcd(18, 12)\n   └─ gcd(12, 6)\n      └─ gcd(6, 0) → 6\n各层将 6 返回给上一层',
  'pdf22net-a6': 'f(4)\n└─ f(3)\n   └─ f(2)\n      └─ f(1)\n         └─ f(0) → 0\n回退后依次得到 1、3、6、10',
  'pdf22net-d2': 'findMin([4, 2, 7], 0)\n└─ findMin(…, 1)\n   └─ findMin(…, 2) → 7\n回退时依次输出后缀最小值 7、2、2',
  'byr25mid-b3': 'main\n└─ A\n   ├─ B\n   │  └─ C\n   └─ D\n返回 C → B → D → A'
};

function loadExamPaper(paperId, rows) {
  const paper = examPaperSources.find(({ id }) => id === paperId);
  return rows.map(([id, location, type, topic, prompt, answer, explanation, correct]) => ({
    id: paperId + '-' + id, location, type, topic, prompt, paper, stage: paper.stage,
    provenance: paper.url ? '回忆卷题意' : '试卷原题',
    choices: type === 'judge' ? ['正确', '错误'] : type === 'choice' || type === 'blank' ? answer : undefined,
    correct: type === 'judge' ? Number(!answer) : correct,
    reason: ['judge', 'choice', 'blank'].includes(type) ? explanation : answer,
    sourceMissing: id === 'word' && Boolean(paper.url),
    diagram: paperDiagrams[paperId + '-' + id]
  }));
}

function buildExamBank() {
  const writtenTopics = ['strings', 'memory', 'language', 'memory', 'algorithms', 'arrays'];
  const reviewTopics = ['algorithms', 'computer', 'computer', 'computer', 'language', 'algorithms', 'language', 'language', 'strings', 'memory'];
  const codingTopics = {
    triad: 'algorithms', 'factor-digits': 'algorithms', 'extract-average': 'arrays',
    'compact-string': 'strings', blocks: 'arrays', 'order-discount': 'language',
    'invert-case': 'strings', 'prime-pairs': 'algorithms', ranking: 'arrays', 'closest-ceiling': 'arrays'
  };
  const written = (id, topic, question, answer, diagram, source) => ({
    id, topic, prompt: question, reason: Array.isArray(answer) ? answer.join('\n') : answer,
    diagram, source, type: 'short', stage: source && source !== 'mid' ? 'final' : 'midterm'
  });
  const types = { '函数题': 'function', '算法设计': 'design', '编程题': 'coding' };
  return [
    ...pdfExamQuestions,
    ...webExamQuestions,
    ...examQuestions,
    ...courseShortAnswers.map(([topic, question, points, diagram], index) =>
      written('course-short-' + index, topic, question, points, diagram)),
    ...extraShortAnswers.map(([source, question, points, diagram], index) =>
      written('extra-short-' + index, writtenTopics[index], question, points, diagram, source)),
    ...shortAnswers.map(([question, answer], index) =>
      written('review-short-' + index, reviewTopics[index], question, answer)),
    ...codingExercises.map((exercise) => ({
      id: 'exercise-' + exercise.id, title: exercise.title, prompt: exercise.prompt,
      type: types[exercise.type], stage: exercise.source === 'mid' ? 'midterm' : 'final',
      topic: codingTopics[exercise.id], source: exercise.source, exercise
    }))
  ];
}
