'use strict';

const mistakeKey = 'c-review-notes.exam.mistakes.v1';
const examAttempts = new Map();

function loadMistakes() {
  try {
    const saved = JSON.parse(getPreference(mistakeKey) ?? '[]');
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

let examMistakes;

function rememberResult(question, correct) {
  if (correct) examMistakes.delete(question.id);
  else examMistakes.add(question.id);
  setPreference(mistakeKey, JSON.stringify([...examMistakes]));
}

function normalizeBlank(value) {
  return value.trim().normalize('NFKC').replace(/−/g, '-').replace(/[ \t]+/g, '').toLowerCase();
}

function isCorrect(question, response) {
  if (question.type === 'choice') return response === String(question.correct);
  return question.choices.some((answer) => normalizeBlank(answer) === normalizeBlank(response));
}

function mountQuiz() {
  examMistakes ??= loadMistakes();
  const quiz = select('exam-quiz');
  quiz.innerHTML = `
    <div class="exam-toolbar">
      <label>练习范围 <select id="exam-stage"><option value="all">期中与期末</option><option value="midterm">期中</option><option value="final">期末</option></select></label>
      <label>反馈方式 <select id="exam-mode"><option value="practice">逐题练习</option><option value="mock">模拟交卷</option><option value="mistakes">错题重练</option></select></label>
    </div>
    <p id="exam-mode-hint" class="progress-text"></p>
    <div class="exam-actions">
      <p class="progress-text" id="quiz-score" role="status"></p>
      <button class="button" id="exam-restart" type="button">开始新一轮</button>
    </div>
    <form id="exam-attempt" class="quiz" aria-describedby="exam-mode-hint"></form>`;

  const stage = select('exam-stage');
  const mode = select('exam-mode');
  const form = select('exam-attempt');
  const restart = select('exam-restart');
  let attempt;
  let currentKey;

  function updateScore() {
    const solved = attempt.questions.filter((question) => attempt.responses.get(question.id)?.trim()).length;
    const correct = attempt.questions.filter((question) => attempt.checked.has(question.id) &&
      attempt.responses.get(question.id)?.trim() && isCorrect(question, attempt.responses.get(question.id))).length;
    const showResult = mode.value !== 'mock' || attempt.submitted;
    const checked = [...attempt.checked].filter((id) => attempt.responses.get(id)?.trim()).length;
    const result = attempt.submitted
      ? ` · 答对 ${correct} / ${attempt.questions.length} · 未答 ${attempt.questions.length - solved}`
      : ` · 已核对 ${checked} 题 · 答对 ${correct} 题`;
    select('quiz-score').textContent = `已答 ${solved} / ${attempt.questions.length} 题${showResult ? result : ''} · 错题 ${examMistakes.size} 题`;
    const submit = select('exam-submit');
    if (submit) submit.disabled = solved === 0;
  }

  function showAnswer(question, field) {
    const response = attempt.responses.get(question.id);
    const feedback = field.querySelector('.feedback');
    feedback.hidden = false;
    const correct = response?.trim() && isCorrect(question, response);
    const answer = question.type === 'choice' ? question.choices[question.correct] : question.choices[0];
    feedback.dataset.correct = String(Boolean(correct));
    const result = correct ? '答对了。' : response?.trim() ? '参考答案为「' + answer + '」。' : '本题未答。参考答案为「' + answer + '」。';
    feedback.textContent = result + question.reason;
    if (question.source) {
      const source = examSourceById[question.source];
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.title;
      link.className = 'exam-reference';
      feedback.append(' ', link);
    }
  }

  function drawQuestions() {
    select('exam-mode-hint').textContent = {
      practice: '逐题核对即可看解析。答错的题会留在当前浏览器的错题里。',
      mock: '交卷后统一评分，未答题计 0 分。错题会收录已作答且答错的题。',
      mistakes: '重做当前范围内答错过的题。答对后会从下一轮错题里移除。'
    }[mode.value];
    restart.disabled = attempt.questions.length === 0;
    if (!attempt.questions.length) {
      form.innerHTML = '<p class="exam-empty">这里还没有错题。可先做逐题练习或模拟交卷。</p>';
      updateScore();
      return;
    }

    form.innerHTML = attempt.questions.map((question, index) => {
      const choice = question.type === 'choice';
      const value = attempt.responses.get(question.id) ?? '';
      const disabled = attempt.submitted ? ' disabled' : '';
      const inputs = choice
        ? question.choices.map((option, optionIndex) => `<label class="exam-option"><input type="radio" name="exam-${question.id}" value="${optionIndex}"${value === String(optionIndex) ? ' checked' : ''}${disabled}><span>${htmlEscape(option)}</span></label>`).join('')
        : `<input class="exam-input" type="text" aria-label="第 ${index + 1} 题答案" maxlength="80" autocomplete="off" value="${htmlEscape(value)}"${disabled}>`;
      return `<fieldset class="question exam-question" data-question="${question.id}">
        <legend>${index + 1}. ${htmlEscape(question.prompt)}</legend>
        <p class="exam-type">${choice ? '单选题' : '填空题'}</p>
        ${inputs}
        ${mode.value !== 'mock' ? '<button type="button" class="button exam-check">核对本题</button>' : ''}
        <div class="feedback" role="status" hidden></div>
      </fieldset>`;
    }).join('');
    if (mode.value === 'mock' && !attempt.submitted) {
      form.insertAdjacentHTML('beforeend', '<button class="button primary exam-submit" id="exam-submit" type="submit">交卷并查看解析</button>');
    }
    for (const field of form.querySelectorAll('fieldset')) {
      const question = attempt.questions.find(({ id }) => id === field.dataset.question);
      if (attempt.checked.has(question.id)) showAnswer(question, field);
    }
    updateScore();
  }

  function selectAttempt(fresh = false) {
    currentKey = stage.value + '/' + mode.value;
    if (fresh || mode.value === 'mistakes' || !examAttempts.has(currentKey)) {
      const questions = examQuestions.filter((question) =>
        (stage.value === 'all' || stage.value === question.stage) &&
        (mode.value !== 'mistakes' || examMistakes.has(question.id)));
      examAttempts.set(currentKey, { questions, responses: new Map(), checked: new Set(), submitted: false });
    }
    attempt = examAttempts.get(currentKey);
    drawQuestions();
  }

  function checkField(field) {
    const question = attempt.questions.find(({ id }) => id === field.dataset.question);
    const response = attempt.responses.get(question.id);
    if (!response?.trim()) {
      const feedback = field.querySelector('.feedback');
      feedback.hidden = false;
      feedback.removeAttribute('data-correct');
      feedback.textContent = '先填写或选择一个答案。';
      return;
    }
    attempt.checked.add(question.id);
    rememberResult(question, isCorrect(question, response));
    showAnswer(question, field);
    updateScore();
  }

  form.addEventListener('input', (event) => {
    const field = event.target.closest('[data-question]');
    if (!field || attempt.submitted) return;
    attempt.responses.set(field.dataset.question, event.target.value);
    attempt.checked.delete(field.dataset.question);
    field.querySelector('.feedback').hidden = true;
    updateScore();
  });
  form.addEventListener('click', (event) => {
    const button = event.target.closest('.exam-check');
    if (button) checkField(button.closest('fieldset'));
  });
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing || !event.target.matches('.exam-input')) return;
    event.preventDefault();
    if (mode.value !== 'mock') checkField(event.target.closest('fieldset'));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (attempt.submitted || mode.value !== 'mock' || !attempt.responses.size || select('exam-submit').disabled) return;
    for (const question of attempt.questions) {
      const response = attempt.responses.get(question.id);
      attempt.checked.add(question.id);
      if (response?.trim()) rememberResult(question, isCorrect(question, response));
    }
    attempt.submitted = true;
    drawQuestions();
    select('quiz-score').scrollIntoView({ block: 'nearest' });
  });
  for (const control of [stage, mode]) control.addEventListener('change', () => selectAttempt());
  restart.addEventListener('click', () => selectAttempt(true));

  selectAttempt();
}

function codingExerciseMarkup(exercise) {
  const [sampleInput] = exercise.cases[0];
  const sample = (value) => '<pre class="tree">' + htmlEscape(value || '（空行）') + '</pre>';
  const cases = exercise.cases.map(([input, output], index) => `
    <div class="exam-case"><div><strong>样例 ${index + 1} 输入</strong>${sample(input)}</div>
    <div><strong>预期输出</strong>${sample(output)}</div></div>`).join('');
  return `<p class="exam-type">${exercise.type}</p>
    <p>${htmlEscape(exercise.prompt)}</p>
    ${exercise.signature ? codeBlock(exercise.signature) : ''}
    <div class="sample-check" data-sample="${exercise.id}">
      <p><strong>先推一遍样例输出</strong></p>${sample(sampleInput)}
      <label>你的输出<textarea rows="3" spellcheck="false"></textarea></label>
      <button class="button sample-compare" type="button">核对输出</button>
      <p class="feedback" role="status" hidden></p>
    </div>
    <details><summary>提示</summary><p>${htmlEscape(exercise.hint)}</p></details>
    <details><summary>样例与边界检查</summary>${cases}</details>
    <details><summary>推导和 C11 参考实现</summary>
      <ol>${exercise.steps.map((step) => '<li>' + htmlEscape(step) + '</li>').join('')}</ol>
      ${codeBlock(exercise.code)}
      ${exercise.driver ? '<p>本地试跑时把这段测试驱动放在函数实现后，并在文件顶端加上 <code>#include &lt;stdio.h&gt;</code>。</p>' + codeBlock(exercise.driver) : ''}
    </details>
    <p class="exam-reference">对应回忆卷 · ${examReferences(exercise.source)}</p>`;
}

function mountSampleChecks(root) {
  const normalize = (value) => value.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  root.addEventListener('click', (event) => {
    const button = event.target.closest('.sample-compare');
    if (!button) return;
    const card = button.closest('[data-sample]');
    const exercise = codingExercises.find(({ id }) => id === card.dataset.sample);
    const correct = normalize(card.querySelector('textarea').value) === normalize(exercise.cases[0][1]);
    const feedback = card.querySelector('.feedback');
    feedback.hidden = false;
    feedback.dataset.correct = String(correct);
    feedback.textContent = correct ? '样例输出一致。' : '输出有差异。核对每行的数值、空格和顺序，也可以展开样例对照。';
  });
}

const examChapter = {
  id: 'exam', title: '期中与期末复习', summary: '按历年回忆卷梳理考点，练单选、填空、简答、函数题和编程题。',
  sections: [
    lesson('review', '考点与练习入口', `
      <p>本章根据 BYR Docs 的历年考试回忆卷组织，练习均为同考点新题。各学院可按自己的教学安排选做。</p>
      <ul class="exam-jump">
        <li><a href="#exam/number-systems">计算机基础与补码</a></li>
        <li><a href="#exam/memory-and-types">期末 C11 易错点</a></li>
        <li><a href="#exam/quiz">单选与填空自测</a></li>
        <li><a href="#exam/short-answers">简答得分点</a></li>
        <li><a href="#exam/coding">算法设计与机试</a></li>
      </ul>
      <p>期中重点练表达式、数位处理、函数调用和算法描述。结构化程序通常由顺序、选择、循环组成。全加器的和是 <code>A XOR B XOR Cin</code>，至少两个输入为 1 时产生进位。期末在基础上再练二维数组、结构体、指针、生存期和排序。</p>
      <table><thead><tr><th scope="col">回忆卷</th><th scope="col">复习时优先练</th></tr></thead><tbody>
        <tr><td>${examReferences('mid')}</td><td>表达式判读、数位累积、函数调用顺序、回文算法拆分。</td></tr>
        <tr><td>${examReferences('cs')}</td><td>字符串边界、数组指针和动态内存，练函数接口与二维窗口。</td></tr>
        <tr><td>${examReferences('com')}</td><td>机试输入输出、分档优惠、整行字符处理、质数配对和排名。</td></tr>
        <tr><td>${examReferences('ee')}</td><td>数制补码、计算机组成、操作系统和网络基础。</td></tr>
        <tr><td>${examReferences('old')}</td><td>输出数组、按行处理矩阵、记录筛选和多关键字排序。</td></tr>
      </tbody></table>`),
    ...examReviewSections,
    lesson('quiz', '单选与填空自测', '<div id="exam-quiz"></div>'),
    lesson('short-answers', '简答题与得分点', `
      <p>先写出定义、推导或声明，再展开逐项核对。</p>
      ${extraShortAnswers.map(([source, question, points, diagram]) => `<details><summary>${htmlEscape(question)}</summary>
        ${diagram ? tree(diagram) : ''}<ol>${points.map((point) => '<li>' + htmlEscape(point) + '</li>').join('')}</ol>
        <p class="exam-reference">对应回忆卷 · ${examReferences(source)}</p></details>`).join('')}
      ${shortAnswers.map(([question, answer]) => '<details><summary>' + htmlEscape(question) +
        '</summary><p>' + htmlEscape(answer) + '</p></details>').join('')}`),
    lesson('coding', '算法设计与机试练习目录', `
      <p>按题型选择。先自己写接口、推样例，再打开提示和参考实现。<a href="#exam/algorithm-plan">查看算法推导步骤</a></p>
      <ul>${codingExercises.map((exercise) => `<li><a href="#exam/${exercise.id}">${exercise.title}</a> <span class="exam-type">${exercise.type}</span></li>`).join('')}</ul>`),
    ...codingExercises.map((exercise) => lesson(exercise.id, exercise.title, codingExerciseMarkup(exercise)))
  ]
};
