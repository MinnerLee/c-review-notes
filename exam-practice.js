/* Original exercises following the site's course notes. */
const examTopics = [
  ['computer', '计算机基础与编译', '#notes-lecture-1'],
  ['language', '数制、表达式与控制流', '#notes-lecture-2'],
  ['strings', '输入输出与字符串', '#notes-streams'],
  ['arrays', '数组、矩阵与结构体', '#notes-array-course'],
  ['memory', '函数、指针与内存', '#notes-memory-guide'],
  ['algorithms', '迭代、枚举与状态机', '#notes-methods'],
  ['recursion', '递归、回溯与搜索', '#notes-recursion-course']
];

const coursePracticeQuestions = [
  ['link-object', 'computer', 'midterm', 'choice', '调用处能看到函数原型，单独编译 main.c 已成功，但生成可执行文件时报 undefined reference。该先检查什么？', ['链接命令是否包含定义所在的目标文件或库', 'main 函数的变量名是否超过 8 个字符', '系统是否已经运行目标程序', '是否把变量写成了十六进制'], '声明供编译器核对接口，实际定义需要在链接时提供。', 0],
  ['translation-role', 'computer', 'midterm', 'choice', '在通常的 C 构建流程中，#include 由哪个阶段处理？', ['加载', '链接', '汇编', '预处理'], '预处理在编译之前处理头文件包含、宏展开和条件编译。', 3],
  ['byte-capacity', 'computer', 'midterm', 'blank', '2 KiB 等于多少字节？只填整数。', ['2048'], '1 KiB = 1024 B，所以 2 KiB = 2048 B。'],
  ['process-memory', 'computer', 'final', 'choice', '下面哪一项属于操作系统管理的对象？', ['表达式中乘法的语法优先级', '正在运行的进程和它使用的内存', '宏定义替换后的字符拼写', '变量名在源码中的命名规则'], '进程和内存是运行时资源，由操作系统管理。', 1],
  ['octal-hex', 'language', 'midterm', 'blank', 'C11 表达式 012 + 0x12 的十进制结果是多少？', ['28'], '012 的前缀 0 表示八进制，值为 10。0x12 的值是 18。'],
  ['twos-overflow', 'language', 'midterm', 'choice', '在 8 位补码纸笔模型中，127 + 1 保留低 8 位得到 10000000。按 8 位有符号数值判断，这次加法如何？', ['结果 128，在范围内', '发生有符号溢出', '由于没有最高进位，所以结果一定有效', '结果为 0'], '8 位有符号补码上限是 127，数学结果 128 超出范围。最高位进位与有符号溢出要分开判断。', 1],
  ['continue-total', 'language', 'midterm', 'blank', 'sum 从 0 开始，for (int i = 1; i <= 5; ++i) 中先执行 if (i % 2 == 0) continue;，否则执行 sum += i;。循环结束时 sum 是多少？', ['9'], 'continue 跳到 for 的更新表达式，偶数被跳过，累加 1、3、5。'],
  ['masked-bits', 'language', 'final', 'blank', '十进制 12u 与 10u 做按位异或，十进制结果是多少？', ['6'], '1100 XOR 1010 = 0110，同一位不相同时才得到 1。'],
  ['fgets-capacity', 'strings', 'midterm', 'blank', '输入流以 abcdef\\n 开头，用 fgets(buf, 5, stdin) 读一次并成功。结果字符串的 strlen 是多少？', ['4'], '容量 5 要留一格给结束符，本次只读入 abcd，余下输入仍在流中。'],
  ['scan-bound', 'strings', 'midterm', 'choice', '用 scanf 向 char word[8] 读取一个不含空白的单词，哪个格式为结束符预留了位置？', ['%8s', '%7s', '%s', '%c'], '宽度 7 最多读 7 个字符，%s 再写一个结束符。', 1],
  ['character-eof', 'strings', 'midterm', 'choice', '用 getchar 读取直到 EOF 时，通常把其返回值保存在什么类型中？', ['char', 'unsigned char', 'int', 'float'], 'getchar 返回 int，其中既可表示读入的 unsigned char 转成 int 后的值，也能表示 EOF。', 2],
  ['copy-size', 'strings', 'final', 'blank', '想用 strcpy 将字符串 "red" 复制到 char 数组，目标数组至少需要多少个元素？', ['4'], '三个正文字符加一个结束符。'],
  ['partial-init', 'arrays', 'midterm', 'blank', '执行 int a[4] = {3, 7}; 后，a[3] 为多少？', ['0'], '初始化列表不足四项时，剩余整数元素按零初始化。'],
  ['lower-bound', 'arrays', 'final', 'blank', '有序数组 [1, 3, 3, 7] 中，第一个不小于 3 的下标是多少？下标从 0 开始。', ['1'], '二分下界遇到相等继续缩小右边界，最终找到第一项 3。'],
  ['matrix-shape', 'arrays', 'final', 'choice', '对 2 行 3 列矩阵 a 转置到 b，哪一种描述正确？', ['b 有 2 行 3 列，且 b[i][j] = a[i][j]', 'b 有 3 行 2 列，且 b[j][i] = a[i][j]', 'b 有 3 行 3 列，且 b[i][j] = a[j][j]', '转置对任何矩阵都不改变行列数'], '原矩阵的行下标变为列下标，列下标变为行下标。', 1],
  ['bubble-pass', 'arrays', 'final', 'choice', '从左往右做一趟升序冒泡，未排区最大的元素会在哪里？', ['未排区开头', '未排区末尾', '一定在数组正中间', '无法判断'], '每次相邻逆序就交换，较大的值沿未排区向右移动。', 1],
  ['pointer-writeback', 'memory', 'midterm', 'choice', '定义 void set(int *p) { *p = 7; }。int x = 1; 之后哪种调用会把 x 改成 7？', ['set(x);', 'set(&x);', 'set(*x);', 'set(7);'], '传 &x 得到 x 的地址，函数经 *p 写回调用方对象。', 1],
  ['decl-no-args', 'memory', 'midterm', 'choice', '在 C11 中，下面哪个声明明确表示函数 f 无参数且不返回值？', ['void f();', 'int f(void);', 'void f(void);', 'void f(int);'], '左侧 void 表示无返回值，参数表中的 void 明确表示无参数。', 2],
  ['realloc-check', 'memory', 'final', 'choice', '以非零大小用 realloc 扩容，失败时还要使用旧缓冲区。哪种写法最合适？', ['直接 p = realloc(p, n); 并立即使用 p', '先保存到临时指针，成功后再更新 p', '扩容前先 free(p)', '调用后忽略返回值'], '失败返回空指针时旧分配仍有效，临时指针使原地址不会丢失。', 1],
  ['const-pointer', 'memory', 'final', 'choice', 'int *const p = &x; 的含义是什么？', ['p 不能改指向，能通过 *p 修改 x', 'p 可以改指向，但 *p 不能修改', 'p 与 *p 都不可改', 'p 是含一个元素的数组'], 'const 紧跟在星号后，限制指针变量本身。', 0],
  ['gcd-step', 'algorithms', 'midterm', 'blank', '辗转相除法从 (84,30) 开始，第一次更新后较小参数是多少？', ['24'], '余数 84 % 30 = 24，下一对是 (30,24)。'],
  ['peach-backward', 'algorithms', 'midterm', 'blank', '每天吃掉当时桃子的一半再多吃 1 个。若次日早上还有 4 个，当天早上有多少个？', ['10'], '若当天有 x，次日为 x/2 − 1。倒推得到 x = 2 × (4 + 1)。'],
  ['dfa-accept', 'algorithms', 'final', 'choice', '确定有限自动机读完整个输入后，什么时候判定接受？', ['曾经访问过任意一个状态', '最终停在接受状态', '输入长度比状态数小', '只要第一个符号合法'], '判断时要读完输入，途中经过接受状态并不保证最后仍在其中。', 1],
  ['josephus-index', 'algorithms', 'final', 'blank', '约瑟夫环共 5 人，从 1 号开始报 1，报到 3 出圈，下一人重新报 1。最后留下的原编号是多少？', ['4'], '从 0 基递推 J(1)=0，随后依次为 1、1、0、3，转换回 1 基得到 4。'],
  ['recursive-print', 'recursion', 'midterm', 'blank', 'f(n) 在 n > 0 时先调用 f(n-1)，再打印 n，不带空格。f(0) 立即返回。调用 f(4) 输出什么？', ['1234'], '最深一层返回后，先执行 f(1) 的打印，再逐层回到 f(4)。'],
  ['hanoi-moves', 'recursion', 'final', 'blank', '标准汉诺塔移动 4 个盘子的最少步数是多少？', ['15'], 'T(0)=0，T(n)=2T(n−1)+1，所以 T(4)=15。'],
  ['fib-state', 'recursion', 'final', 'choice', '按递推式从头迭代求 F(n) 时，为什么只保留两个数就够？', ['每一项只由紧邻的前两项决定', 'F(n) 永远小于 2', '每一项都等于前一项', '递归不会重复计算'], '得到下一项后，可以丢弃更早的状态，只留下新的相邻两项。', 0],
  ['maze-steps', 'recursion', 'final', 'choice', '网格迷宫允许上下左右走，每一步代价相同。想求最少步数，通常选什么方法？', ['任选方向一直走', '深度优先遇到终点就返回', '广度优先搜索', '对格子编号做二分'], 'BFS 按步数逐层扩展，首次到达终点时得到最短步数。', 2]
].map(([id, topic, stage, type, prompt, choices, reason, correct]) =>
  ({ id, topic, stage, type, prompt, choices, reason, correct }));

const courseShortAnswers = [
  ['computer', '源代码、目标文件和可执行文件分别是什么？', ['源代码按语言规则写程序。', '目标文件含已翻译的代码、数据与待解析的符号信息。', '链接器组合目标文件与所需库，生成可装载执行的产物。']],
  ['language', '把 for 循环改写为 while 时，怎样处理原先的 continue？', ['在循环前完成初始化。', '正常完成循环体时执行更新，再检查条件。', '原 continue 路径也要执行更新，避免跳过计数变化。']],
  ['strings', '为什么 fgets 读到的字符串可能没有换行？怎样判断是否读完一行？', ['可能是缓冲区先满，也可能是最后一行没有换行。', '先确认读取成功，再找是否有换行。', '无换行时根据接下来的读取结果区分 EOF 与仍有剩余字符。']],
  ['arrays', '二分查找第一个不小于 key 的位置时，遇到相等为什么还要移动右边界？', ['相等说明 mid 本身符合条件。', '左边可能有更早的相等元素，应保留它们为候选。', '结束得到下界，若还需确认相等，要检查结果下标和元素。']],
  ['memory', '函数返回局部数组的地址为什么有问题？', ['普通局部对象的生存期在函数退出后结束。', '返回地址值不能延长数组生存期。', '可以由调用者提供缓冲区，或者明确由谁负责释放动态内存。']],
  ['recursion', '以 fact(3) 为例，解释递归向下调用和逐层返回。', ['每一层的 n 独立保存，向下直到 n=0。', '基本情况返回 1。', '逐层返回时乘以该层自己的 n，最后得到 6。'], 'fact(3)\n└─ fact(2)\n   └─ fact(1)\n      └─ fact(0) → 1\n返回结果 1 → 1 → 2 → 6']
];
