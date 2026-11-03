import { useMemo, useState } from 'react';
import { Segmented } from './Segmented';
import { faNum } from './digits';

type Op = { kind: 'same' | 'del' | 'add'; text: string };
type Mode = 'inline' | 'split';

const MODES: { value: Mode; label: string }[] = [
  { value: 'inline', label: 'یکپارچه' },
  { value: 'split', label: 'کنار هم' },
];

/** Words with their trailing spaces kept, so joining the tokens gives the text back. */
const tokenize = (s: string): string[] => s.trim().match(/\S+\s*/g) ?? [];
const key = (t: string) => t.trim();

/** Word-level diff through a longest-common-subsequence table. Adjacent ops of one kind are merged into a run. */
function diffWords(before: string, after: string): Op[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const n = a.length;
  const m = b.length;
  const ops: Op[] = [];
  const push = (kind: Op['kind'], text: string) => {
    const last = ops[ops.length - 1];
    if (last && last.kind === kind) last.text += text;
    else ops.push({ kind, text });
  };

  // Very large inputs: skip the table and show a full replacement.
  if (n * m > 4_000_000) {
    if (n) push('del', a.join(''));
    if (m) push('add', b.join(''));
    return ops;
  }

  const w = m + 1;
  const t = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      t[i * w + j] = key(a[i]) === key(b[j]) ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (key(a[i]) === key(b[j])) { push('same', b[j]); i++; j++; }
    else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) { push('del', a[i]); i++; }
    else { push('add', b[j]); j++; }
  }
  while (i < n) push('del', a[i++]);
  while (j < m) push('add', b[j++]);
  return ops;
}

const countWords = (s: string) => tokenize(s).length;

function Run({ op }: { op: Op }) {
  if (op.kind === 'same') return <>{op.text}</>;
  const del = op.kind === 'del';
  const body = (
    <>
      <span className="diff-sr">{del ? 'حذف شده: ' : 'اضافه شده: '}</span>
      {op.text.trimEnd()}
      <span className="diff-tag" aria-hidden="true">{del ? 'حذف' : 'اضافه'}</span>
      {op.text.slice(op.text.trimEnd().length)}
    </>
  );
  return del ? <del className="diff-del">{body}</del> : <ins className="diff-add">{body}</ins>;
}

/** Word-level before/after comparison. Marks are text and shape, never colour alone. */
export function InlineDiff({ before, after, mode = 'inline' }: {
  before: string;
  after: string;
  mode?: Mode;
}) {
  const [view, setView] = useState<Mode>(mode);
  const ops = useMemo(() => diffWords(before, after), [before, after]);
  const added = useMemo(() => ops.filter((o) => o.kind === 'add').reduce((s, o) => s + countWords(o.text), 0), [ops]);
  const removed = useMemo(() => ops.filter((o) => o.kind === 'del').reduce((s, o) => s + countWords(o.text), 0), [ops]);
  const same = added === 0 && removed === 0;

  const parts: string[] = [];
  if (added) parts.push(`${faNum(added)} کلمه اضافه`);
  if (removed) parts.push(`${faNum(removed)} کلمه حذف`);

  return (
    <div className="diff">
      <div className="diff-head">
        <p className="diff-summary" aria-live="polite">{same ? 'تغییری نیست' : parts.join('، ')}</p>
        {same ? null : <Segmented label="حالت نمایش تغییرها" value={view} options={MODES} onChange={setView} />}
      </div>

      {same ? (
        <p className="diff-text diff-text-same" dir="auto">{after || '—'}</p>
      ) : view === 'inline' ? (
        <p className="diff-text" dir="auto">
          {ops.map((o, i) => <Run key={i} op={o} />)}
        </p>
      ) : (
        <div className="diff-split">
          <div className="diff-col">
            <h4 className="diff-col-title">قبل</h4>
            <p className="diff-text" dir="auto">
              {before.trim() ? ops.filter((o) => o.kind !== 'add').map((o, i) => <Run key={i} op={o} />) : '—'}
            </p>
          </div>
          <div className="diff-col">
            <h4 className="diff-col-title">بعد</h4>
            <p className="diff-text" dir="auto">
              {after.trim() ? ops.filter((o) => o.kind !== 'del').map((o, i) => <Run key={i} op={o} />) : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
