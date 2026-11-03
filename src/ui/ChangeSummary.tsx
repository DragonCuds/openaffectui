import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { RollingNumber } from './RollingNumber';
import { faNum } from './digits';

export type ChangeItem = { id: string; label: string; before: number; after: number; unit?: string; lowerIsBetter?: boolean };

type Verdict = 'good' | 'bad' | 'same';

/** A before-and-after list: each row shows the two numbers, the difference, and whether it is good news (icon and words, never colour alone). */
export function ChangeSummary({ items, title = 'خلاصه‌ی تغییرها' }: { items: ChangeItem[]; title?: string }) {
  if (!items || items.length === 0) {
    return (
      <div className="chg chg-empty-wrap">
        <p className="chg-empty">هنوز تغییری ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="chg">
      <p className="chg-title">{title}</p>
      <ul className="chg-list">
        {items.map((it) => {
          const delta = Math.round((it.after - it.before) * 10000) / 10000;
          const dir: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
          const verdict: Verdict = dir === 'flat' ? 'same' : (dir === 'up') !== !!it.lowerIsBetter ? 'good' : 'bad';
          const Icon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;
          const word = dir === 'up' ? 'بیشتر شد' : dir === 'down' ? 'کمتر شد' : 'تغییری نکرد';
          const meaning = verdict === 'good' ? 'تغییر خوب' : verdict === 'bad' ? 'تغییر بد' : '';
          const sign = dir === 'up' ? '+' : dir === 'down' ? '−' : '';
          return (
            <li key={it.id} className={`chg-row chg-${verdict}`}>
              <span className="chg-label">{it.label}</span>
              <p className="chg-figures">
                <span className="chg-num chg-before"><span className="chg-sr">قبل: </span><RollingNumber value={it.before} /></span>
                <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" className="chg-arrow" />
                <span className="chg-num chg-after"><span className="chg-sr">بعد: </span><RollingNumber value={it.after} /></span>
                {it.unit ? <span className="chg-unit">{it.unit}</span> : null}
              </p>
              <span className="chg-delta">
                <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                {dir !== 'flat' ? <bdi className="chg-amount">{sign}{faNum(Math.abs(delta))}</bdi> : null}
                {dir !== 'flat' && it.unit ? <span className="chg-unit">{it.unit}</span> : null}
                <span>{word}</span>
                {meaning ? <span className="chg-meaning">· {meaning}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
