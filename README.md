# C 语言复习手册

**[打开在线复习网页](https://minnerlee.github.io/c-review-notes/)**

面向 C11 初学者的中文复习网页。内容覆盖表达式、输入输出、数组和字符串、指针与内存、函数、递归、位运算、质数与网格搜索。

- 顶部知识目录按八个学习主题组织，侧栏可折叠。站内搜索支持主题、章节标题及正文关键词。
- [独立题型复习](review.html)按知识块整理识别线索、解法、例题推导和易错点，关联整套题库，支持搜索、掌握标记和打印。练习和交卷在考试自测页进行。
- 汉诺塔按七步展示三盘递归过程。
- [独立考试自测](exam.html)按题型和知识块组织题目，可按考试范围和来源筛选、勾选组卷、随机抽题。客观题自动判分，简答、程序填空、函数和编程题提供参考解法。
- 主题和章节复习标记保存在当前浏览器。
- 系统讲义共 17 章、85 节，配手算推导、C11 示例和递归树。课件章节标注 PDF 页码或幻灯片序号。专题详解收录 C 语言学习笔记的 10 章、105 节。

## 打开网页

直接用现代浏览器打开 `index.html`，或者用 Python 启动本地服务，在浏览器打开 `http://localhost:8000`。

~~~sh
python -m http.server 8000
~~~

网页无需安装第三方依赖。GitHub Pages 从 `main` 分支根目录发布。章节内容在 `content.js`，导航和交互在 `app.js`。

考试复习的题库与题源在 `exam-content.js`、`exam-practice.js`、`exam-pdf-questions.js` 和 `exam-web-questions.js`，自测逻辑在 `exam.js`。

## 更新专题详解

可以在 GitHub 阅读[系统讲义](notes/c-course-guide.md)和[学习笔记汇编](notes/c-study-notes.md)。

更新任一 Markdown 后，使用 Node.js 和 npm 生成 `library.js`，一并提交源笔记和生成文件。

~~~sh
npm ci
npm run build
~~~

也可以用 `npm run import-notes -- <笔记文件路径>` 重新取入本地笔记。导入后先检查公开版内容，再运行构建。

## 参考

- 阅读结构参考 [labuladong 的算法笔记](https://labuladong.online/zh/algo/home/)。
- 题型复习流程参考 [study-flow-skills](https://github.com/white-sand-grand/study-flow-skills)。
- 深蓝配色、纸面层次和当前项强调参考 [学有据](https://github.com/MinnerLee/xueyouju-web)。
- C11 规则参考 [WG14 N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)。
- 哥德巴赫分解示例对应 [洛谷 P1304](https://www.luogu.com.cn/problem/P1304)。
