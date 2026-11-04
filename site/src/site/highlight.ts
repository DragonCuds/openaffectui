/** Tiny dependency-free highlighter for tsx / css / bash. Returns escaped HTML. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const KW = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'type', 'interface', 'extends', 'new', 'as', 'await', 'async', 'typeof', 'keyof', 'in', 'of', 'null', 'undefined',
  'true', 'false', 'void', 'this', 'class', 'switch', 'case', 'break', 'try', 'catch', 'throw', 'readonly',
]);

const TS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(<\/?)([A-Za-z][\w.]*)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)\b(?=\s*\()|\b([A-Za-z_$][\w$]*)\b/g;
const CSS = /(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(--[\w-]+)|(@[\w-]+)|(#[0-9a-fA-F]{3,8}\b)|\b(\d+(?:\.\d+)?(?:px|ms|s|%|rem|em|ch|deg|fr|vh|vw)?)\b|([\w-]+)(?=\s*:[^;{]*;)/g;
const SH = /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(^|\s)(npm|npx|pnpm|cd|cp|git|mkdir)\b|(\s--?[\w-]+)/gm;

const span = (cls: string, s: string) => `<span class="tk-${cls}">${esc(s)}</span>`;

function run(src: string, re: RegExp, fn: (m: RegExpExecArray) => string) {
  let out = '';
  let last = 0;
  re.lastIndex = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m[0] === '') { re.lastIndex++; continue; }
    out += esc(src.slice(last, m.index)) + fn(m);
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

export function highlight(src: string, lang: string): string {
  if (lang === 'css') {
    return run(src, CSS, (m) =>
      m[1] ? span('com', m[0]) : m[2] ? span('str', m[0]) : m[3] ? span('var', m[0]) : m[4] ? span('kw', m[0])
        : m[5] ? span('num', m[0]) : m[6] ? span('num', m[0]) : m[7] ? span('prop', m[0]) : esc(m[0]));
  }
  if (lang === 'bash' || lang === 'sh') {
    return run(src, SH, (m) =>
      m[1] ? span('com', m[0]) : m[2] ? span('str', m[0]) : m[4] ? esc(m[3]) + span('fn', m[4]) : m[5] ? span('prop', m[5]) : esc(m[0]));
  }
  return run(src, TS, (m) => {
    if (m[1]) return span('com', m[0]);
    if (m[2]) return span('str', m[0]);
    if (m[3]) return esc(m[3]) + span(/^[A-Z]/.test(m[4]) ? 'type' : 'tag', m[4]);
    if (m[5]) return span('num', m[0]);
    if (m[6]) return KW.has(m[6]) ? span('kw', m[0]) : span('fn', m[0]);
    if (m[7]) return KW.has(m[7]) ? span('kw', m[0]) : /^[A-Z]/.test(m[7]) ? span('type', m[0]) : esc(m[0]);
    return esc(m[0]);
  });
}

export const langOf = (file: string) => (file.endsWith('.css') ? 'css' : file.endsWith('.sh') ? 'bash' : 'tsx');
