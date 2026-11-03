import { useState } from 'react';
import { Button, Section } from '../ui';
import { ChatComposer, enLabels, type ChatModel } from '../ui/ChatComposer';

const MODELS: ChatModel[] = [
  { id: 'auto', name: 'خودکار', description: 'برای هر پیام بهترین مدل را انتخاب می‌کند' },
  { id: 'fast', name: 'سریع', description: 'پاسخ‌های کوتاه برای کارهای روزمره' },
  { id: 'deep', name: 'دقیق', description: 'فکر عمیق‌تر برای نوشتن و کد' },
];

/** Chat composer samples: the full card, a narrow one with a draft, and an English (LTR) one. */
export default function DemoComposer() {
  const [run, setRun] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const add = (line: string) => setLog((l) => [line, ...l].slice(0, 5));

  return (
    <>
      <Section title="ورودی گفت‌وگو" aside={<Button onClick={() => { setRun((n) => n + 1); setLog([]); }}>از اول</Button>}>
        <div className="kit-stack">
          <ChatComposer
            key={`full-${run}`}
            onSend={(m, d) => add(`ارسال شد (${d.model}): ${m}`)}
            onModelChange={(m) => add(`مدل: ${m.name}`)}
            onAttach={() => add('افزودن پیوست')}
            onConnectApps={() => add('اتصال برنامه‌ها شروع شد')}
            onRequestApproval={() => add('درخواست تأیید فرستاده شد')}
            onSelectProject={() => add('انتخاب پروژه')}
          />
          {log.length ? (
            <ul style={{ margin: 0, color: "var(--muted)", paddingInlineStart: 18, fontSize: 'var(--fs-sm)' }} aria-label="رویدادها">
              {log.map((l, i) => <li key={`${i}-${l}`}>{l}</li>)}
            </ul>
          ) : null}
        </div>
      </Section>

      <Section title="باریک، با پیش‌نویس و مدل‌های دلخواه">
        <div style={{ maxInlineSize: 380 }}>
          <ChatComposer key={`narrow-${run}`} models={MODELS} loadMs={900} dictation="یادآوری کن فردا ساعت ده جلسه داریم" />
        </div>
      </Section>

      <Section title="انگلیسی، چپ‌به‌راست">
        <div dir="ltr">
          <ChatComposer key={`en-${run}`} labels={enLabels} dictation="Draft a short update for the team about this week's progress" models={[
            { id: 'auto', name: 'Auto', description: 'Picks the best model for each task' },
            { id: 'writer', name: 'Writer', description: 'Thoughtful writing and code' },
            { id: 'quick', name: 'Quick', description: 'Quick answers for everyday tasks' },
          ]} />
        </div>
      </Section>
    </>
  );
}
