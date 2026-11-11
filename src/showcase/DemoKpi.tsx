import { Section } from '../ui';
import { KpiChart, type KpiSeries } from '../ui/KpiChart';
import { JALALI_MONTHS, WEEKDAYS_LONG, jalaliWeekday, toGregorian, toJalali } from '../ui/jalali';
import { faNum } from '../ui/digits';

/** 14 days ending on 1405/08/12 (آبان): short labels for the axis, long ones for the tooltip. */
const DAYS = 14;
const END = toGregorian(1405, 8, 12);
const days = Array.from({ length: DAYS }, (_, i) => {
  const d = new Date(END);
  d.setDate(END.getDate() - (DAYS - 1 - i));
  const j = toJalali(d);
  const short = `${faNum(j.jd)} ${JALALI_MONTHS[j.jm - 1]}`;
  return { short, long: `${WEEKDAYS_LONG[jalaliWeekday(d)]}، ${short}` };
});
const labels = days.map((d) => d.short);
const tooltipLabels = days.map((d) => d.long);

const wave = (base: number, amp: number, seed: number, trend: number): number[] =>
  Array.from({ length: DAYS }, (_, i) => Math.round(base + trend * i + amp * Math.sin(i * 0.9 + seed) + amp * 0.4 * Math.cos(i * 2.1 + seed * 2)));

const CHANNELS: KpiSeries[] = [
  { label: 'جست‌وجوی گوگل', color: '#2f6bff', values: wave(4200, 700, 0.3, 90) },
  { label: 'شبکه‌های اجتماعی', color: '#ec4899', values: wave(3100, 600, 1.8, 40) },
  { label: 'ورود مستقیم', color: '#14b8a6', values: wave(1700, 380, 3.1, 25) },
];

const toman = (n: number) =>
  Math.abs(n) >= 1000
    ? `${(Math.round(n / 100) / 10).toLocaleString('fa-IR')} هزار`
    : n.toLocaleString('fa-IR');

const sumLast = CHANNELS.reduce((a, s) => a + (s.values[DAYS - 1] ?? 0), 0);
const sumPrev = CHANNELS.reduce((a, s) => a + (s.values[DAYS - 2] ?? 0), 0);

/** Samples for the showcase: three lines, one line, nothing yet, a drop. */
export default function DemoKpi() {
  return (
    <>
      <Section title="نمودار شاخص: چند خط">
        <KpiChart
          title="بازدید کل"
          value={`${(sumLast * 14 / 1000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} هزار`}
          delta={sumLast - sumPrev + 2900}
          labels={labels}
          tooltipLabels={tooltipLabels}
          series={CHANNELS}
          format={toman}
          footer="سه کانال اصلی در ۱۴ روز گذشته"
        />
      </Section>

      <Section title="یک خط، با نقطه‌ی پیش‌فرض">
        <KpiChart
          title="سفارش روزانه"
          value="۱٬۲۴۰"
          delta={86}
          labels={labels.slice(0, 7)}
          tooltipLabels={tooltipLabels.slice(0, 7)}
          series={[{ label: 'سفارش', color: '#8b5cf6', values: [128, 141, 135, 162, 171, 168, 193] }]}
          format={(n) => n.toLocaleString('fa-IR')}
          defaultIndex={6}
          footer="هفته‌ی جاری"
        />
      </Section>

      <Section title="هنوز داده‌ای نیست">
        <KpiChart
          title="فروش افزونه"
          value="۰"
          labels={labels.slice(0, 7)}
          series={[{ label: 'فروش', color: '#2f6bff', values: [0, 0, 0, 0, 0, 0, 0] }]}
          footer="از وقتی افزونه فعال شد"
        />
      </Section>

      <Section title="کاهش نسبت به دوره‌ی قبل">
        <KpiChart
          title="نرخ تبدیل"
          value="٪۲٫۸"
          delta={-0.6}
          labels={labels.slice(0, 10)}
          tooltipLabels={tooltipLabels.slice(0, 10)}
          series={[
            { label: 'موبایل', color: '#ec4899', values: [3.9, 3.7, 3.8, 3.4, 3.2, 3.3, 3.0, 2.9, 2.8, 2.7] },
            { label: 'دسکتاپ', color: '#2f6bff', values: [4.6, 4.5, 4.7, 4.4, 4.5, 4.1, 4.0, 4.2, 3.8, 3.7] },
          ]}
          format={(n) => `${n.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`}
          footer="۱۰ روز گذشته"
        />
      </Section>

      <Section title="روز نامعلوم، روز تازه و علامت تغییر">
        <KpiChart
          title="کلیک از گوگل"
          labels={labels}
          tooltipLabels={tooltipLabels}
          series={[
            { label: 'کلیک', color: '#2f6bff', values: [120, 132, 128, null, null, 141, 150, 147, 160, null, 171, 168, 175, 181] },
          ]}
          format={(n) => n.toLocaleString('fa-IR')}
          freshFrom={12}
          marks={[{ index: 6, label: 'این روز صفحه رو عوض کردیم' }, { index: 10, label: 'این روز یه صفحه رو عوض کردیم' }]}
          footer="جای خالی یعنی نامعلوم، نه صفر. دو روز آخر هنوز کامل نیست."
        />
      </Section>
    </>
  );
}
