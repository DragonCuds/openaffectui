import { PageTitle, Section, Surface } from '@kit/ui';
import '@kit/showcase/showcase.css';

/** PageTitle with summary and intro, and a Section with aside and hint. */
export default function DemoPageTitle() {
  return (
    <>
      <Section title="عنوان صفحه" aside="با خلاصه و توضیح ساده">
        <PageTitle
          title="گزارش‌ها"
          summary="آمار هفته‌ی جاری"
          intro="اینجا می‌بینید کدام پست‌ها بازدید بیشتری گرفتند و کدام را باید دوباره منتشر کرد."
        />
      </Section>

      <Section title="بخش با عنوان" aside="Section تو در تو" hint="هر بخش یک عنوان دارد و یک خط توضیح زیر آن.">
        <Section title="پربازدیدها" aside="هفت روز اخیر">
          <Surface>۱۲ پست منتشر شد.</Surface>
        </Section>
      </Section>
    </>
  );
}
