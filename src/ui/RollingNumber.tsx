import { useEffect, useState, type CSSProperties } from 'react';
import { faNum } from './digits';

const FA = '۰۱۲۳۴۵۶۷۸۹'.split('');
const EN = '0123456789'.split('');

function digitOf(c: string): { d: number; set: string[] } | null {
  const fa = FA.indexOf(c);
  if (fa >= 0) return { d: fa, set: FA };
  const en = EN.indexOf(c);
  if (en >= 0) return { d: en, set: EN };
  return null;
}

export function RollingNumber({ value, format = faNum }: { value: number; format?: (n: number) => string }) {
  const text = format(value);
  const chars = [...text];
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span className="rn" role="img" aria-label={text}>
      {chars.map((c, i) => {
        const key = chars.length - i; // keyed from the end so cells keep identity when length changes
        const dg = digitOf(c);
        if (!dg) return <span key={key} className="rn-sep" aria-hidden="true">{c}</span>;
        return (
          <span key={key} className="rn-cell" aria-hidden="true">
            <span className="rn-strip" style={{ '--d': on ? dg.d : 0 } as CSSProperties}>
              {dg.set.map((x) => <span key={x}>{x}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
