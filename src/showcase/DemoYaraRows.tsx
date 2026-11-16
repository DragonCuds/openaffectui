import { ListRow, Section, SeenRow, YaraIcon } from '../ui';

export default function DemoYaraRows() {
  return (
    <>
      <Section title="ردیف" hint="داخلِ کارت. آیکنِ رنگی، عنوان، توضیحِ کوچک (بالا یا پایین) و یک متنِ آخر. بینِ ردیف‌ها فقط فاصله است.">
        <div className="kit-card-demo">
          <ListRow icon={<YaraIcon name="sleep" size={22} filled />} area="sleep" captionAbove caption="خواب دیشب" title="۷ ساعت و ۱۵ دقیقه" trailing="صبح" />
          <ListRow icon={<YaraIcon name="temp" size={22} />} area="temp" captionAbove caption="دمای پوست" title="عادی" trailing="الان" />
          <ListRow icon={<YaraIcon name="group" size={22} />} area="primary" title="خانواده‌ی احمدی" caption="۳ نفر" onClick={() => undefined} trailing={<YaraIcon name="chevron" size={20} />} />
        </div>
      </Section>
      <Section title="چه کسی دیده" hint="آواتار با تیکِ کوچک وقتی دیده؛ ساعت یا «ندیده» در انتها.">
        <div className="kit-card-demo">
          <SeenRow name="مریم" time="14:05" />
          <SeenRow name="سارا" time="14:09" />
          <SeenRow name="رضا" time="ندیده" seen={false} />
        </div>
      </Section>
    </>
  );
}
