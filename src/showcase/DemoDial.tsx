import { useState } from 'react';
import { Section } from '@kit/ui';
import { AutonomyDial } from '../ui/AutonomyDial';

/** Guard level for automatic page fixing, live plus a disabled copy. */
export default function DemoDial() {
  const [level, setLevel] = useState(1);
  const [locked] = useState(2);
  return (
    <>
      <Section title="سطح گارد برای اصلاح خودکار صفحه‌ها">
        <AutonomyDial label="سطح گارد اصلاح خودکار صفحه‌ها" value={level} onChange={setLevel} />
      </Section>
      <Section title="غیرفعال">
        <AutonomyDial label="سطح گارد (قفل‌شده)" value={locked} onChange={() => {}} disabled />
      </Section>
    </>
  );
}
