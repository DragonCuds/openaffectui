import { Section } from '../ui';
import { HrDayChart } from '../ui/HrDayChart';

const D = '2026-11-08';
const iso = (h: number, m = 0) => `${D}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+03:30`;

/** One sample day: calm night with sleep, active day, a two-hour hole in the afternoon. */
const points = (() => {
  const out: { ts: string; value: number }[] = [];
  for (let min = 0; min < 24 * 60; min += 10) {
    const h = Math.floor(min / 60); const m = min % 60;
    if (h >= 14 && h < 16) continue; // ring was off
    const night = h < 7 || h >= 23;
    const base = night ? 56 : 74;
    out.push({ ts: iso(h, m), value: Math.round(base + 8 * Math.sin(min / 37) + (h >= 17 && h < 18 ? 22 : 0)) });
  }
  return out;
})();
const sleep = [
  { start: iso(0, 0), end: iso(1, 30), stage: 'light' }, { start: iso(1, 30), end: iso(3, 30), stage: 'deep' },
  { start: iso(3, 30), end: iso(4, 30), stage: 'rem' }, { start: iso(4, 30), end: iso(6, 20), stage: 'light' },
  { start: iso(23, 15), end: iso(24, 0), stage: 'light' },
];

export default function DemoHrDay() {
  return (
    <Section title="ضربان در یک روز" hint="ساعت تهران؛ شب ۲۲ تا ۷ خاکستری، خواب آبی. اگر داده‌ای نباشد خط قطع می‌شود. روی نمودار حرکت کنید.">
      <HrDayChart points={points} from={iso(0)} to="2026-11-09T00:00:00+03:30" sleep={sleep} normalLow={54} normalHigh={84} />
    </Section>
  );
}
