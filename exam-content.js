/* Original exercises based on the topics in the linked BYR Docs recollections. */
const examSources = [
  ['mid', '25–26 上 · 期中（计算机、网安）', '25-26-1-计算导论与程序设计-期中'],
  ['cs', '25–26 上 · 期末（计算机、网安、未来）', '25-26-1-计算导论与程序设计-期末（计算机学院-网络空间安全学院-未来学院）'],
  ['com', '25–26 上 · 期末（信通）', '25-26-1-计算导论与程序设计-期末（信息与通信工程学院）'],
  ['ee', '25–26 上 · 期末（电子、集成电路）', '25-26-1-计算导论与程序设计-期末'],
  ['old', '24–25 上 · 期末（计算机）', '24-25-1-计算导论与程序设计-期末']
].map(([id, title, slug]) => ({ id, title, url: 'https://wiki.byrdocs.org/exam/' + encodeURIComponent(slug) + '/' }));

const examSourceById = Object.fromEntries(examSources.map((source) => [source.id, source]));
const examReferences = (...ids) => ids.map((id) => id.startsWith('#')
  ? '<a href="' + id + '">复习相关知识</a>'
  : '<a href="' + examSourceById[id].url + '">' + examSourceById[id].title + '</a>').join(' · ');

const examReviewSections = [
  lesson('number-systems', '计算机基础、数制与补码', `
    <ul>
      <li>进制换算先看基数和数码范围。十六进制 <code>0x37</code> 表示 <code>3 × 16 + 7 = 55</code>。</li>
      <li>手算减法先固定字长。8 位补码求 <code>12 - 7</code>，把 <code>00000111</code> 逐位取反再加 1，得到 <code>11111001</code>，随后与 <code>00001100</code> 相加。保留低 8 位 <code>00000101</code>，结果为 5。这里的最高位进位与有符号溢出是两回事。</li>
      <li>冯·诺依曼模型把指令与数据存入存储器。控制器取指、译码并协调工作，运算器做算术与逻辑操作，输入与输出设备负责和外界交换信息。CPU 由控制器、运算器等部件组成。</li>
      <li>操作系统管进程、内存、文件和设备。复习演变时可用批处理、分时、实时说明不同需求，分别抓住成批作业、多个用户交互、在时间约束内响应。</li>
      <li>OSI 从高到低依次是应用、表示、会话、传输、网络、数据链路、物理。拓扑常举星形、环形、总线形、网状四类。</li>
    </ul>
    <p class="exam-reference">回忆卷 · ` + examReferences('ee', 'cs', 'mid') + `</p>`),
  lesson('memory-and-types', '期末 C11 易错点与声明', `
    <table><thead><tr><th scope="col">检查项</th><th scope="col">答题时写清楚</th></tr></thead><tbody>
      <tr><td>数组与指针</td><td><code>int a[3][4]</code> 在普通表达式中转换为首行的地址，类型是 <code>int (*)[4]</code>。<code>&amp;a</code> 指向整个数组，类型是 <code>int (*)[3][4]</code>。<code>sizeof a</code> 得到整个数组的大小。</td></tr>
      <tr><td>指针数组和数组指针</td><td><code>int *p[4]</code> 的四个元素各是一个指针。<code>int (*p)[4]</code> 指向一行四个整数，<code>p + 1</code> 跨过一整行。</td></tr>
      <tr><td>字符串</td><td><code>char s[3] = "cat";</code> 在 C11 中是有效的数组初始化，但数组中没有结束符，不能直接传给 <code>strlen</code>。传给字符串函数前，要保证存在可访问的 <code>'\0'</code>。字符串字面量的内容不能修改。</td></tr>
      <tr><td>对象生存期</td><td>普通局部对象和块作用域 VLA 在作用域结束后失效。<code>static</code> 局部对象只初始化一次并跨调用保存值。<code>malloc</code> 的存储由程序用 <code>free</code> 释放。指向局部对象的指针不能在对象失效后解引用。</td></tr>
      <tr><td><code>void *</code></td><td>标准 C11 的指针算术要求已知完整对象类型的大小。让 <code>malloc</code> 返回 <code>void *</code>，调用者就可把它赋给所需的对象指针，在检查分配结果后按对象类型访问。</td></tr>
      <tr><td>结构体、枚举与输出参数</td><td>同类型结构体可赋值，比较需逐成员。对齐可能带来填充。枚举用有意义的名称表达离散状态。用 <code>int *out</code> 传地址，再用 <code>*out</code> 写回调用者。</td></tr>
    </tbody></table>
    <p>用结构体管理变长记录时，把指针和长度放在一起。二维表中每行有固定列数时，可定义 <code>Record (*p)[4]</code> 按行遍历，变长数组的长度由每个记录自己保存。</p>
    <p class="exam-reference">回忆卷 · ` + examReferences('cs', 'old', '#pointers') + `</p>`),
  lesson('algorithm-plan', '手写算法与机试的推导步骤', `
    <ol>
      <li><strong>定接口。</strong> 写清参数类型、合法范围、返回值。函数题要遵守给定原型，程序题要写输入和输出。</li>
      <li><strong>找每轮的工作。</strong> 数位题用 <code>n % 10</code> 取末位、<code>n /= 10</code> 缩小问题。回文题把反转、组合判断、批量输入拆开。质因数重复出现就重复除，最后别漏余下的质因数。</li>
      <li><strong>设计状态与比较顺序。</strong> 次大值要严格小于最大值。排序先确定主关键字，再确定同分规则。二维小块遍历时，外层先确定窗口左上角，内层扫描窗口。</li>
      <li><strong>用边界核对。</strong> 试空字符串、全负窗口、价格恰好达到门槛、排序同分、最大值重复、只有一个结果及多个测试组。</li>
    </ol>
    <p>字符输入转整数可用 <code>value = value * 10 + (ch - '0')</code> 表示十进制累积。先设 <code>value = 0</code>，再逐个读入已经确认是数字的字符。书面题还应写明循环何时结束。</p>
    <p class="exam-reference">回忆卷 · ` + examReferences('mid', 'cs', 'com', 'old') + `</p>`)
];

const newExamQuestions = [
  ['radix', 'mid', 'blank', '十六进制 0x37 转成十进制。', ['55'], '3 × 16 + 7 = 55。'],
  ['interval', 'mid', 'choice', 'C11 中哪个条件能判断 x 严格介于 2 和 9 之间？', ['2 < x < 9', '2 < x && x < 9', 'x > 2 || x < 9', '2 <= x && x <= 9'], '逻辑与让两个界限都成立。第一个选项先求 2 < x，再用 0 或 1 与 9 比较。', 1],
  ['iterate', 'mid', 'blank', '用 value = value * 10 + (ch - \'0\') 解析文本，从 0 开始依次处理字符 4、0、6，value 最终是多少？', ['406'], '三个步骤依次得到 4、40、406。'],
  ['returns', 'mid', 'choice', 'start 先调用 read，再调用 print。read 在返回前调用 parse。各函数的返回顺序是什么？', ['read → parse → print → start', 'parse → read → print → start', 'print → parse → read → start', 'start → read → parse → print'], 'parse 先结束，read 才能返回。start 接着调用 print，最后自己返回。', 1],
  ['second-max', 'mid', 'blank', '数组 8 3 8 5 5 中，严格小于最大值的最大数是多少？', ['5'], '重复出现的 8 都是最大值，第二个不同的值是 5。'],
  ['repeated-factors', 'mid', 'blank', '12 的质因数按重复次数计入，各质因数的数字和是多少？', ['7'], '12 = 2 × 2 × 3，数字和是 2 + 2 + 3 = 7。'],
  ['complement', 'ee', 'blank', '用 8 位补码表示 −7。输入包含前导位的 8 个二进制数字。', ['11111001'], '正数 7 写成 00000111，逐位取反得到 11111000，再加 1。'],
  ['subtraction', 'ee', 'blank', '在 8 位补码模型中，用 00001100 加 11111001。保留的 8 位是多少？', ['00000101'], '相加得到 1 00000101，固定字长只保留低 8 位。'],
  ['osi', 'ee', 'choice', 'OSI 模型中，位于会话层与网络层之间的是哪一层？', ['表示层', '数据链路层', '传输层', '物理层'], '从上到下是会话层、传输层、网络层。', 2],
  ['architecture', 'ee', 'choice', '下列哪个描述体现了存储程序思想？', ['运算器把十进制写成二进制', '内存只存数据，指令由接线指定', '指令和数据都存入存储器', '输出设备负责译码'], '控制器可从存储器取出指令并译码。更换程序可以通过更换所存指令完成。', 2],
  ['row-pointer', 'cs', 'choice', '给定 int a[3][4]，哪条语句让 p 指向第一行？', ['int **p = a;', 'int (*p)[4] = a;', 'int (*p)[3] = a;', 'int *p[4] = a;'], '首个元素是一整行，类型为 int[4]。指向这个元素的声明写成 int (*p)[4]。', 1],
  ['string-terminator', 'cs', 'choice', '哪条初始化可以保证 s 能安全传给 strlen？', ['char s[3] = "map";', 'char s[3] = {\'m\', \'a\', \'p\'};', 'char s[4] = "map";', 'char s[4];（普通局部变量）'], '前三个字节存字母，第四个字节存结束符。前两项的数组容量只有 3。', 2],
  ['struct-equality', 'cs', 'choice', '给定两个已初始化且同类型的结构体变量 left 和 right，哪种操作在 C11 中合法？', ['left == right', 'left = right', 'left + right', 'left > right'], '可以把同类型的结构体整体赋值。判断相等要按所需语义逐成员比较。', 1],
  ['void-pointer', 'cs', 'choice', 'C11 中，void *p 已指向一块有效内存。为什么不应写 p++？', ['void * 的值一定是 NULL', 'void * 指针本身没有大小', 'void 没有完整对象类型所需的大小', 'p 只能用于函数指针'], '步长取决于所指对象的大小。需要按字节移动时，用指向 unsigned char 的指针遍历该对象的字节表示。', 2],
  ['static-duration', 'cs', 'blank', '函数体是 static int k = 4; return k += 3;。连续调用两次，第二次返回多少？', ['10'], '第一次加到 7，第二次从 7 继续，加到 10。'],
  ['pool-negative', 'cs', 'blank', '一个 2×2 窗口的四个值是 −9、−4、−12、−6。窗口最大值是多少？', ['-4'], '用窗口内第一个值初始化最大值，就能处理全负数。'],
  ['discount', 'com', 'blank', '总价满 160 减 35，满 80 减 10，优惠只取最高档。总价恰好 160 时实付多少？', ['125'], '恰好达到 160，满足最高档。只减 35，实付 125。'],
  ['goldbach', 'com', 'blank', '列出 16 的两种质数和，每组较小的质数在前，再按第一项升序填写。示例格式 1+2,3+4。', ['3+13,5+11', '3+13，5+11'], '枚举 p ≤ 8，检查 p 和 16 − p 是否都为质数。两组是 3+13 和 5+11。'],
  ['average', 'old', 'blank', '数列 −3、−2、0 的算术平均值是 −5/3。严格大于平均值的元素有几个？', ['1'], '只有 0 大于 −1.666… 。C 的有符号整数除法向零截断。比较 a[i] × n > sum 可以保留精度。'],
  ['ordering', 'old', 'choice', '按总分从高到低排，同分按编号由小到大。A 为 70 分、编号 9；B 为 70 分、编号 2；C 为 69 分、编号 1。正确顺序是？', ['A、B、C', 'B、A、C', 'C、B、A', 'B、C、A'], '先比较分数，只在分数相同时比较编号。', 1],
].map(([id, source, type, prompt, choices, reason, correct]) => ({
  id, source, stage: source === 'mid' ? 'midterm' : 'final', type, prompt, choices, reason, correct
}));

const originalQuestionTopics = [
  'computer', 'language', 'computer', 'strings', 'strings', 'language', 'language', 'language',
  'algorithms', 'memory', 'memory', 'language'
];
const recollectionTopics = {
  radix: 'language', interval: 'language', iterate: 'algorithms', returns: 'memory',
  'second-max': 'arrays', 'repeated-factors': 'algorithms', complement: 'language',
  subtraction: 'language', osi: 'computer', architecture: 'computer', 'row-pointer': 'memory',
  'string-terminator': 'strings', 'struct-equality': 'arrays', 'void-pointer': 'memory',
  'static-duration': 'memory', 'pool-negative': 'arrays', discount: 'language',
  goldbach: 'algorithms', average: 'arrays', ordering: 'arrays'
};
const examQuestions = [
  ...quizQuestions.map(([prompt, choices, correct, reason], index) => ({
    id: 'review-' + index, stage: 'midterm', topic: originalQuestionTopics[index], type: 'choice', prompt, choices, correct, reason
  })),
  ...newExamQuestions.map((question) => ({ ...question, topic: recollectionTopics[question.id] })),
  ...coursePracticeQuestions
];

const extraShortAnswers = [
  ['mid', '字符序列 406 怎样变成整数 406？', ['输入流依次提供数字字符，各字符有单独的编码。', '用 ch - \'0\' 得到当前数字，value 从 0 开始。', '每次用 value = 10 * value + digit 更新，变量最终保存整数值。']],
  ['mid', 'main 先调用 load，再调用 write。load 会调用 check。画出调用关系，并写出返回顺序。', ['调用顺序为 main、load、check、write。', '返回顺序为 check、load、write、main。活动记录后进先出。'], 'main\n├─ load\n│  └─ check\n└─ write'],
  ['ee', '用 8 位补码计算 6 − 9，写过程。', ['6 是 00000110，9 是 00001001。', '9 取反加 1 得到 −9 的补码 11110111。', '相加得 11111101。此结果为负，再取反加 1 得到 3，所以结果是 −3。']],
  ['ee', '画出冯·诺依曼机的基本部件，并解释为何存储程序比改接线路方便。', ['点名输入、输出、存储器、运算器和控制器，并分别说明职责。', '指令与数据一起存储。控制器按照程序流程取指、译码和执行，换程序可替换内存里的指令。'], '输入设备 ──→ 存储器（指令与数据） ──→ 输出设备\n                 ↕\n          CPU（控制器、运算器）'],
  ['cs', '为什么 malloc 返回 void *？如何用它分配能容纳 n 个 int 的空间？', ['分配器只接收字节数，返回可转换为对象指针的 void *。', '已知 n 合法且乘法无溢出时，写 int *p = malloc(n * sizeof *p);。', '分配失败时返回空指针，访问前检查。用完 free(p)。']],
  ['cs', '有 3 个小组，每组 4 台设备，每台设备的采样条数不同。如何声明二维记录表、指向第一行的指针和写回总条数的函数？', ['每台设备的记录包含 int *samples 与 size_t count。', 'Record table[3][4]; 形成二维表。Record (*rows)[4] = table; 指向第一行。', '可声明 void total(Record rows[][4], size_t groups, size_t *out);。明确行数通过参数传递，结果通过 *out 写回。']]
];

const codingExercises = [
  {
    id: 'triad', source: 'mid', type: '算法设计',
    title: '三个回文检查',
    prompt: '输入正整数 t，随后读取 t 行，每行两个 1 到 99999 的正整数。两数及其和都为回文时输出 OK，否则输出 NO。每组单独一行。',
    cases: [['4\n44 55\n12 21\n22 88\n1 1', 'OK\nNO\nNO\nOK']],
    hint: '先写反转整数的循环，再写组合判断，最后让 main 负责处理 t 组数据。',
    steps: ['每次用 n % 10 取末位，用 rev = rev * 10 + digit 追加。', '反转时用副本，保留原数方便比较。', '用三个回文判断的逻辑与决定输出。'],
    code: String.raw`
#include <stdio.h>

static int palindrome(long n) {
    long rest = n, reversed = 0;
    while (rest > 0) {
        reversed = reversed * 10 + rest % 10;
        rest /= 10;
    }
    return reversed == n;
}

static int valid_pair(long a, long b) {
    return palindrome(a) && palindrome(b) && palindrome(a + b);
}

int main(void) {
    int t;
    scanf("%d", &t);
    for (int i = 0; i < t; ++i) {
        long a, b;
        scanf("%ld%ld", &a, &b);
        puts(valid_pair(a, b) ? "OK" : "NO");
    }
    return 0;
}`
  },
  {
    id: 'factor-digits', source: 'mid', type: '函数题',
    title: '质因数逐次计分',
    signature: 'int factor_score(int n);',
    prompt: '给定 2 到 10000 的整数 n，返回质因数各位数字的总和。重复因数每出现一次都计入。',
    cases: [['36', '10'], ['49', '14'], ['202', '4']],
    hint: '先写求数位和的函数。某个 d 整除 n 时，除完后继续检查同一个 d。',
    steps: ['从 2 开始试除，合数作为候选时，其更小的质因数已经除尽。', '当 d 超过剩余值的平方根时，若剩余值大于 1，它就是最后一个质因数。'],
    driver: String.raw`int main(void) { int n; scanf("%d", &n); printf("%d\n", factor_score(n)); }`,
    code: String.raw`
static int digit_sum(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

int factor_score(int n) {
    int score = 0;
    for (int d = 2; d <= n / d; ++d) {
        while (n % d == 0) {
            score += digit_sum(d);
            n /= d;
        }
    }
    if (n > 1) score += digit_sum(n);
    return score;
}`
  },
  {
    id: 'extract-average', source: 'old', type: '函数题',
    title: '按原顺序提取高于平均值的数',
    signature: 'int above_mean(const int values[], int n, int out[]);',
    prompt: '1 ≤ n ≤ 1000，每个数的绝对值不超过 10000。把严格大于算术平均值的数依出现顺序写入容量至少为 n 的 out，返回写入个数。输入样例第一项为 n，参考驱动按返回个数输出，结果为空时输出 EMPTY。',
    cases: [['3\n0 -3 -2', '0'], ['4\n2 2 2 2', 'EMPTY'], ['5\n8 1 8 4 3', '8 8'], ['3\n-2 -2 -1', '-1']],
    hint: '为了避免整数除法截断，比较 values[i] * n 与总和。',
    steps: ['第一遍累加总和。', '第二遍按输入顺序扫描，每发现一个就写到 out[count]，再增加 count。'],
    driver: String.raw`
int main(void) {
    int n, values[1000], out[1000];
    scanf("%d", &n);
    for (int i = 0; i < n; ++i) scanf("%d", &values[i]);
    int count = above_mean(values, n, out);
    if (count == 0) puts("EMPTY");
    for (int i = 0; i < count; ++i)
        printf("%d%c", out[i], i + 1 == count ? '\n' : ' ');
}`,
    code: String.raw`
int above_mean(const int values[], int n, int out[]) {
    long sum = 0;
    for (int i = 0; i < n; ++i) sum += values[i];

    int count = 0;
    for (int i = 0; i < n; ++i) {
        if ((long)values[i] * n > sum) {
            out[count++] = values[i];
        }
    }
    return count;
}`
  },
  {
    id: 'compact-string', source: 'cs', type: '函数题',
    title: '保留每个小写字母的首次出现',
    signature: 'void keep_first(char s[]);',
    prompt: '字符串只含 a 到 z，长度最多 80。原地删除重复出现的字母，保留最先出现时的顺序。输入一行，参考驱动输出处理后的一行。',
    cases: [['tattoo', 'tao'], ['zzzzz', 'z'], ['', '']],
    hint: '用一个下标读、一个下标写，查表记录字母有没有见过。写完补结束符。',
    steps: ['遇到未出现的字母才写回。已写入的长度始终不超过已读长度。', '写下最后的 \\0，避免输出旧尾巴。题目约定 ASCII。'],
    driver: String.raw`
#include <string.h>

int main(void) {
    char s[82];
    if (fgets(s, sizeof s, stdin)) {
        s[strcspn(s, "\r\n")] = '\0';
        keep_first(s);
        puts(s);
    }
}`,
    code: String.raw`
void keep_first(char s[]) {
    int seen[26] = {0};
    int write = 0;
    for (int read = 0; s[read] != '\0'; ++read) {
        int letter = s[read] - 'a';
        if (!seen[letter]) {
            seen[letter] = 1;
            s[write++] = s[read];
        }
    }
    s[write] = '\0';
}`
  },
  {
    id: 'blocks', source: 'cs', type: '编程题',
    title: '按行输出四格窗口的最大值',
    prompt: '先输入偶数 r、c（各为 2 到 20），再输入 r 行 c 列整数。用互不重叠的 2×2 窗口处理矩阵，按从上到下、从左到右输出各窗口最大值。每个输出行的整数以一个空格分隔。',
    cases: [['2 4\n-5 -2 -8 -4\n-1 -7 -3 -6', '-1 -3'], ['2 2\n6 4\n2 1', '6'], ['4 2\n2 3\n0 1\n7 6\n5 8', '3\n8']],
    hint: '窗口起点的行、列各加 2。用窗口左上角初始化最大值。',
    steps: ['外层确定窗口起点，内层检查 dx、dy 为 0 或 1 的四个位置。', '窗口起点的列加 2 等于 c 时，输出换行。'],
    code: String.raw`
#include <stdio.h>

int main(void) {
    int a[20][20], r, c;
    scanf("%d%d", &r, &c);
    for (int i = 0; i < r; ++i)
        for (int j = 0; j < c; ++j)
            scanf("%d", &a[i][j]);

    for (int i = 0; i < r; i += 2) {
        for (int j = 0; j < c; j += 2) {
            int best = a[i][j];
            for (int dx = 0; dx < 2; ++dx)
                for (int dy = 0; dy < 2; ++dy)
                    if (a[i + dx][j + dy] > best)
                        best = a[i + dx][j + dy];
            printf("%d%c", best, j + 2 == c ? '\n' : ' ');
        }
    }
    return 0;
}`
  },
  {
    id: 'order-discount', source: 'com', type: '编程题',
    title: '计算购物篮实付',
    prompt: '输入 n（1 到 100），然后输入 n 行，每行一件商品的数量和单价，二者都在 1 到 10000。总价满 160 减 35，满 80 减 10，优惠只取最高满足档。输出实付。',
    cases: [['2\n2 30\n4 25', '125'], ['1\n2 40', '70'], ['1\n1 79', '79']],
    hint: '先累加每行的数量乘单价，判断折扣时从高到低。',
    steps: ['用 long long 保存总价，乘法也在 long long 中完成。', '先检查 160，再检查 80，使用 else if 保证只应用一档。'],
    code: String.raw`
#include <stdio.h>

int main(void) {
    int n;
    long long total = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; ++i) {
        long long quantity, price;
        scanf("%lld%lld", &quantity, &price);
        total += quantity * price;
    }
    if (total >= 160) total -= 35;
    else if (total >= 80) total -= 10;

    printf("%lld\n", total);
    return 0;
}`
  },
  {
    id: 'invert-case', source: 'com', type: '编程题',
    title: '整行切换字母大小写',
    prompt: '输入一行最多 100 个可打印 ASCII 字符。将字符中的大写字母变小写、小写字母变大写，原样输出空格、数字和标点。',
    cases: [['Meet at 9!', 'mEET AT 9!'], ['', ''], ['  a B  ', '  A b  ']],
    hint: '使用 fgets 读整行。给输入正文、换行和字符串结束符留足容量。',
    steps: ['用 islower 和 isupper 判断字母，调用 toupper 和 tolower 转换。', 'ctype.h 的参数应为 EOF 或可表示为 unsigned char 的值。'],
    code: String.raw`
#include <ctype.h>
#include <stdio.h>

int main(void) {
    char line[103];
    if (!fgets(line, sizeof line, stdin)) return 0;
    for (int i = 0; line[i] != '\0'; ++i) {
        unsigned char ch = (unsigned char)line[i];
        if (islower(ch)) line[i] = (char)toupper(ch);
        else if (isupper(ch)) line[i] = (char)tolower(ch);
    }
    fputs(line, stdout);
    return 0;
}`
  },
  {
    id: 'prime-pairs', source: 'com', type: '编程题',
    title: '枚举一个偶数的所有质数对',
    prompt: '读入 4 到 10000 的偶数 n。输出所有满足 p + q = n 且 p ≤ q 的质数对。每行两个数，以空格分隔，按 p 升序排列。',
    cases: [['16', '3 13\n5 11'], ['4', '2 2'], ['26', '3 23\n7 19\n13 13']],
    hint: '只枚举到 n / 2。每次确认两项都是质数。',
    steps: ['试除只需检查不超过平方根的因子。', '找到一对后继续枚举，这里的输出要求是全部方案。'],
    code: String.raw`
#include <stdio.h>

static int prime(int n) {
    if (n < 2) return 0;
    for (int d = 2; d <= n / d; ++d)
        if (n % d == 0) return 0;
    return 1;
}

int main(void) {
    int n;
    scanf("%d", &n);
    for (int p = 2; p <= n / 2; ++p)
        if (prime(p) && prime(n - p))
            printf("%d %d\n", p, n - p);
    return 0;
}`
  },
  {
    id: 'ranking', source: 'old', type: '编程题',
    title: '结构体记录的多关键字排名',
    prompt: '输入 n（1 到 100），随后 n 行是唯一编号、胜场、积分。先按胜场降序，再按积分降序，同分则按编号升序。每行输出一个编号。',
    cases: [['4\n9 2 7\n1 1 8\n2 2 7\n5 2 8', '5\n2\n9\n1'], ['1\n42 0 0', '42']],
    hint: '把比较规则写成独立函数，交换整条记录。',
    steps: ['依次判断胜场、积分和编号，在第一个不同的字段上决定顺序。', '下例使用插入排序。每次把当前记录插入前面已排好的部分，最坏 O(n²)，适用于这道练习的 n。'],
    code: String.raw`
#include <stdio.h>

typedef struct {
    int id, wins, points;
} Team;

static int precedes(Team a, Team b) {
    if (a.wins != b.wins) return a.wins > b.wins;
    if (a.points != b.points) return a.points > b.points;
    return a.id < b.id;
}

int main(void) {
    int n;
    Team teams[100];
    scanf("%d", &n);
    for (int i = 0; i < n; ++i)
        scanf("%d%d%d", &teams[i].id, &teams[i].wins, &teams[i].points);

    for (int i = 1; i < n; ++i) {
        Team current = teams[i];
        int j = i;
        while (j > 0 && precedes(current, teams[j - 1])) {
            teams[j] = teams[j - 1];
            --j;
        }
        teams[j] = current;
    }
    for (int i = 0; i < n; ++i) printf("%d\n", teams[i].id);
    return 0;
}`
  },
  {
    id: 'closest-ceiling', source: 'cs', type: '函数题',
    title: '上限内的双计分选择',
    signature: 'int best_score(const int base[], int n, int flexible, int limit);',
    prompt: '先把 n 项基础分相加，基础分可由 n 个 0 到 100 的整数给出，n 最大为 20。另有 flexible 个加分项（0 到 5），每项可以取 2 分或 7 分。在不超过 limit 的前提下返回最高总分，无解返回 −1。样例中首行是 n、flexible、limit，第二行是 n 个基础分。',
    cases: [['3 2 21\n4 5 3', '21'], ['1 2 4\n1', '-1'], ['2 0 10\n2 3', '5']],
    hint: '让所有加分项先按 2 分计算。每把一项改成 7 分，总分就增加 5 分。',
    steps: ['最低总分超过上限时，无解。', '用剩余空间除以 5，得到可升级的数量上限，再和 flexible 取较小值。'],
    driver: String.raw`
int main(void) {
    int n, flexible, limit, base[20];
    scanf("%d%d%d", &n, &flexible, &limit);
    for (int i = 0; i < n; ++i) scanf("%d", &base[i]);
    printf("%d\n", best_score(base, n, flexible, limit));
}`,
    code: String.raw`
int best_score(const int base[], int n, int flexible, int limit) {
    int total = 2 * flexible;
    for (int i = 0; i < n; ++i) total += base[i];
    if (total > limit) return -1;

    long long upgrades = ((long long)limit - total) / 5;
    if (upgrades > flexible) upgrades = flexible;
    return total + 5 * (int)upgrades;
}`
  }
];
