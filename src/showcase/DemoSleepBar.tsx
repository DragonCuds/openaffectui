import { Section } from '../ui';
import { SleepBar, type SleepBarSegment } from '../ui/SleepBar';

const at = (day: string, h: number, m = 0) => `2026-11-${day}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+03:30`;

/** One night, 23:10 to 6:40, with two short wake-ups in the middle. */
const NIGHT: SleepBarSegment[] = [
  { start: at('08', 23, 10), end: at('09', 0, 10), stage: 'light' },
  { start: at('09', 0, 10), end: at('09', 1, 40), stage: 'deep' },
  { start: at('09', 1, 40), end: at('09', 1, 50), stage: 'awake' },
  { start: at('09', 1, 50), end: at('09', 3, 20), stage: 'rem' },
  { start: at('09', 3, 20), end: at('09', 4, 20), stage: 'deep' },
  { start: at('09', 4, 20), end: at('09', 4, 30), stage: 'awake' },
  { start: at('09', 4, 30), end: at('09', 5, 40), stage: 'light' },
  { start: at('09', 5, 40), end: at('09', 6, 40), stage: 'rem' },
  { start: at('09', 6, 40), end: at('09', 6, 40), stage: 'light' }, // zero width: skipped
];

const LABELS = { awake: 'بیدار', light: 'خوابِ سبک', deep: 'خوابِ عمیق', rem: 'خوابِ رؤیا' };

export default function DemoSleepBar() {
  return (
    <>
      <Section title="مرحله‌های خواب" hint="نوار از ساعت شروع تا ساعت پایان، راست به چپ مثل نمودار ضربان. برچسب‌ها از بیرون می‌آیند.">
        <SleepBar segments={NIGHT} labels={LABELS} notes={{ awake: '۲۰ دقیقه' }} ariaLabel="خواب از ۲۳:۱۰ تا ۶:۴۰، دو بار بیدار شد" />
      </Section>
      <Section title="بدون داده" hint="لیست خالی هیچ نمی‌کشد، یا همان چیزی که بدهید.">
        <SleepBar segments={[]} labels={LABELS} ariaLabel="خواب" empty={<p className="muted">از دیشب داده‌ی خواب نرسیده.</p>} />
      </Section>
    </>
  );
}
