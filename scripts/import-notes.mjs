import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const input = process.argv[2];
if (!input) throw new Error('Usage: npm run import-notes -- <study notes.md>');

const source = (await readFile(input, 'utf8')).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const lines = source.split('\n').map((line) => {
  if (line.startsWith('题目来源：用户提供')) {
    const exercise = line.match(/\*\*(7-\d+)\*\*/)?.[1];
    return exercise ? '题目出处为课程函数练习，题号 **' + exercise + '**。' : '';
  }
  if (line.startsWith('本文随做题积累相关知识。')) {
    return '本章整理函数练习的概念、关键写法和易错点。';
  }
  if (line.startsWith('此前聊天的递归版曾在评测中显示段错误。')) {
    return '改写成递归 DFS 时，检查递归深度、数组边界和读取地址。';
  }
  return line.replace(/完整答案见聊天，这里整理相关知识。|完整答案见聊天。|完整修改代码见聊天。|完整解题代码见聊天。|修改后的代码见聊天。|完整代码见聊天。/g, '')
    .replace('没有相邻同色星星时为 0，聊天截图样例为 245。', '没有相邻同色星星时为 0。')
    .replace('本节按你提供的《期中考试概念与单选简答全考点汇总》整理。', '本节按《期中考试概念与单选简答全考点汇总》整理。')
    .replace(/[ \t]+$/, '');
});

const cleaned = lines.join('\n').trimEnd() + '\n';
const privateMarker = /(?:[A-Z]:[\\/]|file:\/\/|gh[opurs]_[A-Za-z0-9]{20,}|github_pat_|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|聊天|截图|用户提供)/;
const findings = lines.flatMap((line, index) => privateMarker.test(line) ? [index + 1] : []);
if (findings.length) throw new Error('Review local references before publishing, lines: ' + findings.join(', '));
if (!cleaned.includes('## 递归与位运算专题')) throw new Error('The source is missing the recursion chapter.');

const destination = new URL('../notes/', import.meta.url);
await mkdir(destination, { recursive: true });
await writeFile(fileURLToPath(new URL('c-study-notes.md', destination)), cleaned);
console.log('Imported ' + lines.length + ' lines of public study notes.');
