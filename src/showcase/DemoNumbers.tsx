import { Section } from '../ui';
import { ChangeSummary } from '../ui/ChangeSummary';
import { KpiChart } from '../ui/KpiChart';
import { CompactBreakdown } from '../ui/CompactBreakdown';

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const VISITS = [1200, 1350, 1280, 1500, 1720, 1690, 1950, 2100, 2040, 2380, 2560, 2740];

/** Change summary, KPI chart and breakdown samples for the showcase. */
export default function DemoNumbers() {
  return (
    <>
      <Section title="خلاصه‌ی تغییرها">
        <ChangeSummary
          items={[
            { id: 'clicks', label: 'کلیک از گوگل', before: 340, after: 400, unit: 'کلیک' },
            { id: 'rank', label: 'رتبه‌ی عبارت اصلی', before: 12, after: 7, lowerIsBetter: true },
            { id: 'speed', label: 'زمان بارگذاری', before: 3.5, after: 3.6, unit: 'ثانیه', lowerIsBetter: true },
            { id: 'pages', label: 'صفحه‌های بررسی‌شده', before: 80, after: 80 },
          ]}
        />
        <ChangeSummary items={[]} />
      </Section>

      <Section title="نمودار شاخص">
        <KpiChart title="بازدید ماهانه" unit="بازدید" kind="area" points={MONTHS.map((label, i) => ({ label, value: VISITS[i] }))} />
        <KpiChart title="رتبه‌ی میانگین" kind="line" points={[
          { label: 'هفته‌ی ۱', value: 14 },
          { label: 'هفته‌ی ۲', value: 12 },
          { label: 'هفته‌ی ۳', value: 13 },
          { label: 'هفته‌ی ۴', value: 9 },
          { label: 'هفته‌ی ۵', value: 7 },
        ]} />
        <KpiChart title="بازدید روزانه" unit="بازدید" points={[{ label: 'امروز', value: 86 }]} />
        <KpiChart title="کلیک ماهانه" points={[]} />
      </Section>

      <Section title="سهم هر بخش">
        <CompactBreakdown
          title="مصرف اعتبار این ماه"
          unit="اعتبار"
          parts={[
            { id: 'audit', label: 'بررسی سایت', value: 420 },
            { id: 'write', label: 'نوشتن محتوا', value: 260 },
            { id: 'links', label: 'لینک‌سازی', value: 90 },
            { id: 'other', label: 'سایر', value: 12 },
          ]}
        />
        <CompactBreakdown title="مصرف اعتبار ماه قبل" unit="اعتبار" parts={[{ id: 'a', label: 'بررسی سایت', value: 0 }, { id: 'b', label: 'نوشتن محتوا', value: 0 }]} />
      </Section>
    </>
  );
}
