import { MetricTile, Section, Sparkline, YaraIcon } from '../ui';

const heart = [72, 70, 68, 75, 82, 78, 74, 70, 66, 69, 73, 71];
const steps = [100, 400, 900, 1500, 2100, 2800, 3600, 4200, 5234];

export default function DemoYaraMetric() {
  return (
    <>
      <Section title="کاشیِ اندازه‌گیری" hint="دو تا در هر ردیف. عدد درشت، واحد کوچک و خاکستری؛ می‌تواند نمودارِ کوچک یا نوارِ پیشرفت داشته باشد.">
        <div className="kit-metric-grid">
          <MetricTile label="ضربان" value="72" unit="در دقیقه" icon={<YaraIcon name="heart" size={18} filled />} area="heart" spark={heart} caption="۴ دقیقه پیش" />
          <MetricTile label="اکسیژن خون" value="97" unit="٪" icon={<YaraIcon name="oxygen" size={18} />} area="oxygen" caption="در حدِ همیشگی" />
          <MetricTile label="خواب دیشب" value="7" unit="ساعت" value2="15" unit2="دقیقه" icon={<YaraIcon name="sleep" size={18} filled />} area="sleep" caption="۲۳:۱۰ تا ۶:۲۵" />
          <MetricTile label="قدم" value="5234" icon={<YaraIcon name="steps" size={18} />} area="steps" progress={0.65} caption="از هدفِ ۸٬۰۰۰" />
          <MetricTile label="دمای پوست" value="عادی" icon={<YaraIcon name="temp" size={18} />} area="temp" caption="نزدیک به حالتِ همیشگی" />
          <MetricTile label="باتری حلقه" value="78" unit="٪" icon={<YaraIcon name="battery" size={18} />} area="neutral" progress={0.78} caption="تا فردا کافی است" />
        </div>
      </Section>
      <Section title="نمودارِ کوچک" hint="بدون محور. خط یا میله؛ تازه‌ترین مقدار سمتِ چپ است (جهتِ نمودارِ روز).">
        <div className="kit-metric-grid">
          <div style={{ color: 'var(--heart, #e5484d)' }}><Sparkline values={heart} endDot label="ضربان امروز" /></div>
          <div style={{ color: 'var(--steps, #12a37f)' }}><Sparkline values={steps} endDot /></div>
          <div style={{ color: 'var(--sleep, #6e5ce6)' }}><Sparkline values={[3, 5, 4, 7, 6, 8, 5]} style="bars" /></div>
        </div>
      </Section>
    </>
  );
}
