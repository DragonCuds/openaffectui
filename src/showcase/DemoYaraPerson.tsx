import { PersonCard, Section, YaraIcon } from '../ui';

const metrics = [
  { label: 'ضربان', value: '72', icon: <YaraIcon name="heart" size={18} filled />, area: 'heart' as const, spark: [74, 72, 76, 81, 78, 73, 70, 69, 72] },
  { label: 'اکسیژن', value: '97', unit: '٪', icon: <YaraIcon name="oxygen" size={18} />, area: 'oxygen' as const, spark: [97, 97, 96, 97, 98, 97, 96, 97] },
  { label: 'قدم', value: '5234', icon: <YaraIcon name="steps" size={18} />, area: 'steps' as const, spark: [0, 300, 900, 1800, 2900, 3800, 5234] },
];

export default function DemoYaraPerson() {
  return (
    <Section title="کارتِ یک نفر" hint="کلِ کارت لینک است. ساده: وضعیت به شکلِ برچسب؛ «قهرمان»: وضعیت تیترِ بزرگ روی زمینه‌ی رنگی. تا سه عددِ کوچک.">
      <div className="kit-person-grid">
        <PersonCard name="حسین احمدی" href="#" caption="آخرین خبر ۴ دقیقه پیش" state="حالش" stateAccent="خوب است" metrics={metrics} />
        <PersonCard name="حسین احمدی" href="#" hero caption="آخرین خبر ۴ دقیقه پیش" state="حالِ حسین" stateAccent="خوب است" metrics={metrics} />
        <PersonCard name="مریم کریمی" href="#" tone="attn" caption="۲ ساعت پیش" live={false} state="لطفاً چک کنید" metrics={metrics.slice(0, 2)} />
        <PersonCard name="رضا" onClick={() => undefined} caption="بدون خبرِ تازه" live={false} />
      </div>
    </Section>
  );
}
