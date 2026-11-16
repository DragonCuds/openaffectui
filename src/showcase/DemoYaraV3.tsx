import { useState } from 'react';
import { BandChart, Gauge, GaugeTrio, LivePill, MetricRow, Section, SensorPage, StatusLine, WeekBars, type BandChartPoint, type LivePillState } from '../ui';

/* Heart example of the «instrument» (v3) pieces: ضربان ۷۴, usual range ۵۸ تا ۸۸. */
const hrs = [62, 60, 58, 57, 56, 58, 61, 66, 72, 78, 75, 74, 80, 77, 73, 71, 76, 79, 74, 70, 68, 66, 64, 74];
const dayPoints: BandChartPoint[] = hrs.map((value, i) => ({ hour: i, value: i >= 13 && i <= 14 ? null : value }));
const week = [59, 58, 60, 57, 58, 61, 58];

const panel = { background: 'var(--v3-bg, #F2F3F4)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } as const;

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="v3" style={panel}>{children}</div>;
}

export default function DemoYaraV3() {
  const [live, setLive] = useState<LivePillState>('idle');
  const measure = () => {
    setLive('measuring');
    window.setTimeout(() => setLive('done'), 1800);
  };
  return (
    <>
      <Section title="گیج" hint="کمانِ ۲۷۰ درجه، باندِ سبز برای محدوده‌ی معمولِ آدم و فقط یک نقطه برای مقدارِ حالا. رنگِ نقطه معنا دارد: خوب سبز، بد نیست خاکستری، دیر کرده یا نیاز به نگاه کهربایی.">
        <Frame>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Gauge size="lg" value={74} min={40} max={140} bandLow={58} bandHigh={88} unit="در دقیقه" level="good" label="ضربان" />
            <Gauge value={74} min={40} max={140} bandLow={58} bandHigh={88} level="good" label="ضربان" />
            <Gauge value={97} text="۹۷٪" min={85} max={100} bandLow={95} bandHigh={100} level="check" late label="اکسیژن" />
            <Gauge value={6.87} text="۶:۵۲" min={3} max={11} bandLow={7} bandHigh={9} level="fair" label="خواب" />
            <Gauge value={null} min={40} max={140} bandLow={58} bandHigh={88} label="ضربان" />
          </div>
        </Frame>
      </Section>
      <Section title="خط وضعیت و دکمه‌ی زنده" hint="یک جمله با نقطه‌ی رنگی و یک تکه‌ی کوچک برای حلقه. دکمه‌ی اندازه‌گیری چهار حالت دارد؛ روی آن بزنید.">
        <Frame>
          <StatusLine text="همه‌چیز عادی است" chip="حلقه وصل · ۶۴٪" chipTone="calm" />
          <StatusLine text="یک چیز را ببین" tone="attn" chip="حلقه وصل نیست" chipTone="attn" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <LivePill state={live} name="ضربان" value="۷۶" unit="در دقیقه" onClick={live === 'done' ? () => setLive('idle') : measure} />
            <LivePill state="idle" name="اکسیژن" onClick={() => undefined} />
            <LivePill state="measuring" name="ضربان" />
            <LivePill state="done" name="ضربان" value="76" unit="در دقیقه" onClick={() => undefined} />
            <LivePill state="failed" name="اکسیژن" onClick={() => undefined} />
          </div>
        </Frame>
      </Section>
      <Section title="خانه: سه گیج و ردیف" hint="هر گیج یک دکمه است. زیرِ آن‌ها ردیف‌های ساده می‌آیند.">
        <Frame>
          <GaugeTrio
            gauges={[
              { id: 'hr', name: 'ضربان', word: 'خوب', value: 74, min: 40, max: 140, bandLow: 58, bandHigh: 88, level: 'good', onClick: () => undefined },
              { id: 'o2', name: 'اکسیژن', word: 'دیر کرده', value: 97, text: '۹۷٪', min: 85, max: 100, bandLow: 95, bandHigh: 100, level: 'check', late: true, onClick: () => undefined },
              { id: 'sl', name: 'خواب', word: 'بد نیست', value: 6.87, text: '۶:۵۲', min: 3, max: 11, bandLow: 7, bandHigh: 9, level: 'fair', onClick: () => undefined },
            ]}
          >
            <MetricRow name="حرکت" value="۴٬۲۱۰" unit="قدم" level="good" levelText="خوب" onClick={() => undefined} />
            <MetricRow name="دمای پوست" value="۳۴٫۶" unit="درجه" level="good" levelText="خوب" onClick={() => undefined} />
          </GaugeTrio>
        </Frame>
      </Section>
      <Section title="نمودار روز و هفته" hint="باندِ سبز محدوده‌ی معمول است؛ جای داده‌ی نیامده خالی می‌ماند و نقطه‌ی آخر نشان می‌دهد الان کجاییم. روزِ امروز در هفته سبز است.">
        <Frame>
          <div className="v3-card"><BandChart points={dayPoints} bandLow={58} bandHigh={88} min={40} max={110} nowLabel="الان" label="ضربان امروز" /></div>
          <div className="v3-card"><WeekBars values={week} endWeekday={5} bandLow={55} bandHigh={65} label="ضربانِ آرام، هفت روزِ اخیر" /></div>
        </Frame>
      </Section>
      <Section title="صفحه‌ی یک حسگر" hint="هدر با برگشت و «؟»، گیجِ بزرگ، حالت و زمان، یک جمله، دکمه و بخش‌ها. وسطِ صفحه، تا ۵۶۰ پیکسل.">
        <Frame>
          <SensorPage
            title="ضربان" onBack={() => undefined} onHelp={() => undefined}
            gauge={{ value: 74, min: 40, max: 140, bandLow: 58, bandHigh: 88, unit: 'در دقیقه', level: 'good' }}
            stateText="خوب" time="۷ دقیقه پیش"
            sentence="داخلِ محدوده‌ی معمولِ حسین است: ۵۸ تا ۸۸."
            action={{ label: 'اندازه بگیر', onClick: () => undefined }}
            sections={[
              { title: 'امروز', aside: 'کمترین ۵۶ · بیشترین ۸۰', children: <BandChart points={dayPoints} bandLow={58} bandHigh={88} min={40} max={110} nowLabel="الان" label="ضربان امروز" /> },
              { title: 'ضربانِ آرام، هفت روزِ اخیر', children: <WeekBars values={week} endWeekday={5} label="ضربانِ آرام، هفت روزِ اخیر" /> },
            ]}
          />
        </Frame>
      </Section>
    </>
  );
}
