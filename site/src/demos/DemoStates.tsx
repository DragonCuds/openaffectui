import { useState } from 'react';
import { Button, EmptyState, Notice, Section, Skeleton } from '@kit/ui';
import { FileText } from 'lucide-react';
import '@kit/showcase/showcase.css';

/** The three states: loading placeholders, nothing here yet, and a failed load with retry. */
export default function DemoStates() {
  const [tries, setTries] = useState(0);

  return (
    <>
      <Section title="در حال بارگذاری" aside="Skeleton">
        <Skeleton rows={3} height={56} />
      </Section>

      <Section title="چیزی ثبت نشده" aside="EmptyState با قدم بعدی">
        <EmptyState
          icon={FileText}
          title="هنوز پستی نساخته‌اید"
          hint="اولین پست را بسازید تا اینجا دیده شود."
          action={<Button variant="primary">پست تازه</Button>}
        />
      </Section>

      <Section title="بارگذاری شکست خورد" aside="Notice با تلاش دوباره">
        <Notice
          message={tries === 0 ? 'بارگذاری پست‌ها نشد' : `هنوز نشد (تلاش ${tries.toLocaleString('fa-IR')})`}
          onRetry={() => setTries((t) => t + 1)}
        />
      </Section>
    </>
  );
}
