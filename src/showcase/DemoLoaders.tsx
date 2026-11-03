import { Button, Section } from '@kit/ui';
import { EmptyState, Notice, Skeleton } from '../ui/States';
import { ThinkingLoader } from '../ui/ThinkingLoader';

/** Loader and state samples for the showcase. */
export default function DemoLoaders() {
  return (
    <>
      <Section title="در حال فکر کردن">
        <div className="kit-stack">
          <ThinkingLoader />
          <ThinkingLoader label="در حال ساخت ریل" />
        </div>
      </Section>

      <Section title="اسکلت بارگذاری">
        <Skeleton rows={3} />
      </Section>

      <Section title="خالی">
        <EmptyState title="هنوز ریلی نساخته‌ای" hint="اولین ریل را بساز تا اینجا دیده شود." action={<Button variant="primary">ساخت ریل</Button>} />
      </Section>

      <Section title="خطا">
        <Notice message="بارگذاری نشد" onRetry={() => {}} />
      </Section>
    </>
  );
}
