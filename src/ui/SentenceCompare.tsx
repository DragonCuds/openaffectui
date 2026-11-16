import { Fragment } from 'react';
import { Segmented } from './Segmented';
import { TextArea } from './TextArea';
import { Chip } from './Chip';

/**
 * A new version of a text set against the old one, sentence by sentence. Unchanged sentences flow as plain text;
 * a changed sentence is tinted and shows the original below it; an added sentence is tinted green with a small badge.
 * Each changed or added sentence has a three-way choice (keep / old or remove / edit) and, while editing, a text box.
 * The component only shows and reports: `picks` holds the choices (a sentence with no entry is "keep") and `onPick`
 * is called with the new choice. Plain text only. Styles in src/styles/sentencecompare.css.
 */

export type SentenceCompareKind = 'same' | 'changed' | 'added';
export type SentenceComparePickValue = 'new' | 'old' | 'edit';

export type SentenceCompareSentence = {
  id: string;
  /** The new text. */
  text: string;
  /** The old text (empty for an added sentence). */
  before: string;
  kind: SentenceCompareKind;
};

export type SentenceCompareBlock = {
  tag: 'h2' | 'h3' | 'p' | 'li';
  /** For `li` blocks: which list they belong to. Consecutive `li` blocks of the same kind share one list. Default 'ul'. */
  list?: 'ul' | 'ol';
  sentences: SentenceCompareSentence[];
};

export type SentenceComparePick = { pick: SentenceComparePickValue; text?: string };

export type SentenceCompareLabels = {
  /** Option that keeps the new sentence. */
  keep?: string;
  /** Option that goes back to the old sentence (changed sentences). */
  old?: string;
  /** Same option on an added sentence: drop it. */
  remove?: string;
  edit?: string;
  /** Shown before the original text under a changed sentence. */
  originalPrefix?: string;
  /** Small badge on an added sentence. */
  addedBadge?: string;
  /** Shown instead of an added sentence that is set to be removed. */
  removedNote?: string;
  editPlaceholder?: string;
  /** Accessible name of each three-way choice. */
  pickLabel?: string;
  /** Label of the text box while editing. */
  editLabel?: string;
};

const DEFAULT_LABELS: Required<Omit<SentenceCompareLabels, 'editPlaceholder'>> & { editPlaceholder?: string } = {
  keep: 'نگه دار',
  old: 'قبلی',
  remove: 'حذف',
  edit: 'ویرایش',
  originalPrefix: 'متن اصلی:',
  addedBadge: 'اضافه شد',
  removedNote: 'این جمله حذف می‌شود.',
  pickLabel: 'انتخاب برای این جمله',
  editLabel: 'جمله‌ی ویرایش‌شده',
};

export type SentenceCompareProps = {
  blocks: SentenceCompareBlock[];
  /** Choices by sentence id. No entry means 'new'. */
  picks: Record<string, SentenceComparePick>;
  onPick: (id: string, value: SentenceComparePick) => void;
  labels?: SentenceCompareLabels;
  /** Longest edited sentence. */
  editMax?: number;
  disabled?: boolean;
  /** Heading level used for `h2` blocks (`h3` blocks get one more). Default 3, so the page's own h1/h2 stay above. */
  headingLevel?: 2 | 3 | 4 | 5;
  className?: string;
};

type Run = { kind: 'same'; items: SentenceCompareSentence[] } | { kind: 'row'; s: SentenceCompareSentence };

const runsOf = (b: SentenceCompareBlock): Run[] => {
  const out: Run[] = [];
  for (const s of b.sentences) {
    if (s.kind === 'same') {
      const last = out[out.length - 1];
      if (last && last.kind === 'same') last.items.push(s); else out.push({ kind: 'same', items: [s] });
    } else out.push({ kind: 'row', s });
  }
  return out;
};

const groupLists = (blocks: SentenceCompareBlock[]): { list?: 'ul' | 'ol'; items: SentenceCompareBlock[] }[] => {
  const out: { list?: 'ul' | 'ol'; items: SentenceCompareBlock[] }[] = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.tag === 'li' && last && last.list === (b.list ?? 'ul')) last.items.push(b);
    else if (b.tag === 'li') out.push({ list: b.list ?? 'ul', items: [b] });
    else out.push({ items: [b] });
  }
  return out;
};

type Tx = 'p' | 'h2' | 'h3' | 'h4' | 'h5';

function Row({ s, tx, pick, onChange, L, editMax, disabled }: {
  s: SentenceCompareSentence; tx: Tx; pick: SentenceComparePick | undefined; onChange: (v: SentenceComparePick) => void;
  L: typeof DEFAULT_LABELS; editMax: number; disabled?: boolean;
}) {
  const Text = tx;
  const p: SentenceComparePickValue = pick?.pick ?? 'new';
  const added = s.kind === 'added';
  const options: { value: SentenceComparePickValue; label: string }[] = [
    { value: 'new', label: L.keep },
    { value: 'old', label: added ? L.remove : L.old },
    { value: 'edit', label: L.edit },
  ];
  return (
    <div className="sc-sen" data-kind={s.kind} data-pick={p}>
      <div className="sc-text">
        {p === 'edit' ? (
          <TextArea
            label={L.editLabel} value={pick?.text ?? s.text} onChange={(v) => onChange({ pick: 'edit', text: v })}
            placeholder={L.editPlaceholder} maxLength={editMax} rows={2} grow disabled={disabled}
          />
        ) : p === 'old' ? (
          <Text className="sc-t" data-muted={added ? '' : undefined} dir="auto">{added ? L.removedNote : s.before}</Text>
        ) : (
          <Text className="sc-t" dir="auto">
            {s.text}
            {added ? <> <Chip tone="ok">{L.addedBadge}</Chip></> : null}
          </Text>
        )}
        {s.kind === 'changed' && p === 'new' ? <p className="sc-before" dir="auto"><span>{L.originalPrefix}</span> {s.before}</p> : null}
      </div>
      <fieldset className="sc-ctl" disabled={disabled}>
        <Segmented<SentenceComparePickValue>
          label={L.pickLabel} size="sm" value={p} options={options}
          onChange={(v) => onChange(v === 'edit' ? { pick: 'edit', text: pick?.text ?? s.text } : { pick: v })}
        />
      </fieldset>
    </div>
  );
}

export function SentenceCompare({ blocks, picks, onPick, labels, editMax = 1000, disabled, headingLevel = 3, className }: SentenceCompareProps) {
  const L = { ...DEFAULT_LABELS, ...labels } as typeof DEFAULT_LABELS;
  const hx = (n: number): Tx => `h${Math.min(5, n)}` as Tx;

  const block = (b: SentenceCompareBlock) => {
    const tx: Tx = b.tag === 'h2' ? hx(headingLevel) : b.tag === 'h3' ? hx(headingLevel + 1) : 'p';
    const Same = tx;
    return (
      <div className="sc-blk" data-tag={b.tag}>
        {runsOf(b).map((r) => r.kind === 'same'
          ? <Same key={r.items[0].id} className="sc-same" dir="auto">{r.items.map((s) => s.text).join(' ')}</Same>
          : <Row key={r.s.id} s={r.s} tx={tx} pick={picks[r.s.id]} onChange={(v) => onPick(r.s.id, v)} L={L} editMax={editMax} disabled={disabled} />)}
      </div>
    );
  };

  return (
    <div className={className ? `sc ${className}` : 'sc'}>
      {groupLists(blocks).map((g, i) => {
        if (!g.list) return <Fragment key={i}>{block(g.items[0])}</Fragment>;
        const items = g.items.map((b, j) => <li key={j}>{block(b)}</li>);
        return g.list === 'ol' ? <ol key={i} className="sc-list">{items}</ol> : <ul key={i} className="sc-list">{items}</ul>;
      })}
    </div>
  );
}
