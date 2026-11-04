import { Section, StatusDot, type Tone } from '@kit/ui';
import '@kit/showcase/showcase.css';

const TONES: { tone: Tone; text: string }[] = [
  { tone: 'ok', text: 'سالم' },
  { tone: 'busy', text: 'در حال کار' },
  { tone: 'warn', text: 'هشدار' },
  { tone: 'bad', text: 'خطا' },
  { tone: 'info', text: 'اطلاع' },
  { tone: 'quiet', text: 'ساکت' },
];

/** StatusDot: every tone with its word, and a small service list. */
export default function DemoStatusDot() {
  return (
    <>
      <Section title="همه‌ی حالت‌ها" aside="busy آرام ضربان می‌زند">
        <div className="kit-row">
          {TONES.map((t) => (
            <span key={t.tone} className="kit-dot">
              <StatusDot tone={t.tone} />
              {t.text}
            </span>
          ))}
        </div>
      </Section>

      <Section title="فهرست سرویس‌ها" aside="نقطه کنار نام">
        <div className="kit-stack">
          <span className="kit-dot"><StatusDot tone="ok" /> سرور ارسال سالم است</span>
          <span className="kit-dot"><StatusDot tone="busy" /> همگام‌سازی پست‌ها</span>
          <span className="kit-dot"><StatusDot tone="bad" /> اتصال اینستاگرام قطع شد</span>
        </div>
      </Section>
    </>
  );
}
