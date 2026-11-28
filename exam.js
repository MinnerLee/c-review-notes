'use strict';

const mistakeKey = 'c-review-notes.exam.mistakes.v1';

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
  if (question.type === 'choice' || question.type === 'judge') return response === String(question.correct);
  return question.choices.some((answer) => normalizeBlank(answer) === normalizeBlank(response));
}

function mountQuiz() {
  examMistakes ??= loadMistakes();
  const quiz = select('exam-quiz');
  const bank = buildExamBank();
  const objective = (question) => ['choice', 'judge', 'blank'].includes(question.type);
  const objectiveCount = bank.filter(objective).length;
  const byId = new Map(bank.map((question) => [question.id, question]));
  const params = new URLSearchParams(location.search);
  const pattern = params.get('pattern');
  const requestedQuestion = byId.get(params.get('question'));
  let patternScope = reviewQuestionIdsByPattern.has(pattern) ? new Set(reviewQuestionIdsByPattern.get(pattern)) : null;
  const namedPattern = reviewPatternTitle(pattern);
  const backToPattern = patternScope ? `<div class="exam-pattern-context" id="exam-pattern-context">
    <a href="review.html#${encodeURIComponent(pattern)}">返回${namedPattern ? htmlEscape(namedPattern) : '题型讲解'}</a>
    <button type="button" class="button" id="exam-clear-pattern">查看全题库</button>
  </div>` : '';
  const typeOptions = Object.entries(examQuestionTypes).map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
  const topicOptions = examTopics.map(([id, title]) => `<option value="${id}">${title}</option>`).join('');
  const sourceOptions = examPaperSources.map(({ id, title }) => `<option value="${id}">${title}</option>`).join('');
  quiz.innerHTML = `
    <div class="exam-overview"><span><strong>${bank.length}</strong> 道题</span><span><strong>${objectiveCount}</strong> 道客观题</span><span><strong>${bank.length - objectiveCount}</strong> 道主观题</span><a class="exam-work-jump" href="#exam-work-heading">去组卷与抽题 ↓</a></div>
    ${backToPattern}
    <div class="exam-workspace">
      <section class="exam-catalog" aria-labelledby="exam-catalog-heading">
        <h2 id="exam-catalog-heading">题目目录</h2>
        <div class="exam-toolbar">
          <label>题型 <select id="exam-type"><option value="all">全部题型</option>${typeOptions}</select></label>
          <label>知识块 <select id="exam-topic"><option value="all">全部知识块</option>${topicOptions}</select></label>
          <label>考试范围 <select id="exam-stage"><option value="all">期中与期末</option><option value="midterm">期中</option><option value="final">期末</option></select></label>
          <label>试卷来源 <select id="exam-source"><option value="all">全部来源</option>${sourceOptions}</select></label>
          <label class="exam-wide">搜索题目 <input id="exam-search" type="search" placeholder="题目、题号或出处"></label>
          <label>目录分组 <select id="exam-group"><option value="type">按题型</option><option value="topic">按知识块</option></select></label>
          <label class="exam-only-mistakes"><input id="exam-mistakes" type="checkbox"> 只看错题</label>
        </div>
        <div class="exam-catalog-actions">
          <p id="exam-selection-status" class="progress-text" role="status"></p>
          <button id="exam-select-visible" class="button" type="button">选中可练题目</button>
          <button id="exam-clear-selection" class="button" type="button">清空已选</button>
        </div>
        <div id="exam-directory" class="exam-directory"></div>
      </section>
      <section class="exam-work" aria-labelledby="exam-work-heading">
        <h2 id="exam-work-heading" tabindex="-1">开始练习</h2>
        <div class="exam-session">
          <label>反馈方式 <select id="exam-mode"><option value="practice">逐题核对</option><option value="mock">模拟交卷</option></select></label>
          <div class="exam-actions">
            <button class="button primary" id="exam-start-selected" type="button">做已选题</button>
            <button class="button" id="exam-start-filtered" type="button">做筛选结果</button>
          </div>
          <div class="exam-actions">
            <label>随机题数 <input id="exam-random-count" type="number" min="1" max="${bank.length}" value="10" inputmode="numeric"></label>
            <button class="button" id="exam-random" type="button">随机抽题</button>
          </div>
        </div>
        <p id="exam-mode-hint" class="progress-text" role="status">勾选题目，或从当前筛选结果中随机抽题。</p>
        <div class="exam-actions">
          <p class="progress-text" id="quiz-score" role="status"></p>
          <button class="button" id="exam-restart" type="button" hidden>重做本轮</button>
        </div>
        <form id="exam-attempt" class="quiz" aria-describedby="exam-mode-hint"></form>
        <div class="exam-pagination" id="exam-pagination" aria-label="试题分页" hidden></div>
      </section>
    </div>`;

  const stage = select('exam-stage');
  const topic = select('exam-topic');
  const type = select('exam-type');
  const source = select('exam-source');
  const search = select('exam-search');
  const group = select('exam-group');
  const mistakesOnly = select('exam-mistakes');
  const mode = select('exam-mode');
  const directory = select('exam-directory');
  const startSelected = select('exam-start-selected');
  const startFiltered = select('exam-start-filtered');
  const random = select('exam-random');
  const clear = select('exam-clear-selection');
  const selectVisible = select('exam-select-visible');
  const form = select('exam-attempt');
  const restart = select('exam-restart');
  const pagination = select('exam-pagination');
  const selected = new Set();
  const openGroups = new Map();
  const pageSize = 10;
  let pool = [];
  let available = [];
  select('quiz-score').textContent = `错题 ${examMistakes.size} 题`;
  let attempt;

  function updateSelection() {
    select('exam-selection-status').textContent = `匹配 ${pool.length} 题 · 已选 ${selected.size} 题${available.length < pool.length ? ` · ${pool.length - available.length} 题缺图` : ''}`;
    startSelected.disabled = clear.disabled = selected.size === 0;
    startFiltered.disabled = random.disabled = available.length === 0;
    selectVisible.disabled = available.length === 0 || available.every(({ id }) => selected.has(id));
  }

  function updateDirectory() {
    const query = search.value.trim().normalize('NFKC').toLowerCase();
    pool = bank.filter((question) =>
      (!patternScope || patternScope.has(question.id)) &&
      (stage.value === 'all' || stage.value === question.stage) &&
      (topic.value === 'all' || topic.value === question.topic) &&
      (type.value === 'all' || type.value === question.type) &&
      (source.value === 'all' || source.value === question.paper?.id) &&
      (!mistakesOnly.checked || examMistakes.has(question.id)) &&
      (!query || `${question.title ?? ''} ${question.prompt} ${question.paper?.title ?? ''} ${question.location ?? ''}`.normalize('NFKC').toLowerCase().includes(query)));
    available = pool.filter((question) => !question.sourceMissing);
    const groups = group.value === 'type' ? Object.entries(examQuestionTypes) : examTopics;
    directory.innerHTML = groups.map(([id, name], index) => {
      const items = pool.filter((question) => question[group.value] === id);
      if (!items.length) return '';
      const key = `${group.value}/${id}`;
      const open = openGroups.get(key) ?? (index === 0 || pool.length <= 15);
      return `<details data-catalog-group="${key}"${open ? ' open' : ''}><summary>${name} <span>${items.length} 题</span></summary>
        ${items.map((question) => `<label class="exam-directory-row">
          <input type="checkbox" value="${question.id}"${selected.has(question.id) ? ' checked' : ''}>
          <span><strong>${htmlEscape(question.title || question.prompt.split('\n')[0])}</strong>
          <small>${topicTitle(question.topic)} · ${examQuestionTypes[question.type]}${question.sourceMissing ? ' · 题图暂缺' : ''}${question.paper ? ' · ' + htmlEscape(question.paper.title + ' ' + question.location) : ''}</small></span>
        </label>`).join('')}
      </details>`;
    }).join('') || '<p class="exam-empty">当前条件下没有题目。</p>';
    if (!directory.querySelector('details[open]') && pool.length <= 15) {
      const first = directory.querySelector('details');
      if (first) first.open = true;
    }
    for (const details of directory.querySelectorAll('details')) {
      details.addEventListener('toggle', () => openGroups.set(details.dataset.catalogGroup, details.open));
    }
    updateSelection();
  }

  function updateScore() {
    const questions = attempt.questions;
    const answered = questions.filter(({ id }) => attempt.responses.get(id)?.trim()).length;
    const graded = questions.filter((question) => objective(question) && attempt.checked.has(question.id));
    const correct = graded.filter((question) => attempt.responses.get(question.id)?.trim() && isCorrect(question, attempt.responses.get(question.id))).length;
    const written = questions.filter((question) => !objective(question)).length;
    const results = attempt.mode === 'mock' && !attempt.submitted ? '' :
      ` · 客观题答对 ${correct} / ${attempt.submitted ? questions.length - written : graded.length}${written ? ' · 主观题自行核对' : ''}`;
    select('quiz-score').textContent = `已答 ${answered} / ${questions.length} 题${results} · 错题 ${examMistakes.size} 题`;
  }

  function sourceMarkup(question) {
    if (question.paper) {
      const label = htmlEscape(`${question.paper.title} · ${question.location}`);
      const attachment = window.examLocalPaperFiles?.[question.paper.id];
      const page = /^第(\d+)/.exec(question.location)?.[1];
      const href = question.paper.url || (attachment ? attachment + (page ? '#page=' + page : '') : '');
      return `<p class="exam-reference">${htmlEscape(question.provenance)} · ${href ? `<a href="${href}" target="_blank" rel="noopener">${label} ↗</a>` : label}</p>`;
    }
    if (!question.source) return '';
    return `<p class="exam-reference">同考点练习 · ${examReferences(question.source)}</p>`;
  }

  function reveal(question, field) {
    const feedback = field.querySelector('.feedback');
    const response = attempt.responses.get(question.id) ?? '';
    feedback.hidden = false;
    if (objective(question)) {
      const correct = Boolean(response.trim()) && isCorrect(question, response);
      const answer = question.type === 'blank' ? question.choices[0] : question.choices[question.correct];
      feedback.dataset.correct = String(correct);
      const result = correct ? '答对了。' : response.trim() ? '参考答案为「' + answer + '」。' : '本题未答。参考答案为「' + answer + '」。';
      feedback.innerHTML = `<p>${htmlEscape(result + question.reason)}</p>${question.diagram ? tree(question.diagram) : ''}`;
    } else {
      const exercise = question.exercise;
      feedback.innerHTML = exercise ? codingExerciseMarkup(exercise) :
        `<p class="exam-solution-text">${htmlEscape(question.reason)}</p>${question.diagram ? tree(question.diagram) : ''}`;
    }
    const [, label, destination] = examTopics.find(([id]) => id === question.topic);
    feedback.insertAdjacentHTML('beforeend', `<a class="exam-reference" href="index.html${destination}">复习${label}</a>`);
  }

  function drawQuestions() {
    select('exam-work-heading').textContent = '本轮作答';
    const totalPages = Math.ceil(attempt.questions.length / pageSize);
    restart.hidden = false;
    pagination.hidden = totalPages < 2;
    pagination.innerHTML = totalPages < 2 ? '' : `
      <button class="button" type="button" data-step="-1"${attempt.page === 0 ? ' disabled' : ''}>上一页</button>
      <span>第 ${attempt.page + 1} / ${totalPages} 页</span>
      <button class="button" type="button" data-step="1"${attempt.page + 1 === totalPages ? ' disabled' : ''}>下一页</button>`;
    const first = attempt.page * pageSize;
    form.innerHTML = attempt.questions.slice(first, first + pageSize).map((question, offset) => {
      const index = first + offset;
      const value = attempt.responses.get(question.id) ?? '';
      const disabled = attempt.submitted ? ' disabled' : '';
      const isObjective = objective(question);
      let inputs;
      if (question.type === 'choice' || question.type === 'judge') {
        inputs = question.choices.map((option, optionIndex) => `<label class="exam-option"><input class="exam-response" type="radio" name="exam-${question.id}" value="${optionIndex}"${value === String(optionIndex) ? ' checked' : ''}${disabled}><span>${htmlEscape(option)}</span></label>`).join('');
      } else if (question.type === 'blank') {
        inputs = `<input class="exam-response exam-input" type="text" aria-label="第 ${index + 1} 题答案" maxlength="200" autocomplete="off" value="${htmlEscape(value)}"${disabled}>`;
      } else {
        inputs = `<label class="exam-written-answer">你的答案<textarea class="exam-response" rows="5" spellcheck="false"${disabled}>${htmlEscape(value)}</textarea></label>`;
      }
      return `<fieldset class="question exam-question" data-question="${question.id}">
        <legend>${index + 1}. ${htmlEscape(question.title || question.prompt.split('\n')[0])}</legend>
        <p class="exam-type">${examQuestionTypes[question.type]} · ${topicTitle(question.topic)}</p>
        ${question.title || question.prompt.includes('\n') ? `<p class="exam-prompt">${htmlEscape(question.title ? question.prompt : question.prompt.split('\n').slice(1).join('\n'))}</p>` : ''}
        ${question.exercise?.signature ? codeBlock(question.exercise.signature) : ''}
        ${sourceMarkup(question)}${question.sourceMissing ? '<p class="exam-source-missing">题图暂缺，可先跳过本题。</p>' : ''}${inputs}
        ${attempt.mode !== 'mock' ? `<button type="button" class="button exam-check">${isObjective ? '核对本题' : '查看参考解法'}</button>` : ''}
        <div class="feedback" role="status" hidden></div>
      </fieldset>`;
    }).join('');
    if (attempt.mode === 'mock' && !attempt.submitted) {
      form.insertAdjacentHTML('beforeend', '<button class="button primary exam-submit" id="exam-submit" type="submit">提交本轮并查看解析</button>');
    }
    for (const field of form.querySelectorAll('[data-question]')) {
      if (attempt.checked.has(field.dataset.question)) reveal(byId.get(field.dataset.question), field);
    }
    updateScore();
  }

  function begin(questions, message, feedbackMode = mode.value) {
    if (!questions.length) return;
    attempt = { questions, responses: new Map(), checked: new Set(), submitted: false, page: 0, mode: feedbackMode, message };
    select('exam-mode-hint').textContent = message + (feedbackMode === 'mock' ? ' · 交卷后统一查看解析。' : ' · 可逐题核对或查看参考解法。');
    drawQuestions();
    select('exam-work-heading').focus();
  }

  function checkField(field) {
    const question = byId.get(field.dataset.question);
    const response = attempt.responses.get(question.id) ?? '';
    if (objective(question) && !response.trim()) {
      const feedback = field.querySelector('.feedback');
      feedback.hidden = false;
      feedback.removeAttribute('data-correct');
      feedback.textContent = '先填写或选择一个答案。';
      return;
    }
    attempt.checked.add(question.id);
    if (objective(question)) {
      rememberResult(question, isCorrect(question, response));
      if (mistakesOnly.checked) updateDirectory();
    }
    reveal(question, field);
    updateScore();
  }

  directory.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) selected.add(checkbox.value);
    else selected.delete(checkbox.value);
    updateSelection();
  });
  for (const control of [stage, topic, type, source, group, mistakesOnly]) control.addEventListener('change', updateDirectory);
  search.addEventListener('input', updateDirectory);
  selectVisible.addEventListener('click', () => {
    for (const { id } of available) selected.add(id);
    updateDirectory();
  });
  clear.addEventListener('click', () => {
    selected.clear();
    updateDirectory();
  });
  startSelected.addEventListener('click', () => begin(bank.filter(({ id }) => selected.has(id)), `目录选题 · ${selected.size} 题`));
  startFiltered.addEventListener('click', () => begin(available, `按筛选练习 · ${available.length} 题`));
  random.addEventListener('click', () => {
    const requested = Math.max(1, Math.floor(Number(select('exam-random-count').value) || 10));
    const count = Math.min(requested, available.length);
    const shuffled = [...available];
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(Math.random() * (shuffled.length - i));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    begin(shuffled.slice(0, count), `随机抽题 · ${count} 题${count < requested ? '（已抽完符合条件的题）' : ''}`);
  });
  restart.addEventListener('click', () => begin(attempt.questions, attempt.message, attempt.mode));

  form.addEventListener('input', (event) => {
    if (!event.target.matches('.exam-response') || attempt.submitted) return;
    const field = event.target.closest('[data-question]');
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
    if (attempt.mode !== 'mock') checkField(event.target.closest('fieldset'));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (attempt.submitted || attempt.mode !== 'mock') return;
    for (const question of attempt.questions) {
      attempt.checked.add(question.id);
      const response = attempt.responses.get(question.id);
      if (objective(question) && response?.trim()) rememberResult(question, isCorrect(question, response));
    }
    attempt.submitted = true;
    attempt.page = 0;
    if (mistakesOnly.checked) updateDirectory();
    drawQuestions();
    select('exam-work-heading').focus();
  });
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (!button || button.disabled) return;
    attempt.page += Number(button.dataset.step);
    drawQuestions();
    select('exam-work-heading').focus();
  });

  select('exam-clear-pattern')?.addEventListener('click', () => {
    patternScope = null;
    select('exam-pattern-context').hidden = true;
    params.delete('pattern');
    params.delete('question');
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    updateDirectory();
    select('exam-catalog-heading').scrollIntoView();
  });
  if ([...topic.options].some((option) => option.value === params.get('topic'))) topic.value = params.get('topic');
  if ([...type.options].some((option) => option.value === params.get('type'))) type.value = params.get('type');
  updateDirectory();
  mountSampleChecks(form);
  if (requestedQuestion && (!patternScope || patternScope.has(requestedQuestion.id))) {
    selected.add(requestedQuestion.id);
    updateDirectory();
    begin([requestedQuestion], '题型复习关联题');
  }
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
      <p>考试自测页收录历年试卷题目、BYR Docs 回忆卷题意及同考点练习。各学院可按自己的教学安排选做。</p>
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
    lesson('quiz', '单选与填空自测', '<p>按题型或知识块找题，支持目录勾选、随机抽题、逐题核对和模拟交卷。</p><a class="button primary" href="exam.html">进入考试自测</a>'),
    lesson('short-answers', '简答题与得分点', `
      <p>先写出定义、推导或声明，再展开逐项核对。</p>
      ${courseShortAnswers.map(([topic, question, points, diagram]) => {
        const [, label, destination] = examTopics.find(([id]) => id === topic);
        return `<details><summary>${htmlEscape(question)}</summary>
          ${diagram ? tree(diagram) : ''}<ol>${points.map((point) => '<li>' + htmlEscape(point) + '</li>').join('')}</ol>
          <p class="exam-reference">自编题 · <a href="index.html${destination}">复习${label}</a></p></details>`;
      }).join('')}
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
