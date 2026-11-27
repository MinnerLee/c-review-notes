# C 语言复习手册

**[打开在线复习网页](https://minnerlee.github.io/c-review-notes/)**

面向 C11 初学者的中文复习网页。内容覆盖表达式、输入输出、数组和字符串、指针与内存、函数、递归、位运算、质数与网格搜索。

- 站内搜索支持章节、标题及正文关键词。
- 汉诺塔按七步展示三盘递归过程。
- 考试复习参考 BYR Docs 的五份期中、期末回忆卷。客观题支持逐题核对、模拟交卷和错题重练。简答附得分点，编程练习有样例输出核对和 C11 参考实现。
- 主题和章节复习标记保存在当前浏览器。
- 专题详解收录 C 语言学习笔记的 10 章、105 节。站内搜索也能定位详解的小标题。

## 打开网页

直接用现代浏览器打开 `index.html`，或者用 Python 启动本地服务，在浏览器打开 `http://localhost:8000`。

~~~sh
python -m http.server 8000
~~~

网页无需安装第三方依赖。GitHub Pages 从 `main` 分支根目录发布。章节内容在 `content.js`，导航和交互在 `app.js`。

考试复习的题库与题源在 `exam-content.js`，界面逻辑在 `exam.js`。

## 更新专题详解

`notes/c-study-notes.md` 是公开版笔记。更新后使用 Node.js 和 npm 生成 `library.js`，一并提交源笔记和生成文件。

~~~sh
npm ci
npm run build
~~~

也可以用 `npm run import-notes -- <笔记文件路径>` 重新取入本地笔记。导入后先检查公开版内容，再运行构建。

## 参考

- 阅读结构参考 [labuladong 的算法笔记](https://labuladong.online/zh/algo/home/)。
- 深蓝配色、纸面层次和当前项强调参考 [学有据](https://github.com/MinnerLee/xueyouju-web)。
- C11 规则参考 [WG14 N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)。
- 哥德巴赫分解示例对应 [洛谷 P1304](https://www.luogu.com.cn/problem/P1304)。
