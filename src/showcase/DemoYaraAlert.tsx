import { AlertCard, BigButton, Section, SeenRow, YaraIcon } from '../ui';

export default function DemoYaraAlert() {
  return (
    <>
      <Section title="هشدارِ «لطفاً چک کنید»" hint="کهربایی، نه قرمز. یک جمله، کسانی که دیده‌اند، یک کارِ اصلی و یک کارِ آرام.">
        <div className="kit-person-grid">
          <AlertCard
            who="حسین احمدی" what="ضربان" whenText="14:02" title="لطفاً چک کنید"
            sentence="ضربانِ حسین حدودِ ۳۰ دقیقه بالاتر از حالتِ همیشگی بود و تکان کمی داشت."
            seenText="هنوز کسی پیگیری نکرده" primaryLabel="من پیگیری می‌کنم" onPrimary={() => undefined}
            quietLabel="تماس با حسین" onQuiet={() => undefined}
          />
          <AlertCard
            who="مریم کریمی" what="ضربان" whenText="14:02" title="لطفاً چک کنید"
            sentence="ضربانِ مریم بالاتر از حالتِ همیشگی بود."
            seenText="این‌ها دیده‌اند" primaryLabel="من پیگیری می‌کنم" onPrimary={() => undefined}
            seen={<><SeenRow name="سارا" time="14:05" /><SeenRow name="رضا" time="ندیده" seen={false} /></>}
          />
        </div>
      </Section>
      <Section title="دکمه‌ی بزرگ" hint="۵۶ پیکسل، گرد. اصلی، نرم، آرام، و «کمک» که فقط برای درخواستِ کمک است.">
        <div className="kit-row">
          <BigButton icon={<YaraIcon name="check" size={22} />}>اصلی</BigButton>
          <BigButton variant="soft">نرم</BigButton>
          <BigButton variant="quiet" icon={<YaraIcon name="call" size={22} />}>آرام</BigButton>
          <BigButton variant="help">کمک می‌خواهم</BigButton>
          <BigButton disabled>غیرفعال</BigButton>
        </div>
      </Section>
    </>
  );
}
