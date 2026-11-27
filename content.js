/* Authored lesson content for the public review handbook. */
const htmlEscape = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const codeBlock = (source) => '<div class="code-block"><div class="code-head"><span>C11</span><button class="copy-code" type="button">复制</button></div><pre><code>' + htmlEscape(source.trim()) + '</code></pre></div>';
const tree = (source) => '<pre class="tree">' + htmlEscape(source.trim()) + '</pre>';
const lesson = (id, title, body) => ({ id, title, body });
const lessonGroups = [
  { title: '语言基础', chapters: ['basics', 'io', 'arrays', 'pointers', 'functions'] },
  { title: '算法专题', chapters: ['recursion', 'bits', 'primes', 'grid'] },
  { title: '考前复习', chapters: ['exam'] }
];

const quizQuestions = [
  ['哪个阶段解析目标文件之间的符号引用？', ['预处理', '汇编', '链接', '加载'], 2, '链接器解析符号引用并生成可执行文件。'],
  ['二进制 1011.01 的十进制值是多少？', ['11.25', '11.5', '13.25', '13.5'], 0, '按位权相加，8 + 2 + 1 + 1/4 = 11.25。'],
  ['全加器输入 A=1、B=0、Cin=1，本位和与进位是多少？', ['0、0', '0、1', '1、0', '1、1'], 1, '三项加起来是二进制 10，本位为 0，进位为 1。'],
  ['用 scanf 读入一个 double，格式说明选哪个？', ['%f', '%lf', '%d', '%lld'], 1, '%lf 需要 double *。'],
  ['输入 7 后回车，再输入 A。用 %d 读完 7 后紧接着用 %c，会读到什么？', ['字符 7', '字符 A', '换行', '字符串结束符'], 2, '整数转换留着换行，%c 从当前位置直接读取。'],
  ['(double)(5 / 2) 的值是多少？', ['2.5', '2.0', '3.0', '表达式非法'], 1, '括号里先做整数除法，得到 2，再转成 double。'],
  ['在 C11 中，i++ + i++ 有什么行为？', ['结果为 2', '结果为 3', '结果为 4', '未定义行为'], 3, '两个修改之间缺少求值顺序约束。'],
  ['int x = 0; if (1) if (0) x = 1; else x = 2; 最后 x 是多少？', ['0', '1', '2', '3'], 2, 'else 与内层 if 配对，外层进入后内层走 else。'],
  ['哪种算法描述用嵌套盒表达控制结构？', ['自然语言', '传统流程图', 'N-S 盒图', '伪代码'], 2, 'N-S 盒图以框的嵌套组织顺序、选择和循环。'],
  ['void f(int a[10]) 中的 sizeof a 得到什么？', ['10', '10 * sizeof(int)', 'sizeof(int *)', 'sizeof(int)'], 2, '函数形参 int a[10] 调整为 int *a。'],
  ['函数里有 static int k;，每次 return ++k;。连续调用两次分别返回多少？', ['0、0', '1、1', '0、1', '1、2'], 3, 'k 初始化为 0，并跨调用保留上一次的值。'],
  ['表达式 (13u >> 1) & 1u 得到什么？', ['0', '1', '6', '13'], 0, '1101 的第 1 位为 0，右移后最低位是 0。']
];
const shortAnswers = [
  ['简述算法的五个特征。', '有穷性、确定性、可行性、零个或多个输入、至少一个输出。可以用无法终止、具体操作含糊、整数除以零说明前几个条件。'],
  ['源代码和可执行文件都以字节存储，为什么仍要编译？', '源文件字节表达字符，机器代码用指令集规定的编码。构建过程把程序翻译成目标形式，再链接成可执行程序。'],
  ['编译程序与解释程序怎样比较？', '编译提前翻译得到目标形式，产物可在适用环境重复使用。解释程序在运行时按程序表示执行。'],
  ['C 从源文件到运行有哪些阶段？', '先预处理、编译、汇编、链接。随后加载器准备程序的运行环境。'],
  ['结构化程序的三种基本结构是什么？', '顺序、选择、循环。N-S 盒图以嵌套框展示各结构的包含关系。'],
  ['什么是自顶向下、逐步求精？', '先把整体任务分解为各个子任务，再明确每个子任务的输入、处理步骤及输出，细化到可以编写的程度。'],
  ['数据类型的三要素和变量的四属性是什么？', '类型从取值范围、存储表示和允许的操作来描述。变量有名称、地址、类型和值。'],
  ['为什么浮点计算常按误差阈值判断结果？', '很多实数只能近似存储，运算还会舍入。用题设容许的误差判断计算结果是否足够接近。'],
  ['读完整数后，下一次字符输入为什么可能读到换行？', '整数转换可能留下分隔符。%c 直接读当前位置，格式使用前导空格可以跳过空白。需要下一整行时，可以读掉本行剩余字符。'],
  ['为什么普通形参的交换改不了实参？数组形参又会怎样？', '普通参数传入值的副本。传入地址后可以通过解引用修改目标。数组形参调整为指针，元素个数需要另外传递。']
];

const algorithmLessons = [
  {
    id: 'recursion', title: '递归与调用树', summary: '基本情况、返回顺序和汉诺塔逐步演示。',
    sections: [
      lesson('return-order', '调用下探与逐层返回', String.raw`
        <p>每层调用保留自己的参数和普通局部变量。下一层结束后，当前层从调用语句后面继续。把输出写在递归后面，就能在返回时倒序输出。</p>
      ` + tree(String.raw`
进入时读入   A → B → C → \n（直接返回）
返回时输出   C → B → A
      `)),
      lesson('hanoi', '汉诺塔的三段调用', `
        <p><code>hanoi(n, from, spare, to)</code> 表示把 n 个盘从起点搬到目标柱，借用辅助柱。先把 n−1 个小盘搬去辅助柱，再搬最大盘，最后把小盘搬到目标柱。</p>
      ` + tree(`
hanoi(3, A, B, C)
├─ hanoi(2, A, C, B)  第 1～3 步
├─ 盘 3 从 A 到 C     第 4 步
└─ hanoi(2, B, A, C)  第 5～7 步
      `) + '<div id="hanoi-demo" class="hanoi"></div>' + codeBlock(String.raw`
#include <stdio.h>

void hanoi(int n, char from, char spare, char to) {
    if (n == 0)
        return;

    hanoi(n - 1, from, to, spare);
    printf("%d: %c -> %c\n", n, from, to);
    hanoi(n - 1, spare, from, to);
}

int main(void) {
    hanoi(3, 'A', 'B', 'C');
    return 0;
}
      `) + '<p>移动次数满足 <code>T(n) = 2T(n - 1) + 1</code>，共 <code>2ⁿ − 1</code> 次。调用栈最深有 <code>O(n)</code> 层。</p>'),
      lesson('nested', '嵌套解析与阿克曼函数', `
        <p>求值 <code>add(min(1,1000),add(100,99))</code> 时，让每次调用读取一个完整子表达式。读到数字直接返回，读到运算名就依次求两个参数。各层共享读取位置，各自保留运算名和返回值。</p>
      ` + tree(`
add(...) 返回 200
├─ 先求 min(1, 1000) 返回 1
└─ 再求 add(100, 99) 返回 199
      `) + '<p>阿克曼函数先求内部调用，等它返回后才知道下一个实参。</p>' + tree(`
akm(1,1) 返回 3
├─ 先算 akm(1,0) → akm(0,1) 返回 2
└─ 再算 akm(0,2) 返回 3
      `)),
      lesson('base-conversion', '递归转换进制', `
        <p>先递归处理商，再输出本层余数。把十进制 13 转成二进制时，调用参数依次为 13、6、3、1。返回时依次输出余数 1、1、0、1，得到 <code>1101</code>。</p>
      `)
    ]
  },
  {
    id: 'bits', title: '位运算与掩码', summary: '按位运算、移位边界与常用写法。',
    sections: [
      lesson('bit-ops', '六个运算符', `
        <p><code>&amp;</code> 两位都为 1 才得 1，<code>|</code> 至少一位为 1 就得 1，<code>^</code> 两位不同得 1，<code>~</code> 逐位翻转。<code>&lt;&lt;</code> 左移，<code>&gt;&gt;</code> 对无符号数右移时在高位补 0。</p>
        <p>例如 <code>1100 &amp; 1010 = 1000</code>，<code>1100 ^ 1010 = 0110</code>。按位运算处理每一位，逻辑运算 <code>&amp;&amp;</code>、<code>||</code>、<code>!</code> 根据整体真假得到 0 或 1。</p>
      `),
      lesson('masks', '取位、置位和清零', `
        <p>最右边是第 0 位。设 <code>mask = 1u &lt;&lt; k</code>，它只在第 k 位有一个 1。</p>
        <div class="table-wrap"><table><thead><tr><th>目标</th><th>写法</th></tr></thead><tbody><tr><td>读第 k 位</td><td><code>(x &gt;&gt; k) &amp; 1u</code></td></tr><tr><td>置一</td><td><code>x |= mask</code></td></tr><tr><td>清零</td><td><code>x &amp;= ~mask</code></td></tr><tr><td>翻转</td><td><code>x ^= mask</code></td></tr></tbody></table></div>
        <p><code>13</code> 为 <code>1101</code>，对第 1 位取掩码 <code>0010</code> 后置一，得到 <code>1111</code>，也就是 15。</p>
      `),
      lesson('bit-edges', '移位边界与最低位的 1', `
        <p>移位次数必须在提升后的左操作数位宽内。用 32 位无符号数时，<code>1u &lt;&lt; 31</code> 有效，<code>1u &lt;&lt; 32</code> 行为未定义。C11 的负有符号数右移由实现定义。</p>
        <p>判断偶数写 <code>(x &amp; 1u) == 0u</code>。对于非零无符号数，<code>x &amp; (x - 1u)</code> 清除最右侧的一个 1。对 13 重复三次得到零，所以二进制里有三个 1。</p>
        <p>低四位掩码 <code>(1u &lt;&lt; 4) - 1u</code> 等于 <code>0xFu</code>。用异或翻转低四位，再异或同一掩码就能恢复。</p>
      `)
    ]
  },
  {
    id: 'primes', title: '质数、埃氏筛与 P1304', summary: '平方根试除、批量筛质数和枚举最小加数。',
    sections: [
      lesson('trial', '试除法与 6k ± 1', `
        <p>合数必有一个不超过自身平方根的因子。先特判 2 和 3，再排除它们的倍数，可只试 <code>5、7、11、13……</code>。如果要支持更大的整数，用 <code>d &lt;= x / d</code> 可以避免乘法溢出。</p>
      `),
      lesson('sieve', '埃氏筛怎样划掉合数', `
        <p>从 2 开始扫描。每次遇到未标记的 p，就标记 p 的倍数。标记从 <code>p * p</code> 开始，因为更小的倍数已经被更小的质因子筛过。筛到 20 时，先划掉 4、6、8 等偶数，再划掉 9、12、15、18。余下 2、3、5、7、11、13、17、19。</p>
      ` + codeBlock(`
composite[0] = composite[1] = 1;
for (int p = 2; p <= n / p; p++) {
    if (composite[p])
        continue;
    for (int multiple = p * p; multiple <= n; multiple += p)
        composite[multiple] = 1;
}
      `)),
      lesson('goldbach', 'P1304 哥德巴赫猜想', `
        <p>对 4 到 N 的每个偶数，枚举第一个加数 p，第二个就是 <code>even - p</code>。从小到大找，第一次找到就输出。对于 10，2+8 失败，下一次得到 3+7。</p>
        <p>如果不用质数表，可以当场试除。4 要从 2 开始。更大的偶数从 3 开始跳着试奇数，因为减去 2 后得到的偶数大于 2。</p>
      ` + codeBlock(String.raw`
#include <stdio.h>

int isprime(int x) {
    if (x <= 3)
        return x >= 2;
    if (x % 2 == 0 || x % 3 == 0)
        return 0;

    for (int d = 5; d * d <= x; d += 6) {
        if (x % d == 0 || x % (d + 2) == 0)
            return 0;
    }
    return 1;
}

int main(void) {
    int n;
    scanf("%d", &n);

    for (int even = 4; even <= n; even += 2) {
        int start = even == 4 ? 2 : 3;
        for (int p = start; p <= even / 2; p += 2) {
            int q = even - p;
            if (isprime(p) && isprime(q)) {
                printf("%d=%d+%d\n", even, p, q);
                break;
            }
        }
    }
    return 0;
}
      `) + '<p class="callout">找到因子时在循环里返回 0。走完试除循环才到函数结尾，这里应返回 1。例如判 5 时循环跳过，直接返回 1。</p>')
    ]
  },
  {
    id: 'grid', title: '网格搜索与连通块', summary: '访问标记、四邻 DFS 和连通块计数。',
    sections: [
      lesson('dfs', '先标记，再走四个方向', `
        <p>每次进入格子先检查是否越界，再检查是否和目标颜色相同。接受该格之后立即标记，再访问邻居。油田题每找到一个尚未访问的起点就把连通块数加一，然后用栈或 DFS 遍历整块。</p>
      ` + tree(`
dfs(0, 0) 标记起点
├─ 上、下、左各返回 0
└─ 右 dfs(0, 1) 标记相邻格
   └─ 四邻都返回 0，当前格返回 1
起点返回 1 + 1 = 2
      `)),
      lesson('counting', '由返回值累加连通块大小', `
        <p>越界、不同色或已访问时返回 0。成功进入一个格子时先记 1，再把四个方向的返回值加起来。消除星星的块大小是 <code>count</code>，满足题设的至少两颗时，用 <code>5 * count * count</code> 与历史最高分比较。</p>
      `)
    ]
  }
];

const beginningLessons = [
  {
    id: 'basics', title: '类型与表达式', summary: '数制、数据类型、优先级和控制流程。',
    sections: [
      lesson('build', '从源代码到程序', `
        <p>程序设计语言用来表达数据和处理步骤。程序设计包含分析问题、设计算法、编写与调试。程序是这一过程的产物。</p>
        <p>预处理展开宏和头文件，编译生成汇编表示，汇编生成目标文件，链接解析符号并组装可执行文件。执行时由加载器准备进程环境。源文件的字节按字符编码解释，机器指令的字节按 CPU 指令集解释。</p>
      `),
      lesson('representation', '进制、字节与常量', `
        <p>二进制 <code>1101</code> 各位的权重是 8、4、2、1，所以值为 13。整数转其他进制用除基取余，再倒序读取。小数部分乘基取整数并按顺序记录，例如 <code>0.625</code> 写成二进制是 <code>0.101</code>。</p>
        <p>二进制按四位一组可换成十六进制。C 中 <code>010</code> 是八进制的 8，<code>0x10</code> 是十六进制的 16。标准容量记号中 <code>1 KiB = 1024 B</code>，<code>1 kB = 1000 B</code>。</p>
        <p><code>sizeof(char)</code> 恒为 1，每个 C 字节的位数用 <code>CHAR_BIT</code> 查询。ASCII 中 <code>'0'</code> 的编码为 48，UTF-8 保留 ASCII 单字节编码，中文字符通常占多个字节。</p>
        <p><code>const int n = 10;</code> 声明带类型的只读对象。<code>#define N 10</code> 让预处理器替换记号。在 C11 中，普通 <code>const int</code> 对象名不能作为 <code>case</code> 所需的整型常量表达式。</p>
      `),
      lesson('operators', '表达式与控制流程', `
        <ul><li><code>5 / 2</code> 先按整数除法得到 2。求 2.5 时写 <code>(double)5 / 2</code>。</li><li><code>3 &lt; 5 &lt; 2</code> 先得到 <code>1</code>，然后比较 <code>1 &lt; 2</code>，结果为真。区间判断写成 <code>lower &lt; x &amp;&amp; x &lt; upper</code>。</li><li>优先级决定分组。<code>i++ + i++</code> 两次修改同一个对象且缺少求值顺序约束，在 C11 中行为未定义。</li><li>条件中的 <code>=</code> 会赋值，<code>==</code> 用于比较。<code>else</code> 绑定最近尚未配对的 <code>if</code>。</li><li><code>switch</code> 命中一个分支后会继续执行到 <code>break</code> 或结尾。<code>do … while</code> 至少执行一次，<code>for</code> 中的 <code>continue</code> 先跳到更新表达式。</li></ul>
      `)
    ]
  },
  {
    id: 'io', title: '输入与输出', summary: 'scanf、fgets、逐字符读写和 EOF。',
    sections: [
      lesson('scanf', 'scanf 与 printf 的格式', `
        <p><code>scanf("%d", &amp;n)</code> 需要 <code>int *</code>，<code>scanf("%lf", &amp;d)</code> 需要 <code>double *</code>。<code>printf("%f", d)</code> 打印 <code>double</code>。<code>scanf</code> 的返回值表示赋值成功了几项。</p>
        <p><code>scanf("%9s", word)</code> 需要至少 10 格，余下一格留给结束符。<code>%c</code> 会读换行和空格，<code>" %c"</code> 先跳过连续空白。</p>
      `),
      lesson('fgets', 'fgets 与行边界', String.raw`
        <p><code>fgets(buf, sizeof buf, stdin)</code> 把输入写进可写数组。容量为 6 时最多存 5 个输入字节，第 6 格留给 <code>'\0'</code>。换行能装下时也会进入数组。</p>
        <div class="table-wrap"><table><thead><tr><th>输入</th><th>容量为 6 时第一次的内容</th></tr></thead><tbody><tr><td><code>ab\n</code></td><td><code>a b \n \0</code></td></tr><tr><td><code>abcde\n</code></td><td><code>a b c d e \0</code>，换行留在流里</td></tr><tr><td><code>abc</code> 后直接 EOF</td><td><code>a b c \0</code>，下次才返回 <code>NULL</code></td></tr></tbody></table></div>
        <p>普通文本可用 <code>strcspn</code> 定位回车或换行。缓冲区没有换行时，结合容量与流状态判断是否读完。用 <code>scanf</code> 读数后需读取下一行时，先消费当前行直到换行或 EOF。</p>
      ` + codeBlock(String.raw`
#include <stdio.h>
#include <string.h>

int main(void) {
    char line[128];
    if (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\r\n")] = '\0';
        printf("[%s]\n", line);
    }
    return 0;
}
      `)),
      lesson('characters', 'getchar、putchar 与 ungetc', `
        <p><code>getchar()</code> 读取一个字符，用 <code>int</code> 接收结果以区分字符和 <code>EOF</code>。<code>putchar(ch)</code> 输出一个字符。<code>putchar('7')</code> 输出数字字符，<code>putchar(7)</code> 按字符编码 7 输出。</p>
        <p>输入 <code>AB</code> 时，先读到 <code>A</code>，成功执行 <code>ungetc(ch, stdin)</code> 后，下次读取又会先得到 <code>A</code>。先确认 <code>ch != EOF</code>，再检查回退返回值。可移植的写法只依赖放回一个字符的保证。</p>
      ` + codeBlock(`
int ch;
while ((ch = getchar()) != EOF)
    putchar(ch);
      `))
    ]
  },
  {
    id: 'arrays', title: '数组与字符串', summary: '连续内存、双下标、二维数组和字符串边界。',
    sections: [
      lesson('array-index', '数组容量与有效长度', `
        <p><code>int a[4] = {1, 2};</code> 的后两项初始化为零。可用下标从 0 到 3，实际存了多少项由程序记录。插入前先确保容量足够。</p>
        <p>向有序数组插入一个数时，从右往左把大于新值的元素移动一格，直到找到空位。直接从左往右移动可能覆盖下一项。</p>
      `),
      lesson('move-zero', '原地移动零', `
        <p>从左到右读数组，遇到非零值就写到 <code>write</code> 所指的位置。写下标始终小于等于读下标，未处理的元素仍可读取。扫完后把余下的位置设为 0。</p>
      ` + codeBlock(`
void move_zeros(int a[], int n) {
    int write = 0;
    for (int read = 0; read < n; read++) {
        if (a[read] != 0)
            a[write++] = a[read];
    }
    for (int i = write; i < n; i++)
        a[i] = 0;
}
      `)),
      lesson('strings', '字符串和二维数组', String.raw`
        <p><code>char s[] = "cat";</code> 占 4 个字节，最后一格是 <code>'\0'</code>。<code>strlen(s)</code> 得 3，<code>sizeof s</code> 得 4。字符串内容相等用 <code>strcmp(a, b) == 0</code>。</p>
        <p><code>int grid[2][3]</code> 包含两行连续的 <code>int[3]</code>。若用显式一维缓冲区存网格，第 <code>row</code> 行第 <code>col</code> 列的位置是 <code>row * 列数 + col</code>。</p>
      `),
      lesson('common-array', '中心下标与邻域平均', `
        <p>找中心下标时先求总和。处理第 <code>i</code> 项前，左侧和是 <code>left</code>，右侧和是 <code>total - left - a[i]</code>。先比较，再把当前项加到左侧和。第一个匹配的位置就是最小下标。</p>
        <p>平滑滤波从原数组读邻居，把结果另存。中间用 3 项，首尾用 2 项。题目要求向下取整时，负数除不尽要在 C 整数商的基础上减一。</p>
      `)
    ]
  },
  {
    id: 'pointers', title: '指针与内存', summary: '地址、数组指针、指针数组和对象生存期。',
    sections: [
      lesson('address', '地址和解引用', `
        <p><code>int *p = &amp;x;</code> 让 <code>p</code> 保存 <code>x</code> 的地址。执行 <code>*p = 50;</code> 修改 <code>x</code> 的值。执行 <code>p = &amp;y;</code> 改变指针的目标。</p>
      ` + tree('p 自己有地址 &p\np 存着 &x ─────────→ x 的值')),
      lesson('pointer-array', '普通指针、数组指针、指针数组', `
        <p>设 <code>int a[3] = {10, 20, 30};</code>。读声明时先看名字跟什么结合。</p>
        <div class="table-wrap"><table><thead><tr><th>声明</th><th>存的内容</th><th>读取 20</th></tr></thead><tbody>
          <tr><td><code>int *p = a;</code></td><td>首元素地址</td><td><code>p[1]</code></td></tr>
          <tr><td><code>int (*whole)[3] = &amp;a;</code></td><td>整个数组的地址</td><td><code>(*whole)[1]</code></td></tr>
          <tr><td><code>int *refs[3] = {&amp;a[2], &amp;a[0], &amp;a[1]};</code></td><td>三个整数指针</td><td><code>*refs[2]</code></td></tr>
        </tbody></table></div>
        <p><code>p + 1</code> 走一个整数，<code>whole + 1</code> 走一个 <code>int[3]</code>。若目标是二维数组的第一行，加一可走到下一行。<code>int **</code> 可以指向行指针数组的一格。普通二维数组在表达式中转换后得到指向其第一行的数组指针。</p>
      `),
      lesson('memory', '生存期、malloc 和 free', `
        <p>普通局部变量随所在块结束生存期，局部 <code>static</code> 对象跨调用保存状态。<code>malloc</code> 申请的空间可以跨函数传递，使用前检查返回地址。申请成功后先写入再读取。</p>
        <p>多个指针可以指向同一块空间。<code>free(p)</code> 后，所有原先指向它的指针都不能继续用来访问。把 <code>p</code> 设成 <code>NULL</code> 只更新这个指针变量。</p>
      `)
    ]
  },
  {
    id: 'functions', title: '函数与传参', summary: '函数原型、按值传递、数组形参与作用域。',
    sections: [
      lesson('prototype', '原型、形参与实参', `
        <p><code>int sum(int a, int b);</code> 声明返回类型、参数数目和参数类型。C11 的无参数原型写 <code>int f(void);</code>。调用处提供实参，函数内的形参接收它们。</p>
        <p>C 按值传递参数。传入 <code>&amp;x</code> 时，形参得到地址的副本，仍可通过解引用修改同一个 <code>x</code>。</p>
      ` + codeBlock(`
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
      `)),
      lesson('parameter-array', '数组传参为什么要另传长度', `
        <p>参数中的 <code>int a[]</code> 调整为 <code>int *a</code>。函数体内 <code>sizeof a</code> 取得指针大小。因此在实际数组所在的作用域计算元素数，再调用 <code>process(a, n)</code>。</p>
        <p>若函数里执行 <code>return ++k;</code>，一个局部 <code>static int k;</code> 在连续两次调用中依次得到 1、2，普通局部 <code>int k = 0;</code> 每次都从 0 开始。</p>
      `)
    ]
  }
];

const lessons = [...beginningLessons, ...algorithmLessons];
