import { useState } from 'react';
import { Section } from '@kit/ui';
import { DateRangePicker, type DateRange } from '../ui/DateRangePicker';
import { formatJalali } from '../ui/jalali';

/** Controlled Jalali range picker plus a line echoing the chosen range. */
export default function DemoRange() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <Section title="بازه تاریخ">
      <div style={{ minBlockSize: 420 }}>
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      <p className="section-aside" aria-live="polite">
        {range.start && range.end
          ? `بازه انتخاب‌شده: ${formatJalali(range.start)} تا ${formatJalali(range.end)}`
          : 'هنوز بازه‌ای انتخاب نشده است.'}
      </p>
    </Section>
  );
}
