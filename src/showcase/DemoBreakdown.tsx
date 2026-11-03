import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Section } from '../ui';
import { CompactBreakdown, type BreakdownItem } from '../ui/CompactBreakdown';
import { faNum } from '../ui/digits';

const PERIODS = [
  { id: '7d', label: '۷ روز' },
  { id: '30d', label: '۳۰ روز' },
  { id: '90d', label: '۹۰ روز' },
];

/* the same ids in every period: rows trade places, one part folds away (voice is missing in 90 days) */
const DATA: Record<string, { items: BreakdownItem[]; delta: number }> = {
  '7d': {
    delta: 12.4,
    items: [
      { id: 'chat', label: 'گفت‌وگو', value: 4820 },
      { id: 'search', label: 'جست‌وجوی وب', value: 3910 },
      { id: 'image', label: 'ساخت تصویر', value: 2240 },
      { id: 'voice', label: 'صدا', value: 1680 },
      { id: 'api', label: 'دسترسی API', value: 940 },
    ],
  },
  '30d': {
    delta: -3.2,
    items: [
      { id: 'chat', label: 'گفت‌وگو', value: 16900 },
      { id: 'search', label: 'جست‌وجوی وب', value: 18400 },
      { id: 'image', label: 'ساخت تصویر', value: 7300 },
      { id: 'voice', label: 'صدا', value: 9800 },
      { id: 'api', label: 'دسترسی API', value: 5200 },
    ],
  },
  '90d': {
    delta: 8,
    items: [
      { id: 'chat', label: 'گفت‌وگو', value: 36100 },
      { id: 'search', label: 'جست‌وجوی وب', value: 51200 },
      { id: 'image', label: 'ساخت تصویر', value: 16900 },
      { id: 'api', label: 'دسترسی API', value: 21400 },
      { id: 'files', label: 'تحلیل فایل', value: 38600 },
    ],
  },
};

const fmt = (n: number) => faNum(Math.round(n));

/** Compact breakdown samples: a period switch that reshuffles the parts, an empty card and a custom tray. */
export default function DemoBreakdown() {
  const [period, setPeriod] = useState('7d');
  const d = DATA[period];
  const [shown, setShown] = useState('');

  return (
    <>
      <Section title="تفکیک مصرف">
        <CompactBreakdown
          title="مصرف هر قابلیت"
          periods={PERIODS}
          period={period}
          onPeriodChange={setPeriod}
          items={d.items}
          delta={d.delta}
          format={fmt}
          totalLabel="کل اعتبار مصرف‌شده"
        />
      </Section>

      <Section title="بدون داده">
        <CompactBreakdown
          title="مصرف هر قابلیت"
          periods={PERIODS}
          defaultPeriod="7d"
          items={[]}
          format={fmt}
          totalLabel="کل اعتبار مصرف‌شده"
        />
      </Section>

      <Section title="با پانوشت دلخواه">
        <CompactBreakdown
          title="درخواست‌ها به تفکیک مدل"
          items={[
            { id: 'fast', label: 'مدل سریع', value: 128400 },
            { id: 'pro', label: 'مدل حرفه‌ای', value: 41200 },
            { id: 'vision', label: 'مدل تصویر', value: 9300 },
          ]}
          delta={0}
          format={fmt}
          totalLabel="کل درخواست‌ها"
          footer={(
            <button type="button" className="bkd-foot-btn" onClick={() => setShown('گزارش کامل باز می‌شود.')}>
              گزارش کامل <ChevronLeft size={14} aria-hidden="true" />
            </button>
          )}
        />
        {shown ? <p className="muted" role="status">{shown}</p> : null}
      </Section>
    </>
  );
}
