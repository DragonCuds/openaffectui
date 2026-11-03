import { useState } from 'react';
import { Section } from '../ui';
import { UsageMeter, type UsageDay, type UsagePart, type UsageLimit } from '../ui/UsageMeter';

type PeriodData = { used: UsagePart[]; limits: UsageLimit[]; daily: UsageDay[] };

const HOUR = 3_600_000;

/** Same shape every time: `filled` days that add up exactly to `sum`, the rest are days still to come. */
function makeDaily(n: number, filled: number, sum: number, seed: number, dayLabel: (i: number) => string): UsageDay[] {
  const raw = Array.from({ length: filled }, (_, i) => 0.45 + 0.55 * Math.abs(Math.sin((i + 1) * seed) * Math.cos(i * 0.7 + seed)));
  const k = sum / raw.reduce((a, b) => a + b, 0);
  const vals = raw.map((v) => Math.round(v * k));
  vals[vals.length - 1] += sum - vals.reduce((a, b) => a + b, 0);
  return Array.from({ length: n }, (_, i) => ({ label: dayLabel(i), value: i < filled ? vals[i] : null }));
}

const aban = (i: number) => `${(i + 1).toLocaleString('fa-IR')} آبان`;
const mehr = (i: number) => `${(i + 1).toLocaleString('fa-IR')} مهر`;
const last7 = (i: number) => ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'][i];

const DATA: Record<string, PeriodData> = {
  month: {
    used: [
      { label: 'گفت‌وگو', value: 3980 }, { label: 'جست‌وجو', value: 1640 },
      { label: 'تصویر', value: 1120 }, { label: 'API', value: 680 },
    ],
    limits: [
      { label: 'صندلی', used: 8, total: 10 },
      { label: 'فضا', used: 3.2, total: 5, unit: 'گیگابایت', decimals: 1 },
      { label: 'پروژه', used: 12, total: null },
    ],
    daily: makeDaily(30, 22, 7420, 1.7, aban),
  },
  last: {
    used: [
      { label: 'گفت‌وگو', value: 5210 }, { label: 'جست‌وجو', value: 2140 },
      { label: 'تصویر', value: 1690 }, { label: 'API', value: 960 },
    ],
    limits: [
      { label: 'صندلی', used: 10, total: 10 },
      { label: 'فضا', used: 2.9, total: 5, unit: 'گیگابایت', decimals: 1 },
      { label: 'پروژه', used: 11, total: null },
    ],
    daily: makeDaily(30, 30, 10000, 2.3, mehr),
  },
  week: {
    used: [
      { label: 'گفت‌وگو', value: 1260 }, { label: 'جست‌وجو', value: 540 }, { label: 'API', value: 340 },
    ],
    limits: [
      { label: 'صندلی', used: 8, total: 10 },
      { label: 'فضا', used: 3.2, total: 5, unit: 'گیگابایت', decimals: 1 },
      { label: 'پروژه', used: 12, total: null },
    ],
    daily: makeDaily(7, 7, 2140, 0.9, last7),
  },
};

const PERIODS = [
  { id: 'month', label: 'این ماه' },
  { id: 'last', label: 'ماه قبل' },
  { id: 'week', label: '۷ روز' },
];

const WARN: PeriodData = {
  used: [
    { label: 'گفت‌وگو', value: 4650 }, { label: 'جست‌وجو', value: 1900 },
    { label: 'تصویر', value: 1350 }, { label: 'API', value: 750 },
  ],
  limits: [
    { label: 'صندلی', used: 9, total: 10 },
    { label: 'فضا', used: 4.6, total: 5, unit: 'گیگابایت', decimals: 1 },
    { label: 'پروژه', used: 14, total: null },
  ],
  daily: makeDaily(30, 25, 8650, 1.3, aban),
};

/** Usage meter samples: the full card with a period switch, a card near the limit and a narrow card. */
export default function DemoUsage() {
  const [period, setPeriod] = useState('month');
  const [asked, setAsked] = useState('');
  const d = DATA[period];
  // the clock is fixed, so "۹ روز تا بازنشانی" stays true whenever the page is opened
  const [t0] = useState(() => Date.now());
  const resetAt = t0 + 8.2 * 24 * HOUR;

  return (
    <>
      <Section title="مصرف و اعتبار">
        <div className="kit-stack">
          <UsageMeter
            title="هوش آکمه"
            plan="پلن حرفه‌ای"
            total={10000}
            used={d.used}
            limits={d.limits}
            daily={d.daily}
            periods={PERIODS}
            period={period}
            onPeriodChange={setPeriod}
            resetAt={resetAt}
            now={t0}
            onUpgrade={(s) => setAsked(s === 'ok' ? 'صفحه‌ی پلن‌ها باز می‌شود.' : 'صفحه‌ی افزودن اعتبار باز می‌شود.')}
          />
          {asked ? <p className="muted" role="status">{asked}</p> : null}
        </div>
      </Section>

      <Section title="نزدیک سقف">
        <UsageMeter
          title="فضای کاری استودیو"
          plan="پلن تیمی"
          total={10000}
          used={WARN.used}
          limits={WARN.limits}
          daily={WARN.daily}
          resetAt={t0 + 3.2 * 24 * HOUR}
          now={t0}
          upgradeLabel="ارتقا"
          topUpLabel="افزودن اعتبار"
        />
      </Section>

      <Section title="کارت باریک">
        <div style={{ maxWidth: 340 }}>
          <UsageMeter
            title="دستیار نوشتن"
            plan="رایگان"
            total={2000}
            unit="کلمه"
            used={[{ label: 'متن', value: 640 }, { label: 'ترجمه', value: 310 }]}
            limits={[{ label: 'پروژه', used: 3, total: 5 }, { label: 'صندلی', used: 1, total: null }]}
            resetAt={t0 + 18 * 24 * HOUR}
            now={t0}
            upgradeLabel="ارتقا"
          />
        </div>
      </Section>
    </>
  );
}
