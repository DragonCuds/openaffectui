import { useState } from 'react';
import { Section } from '@kit/ui';
import { DateRangePicker, compareRangeOf, formatRangeFa, type CompareMode, type DateRange } from '../ui/DateRangePicker';

const MODE_FA: Record<CompareMode, string> = { off: 'خاموش', previous: 'دوره‌ی قبل', year: 'سال قبل' };
const DAY = 86_400_000;
const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Controlled Jalali range picker plus lines echoing the applied range and its comparison range. */
export default function DemoRange() {
  const today = sod(new Date());
  const [range, setRange] = useState<DateRange>({ start: new Date(today.getTime() - 29 * DAY), end: today });
  const [mode, setMode] = useState<CompareMode>('off');
  const [cmp, setCmp] = useState<DateRange | null>(null);
  return (
    <Section title="بازه تاریخ">
      <div style={{ minBlockSize: 480 }}>
        <DateRangePicker
          value={range}
          defaultCompare="off"
          onChange={(r, c, m) => { setRange(r); setCmp(c ?? compareRangeOf(r, m)); setMode(m); }}
        />
      </div>
      <p className="section-aside" aria-live="polite">
        بازه‌ی انتخاب‌شده: {formatRangeFa(range)}
        {' — '}
        مقایسه ({MODE_FA[mode]}): {cmp ? formatRangeFa(cmp) : 'ندارد'}
      </p>
    </Section>
  );
}
