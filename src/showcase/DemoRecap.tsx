import { useMemo, useRef, useState } from 'react';
import { CreditCard, Database, GitMerge, GitPullRequest, ListChecks, MessageSquare } from 'lucide-react';
import { Button, Section } from '../ui';
import { AgentRecap, type RecapEvent } from '../ui/AgentRecap';

const wait = (ms = 1100) => new Promise<void>((r) => setTimeout(r, ms));
const MIN = 60000;
const ic = (I: typeof CreditCard) => <I size={12} strokeWidth={1.75} aria-hidden="true" />;

/** A night that ended at 08:10 this morning: 13 h 30 min, six events. */
function useNight() {
  return useMemo(() => {
    const until = new Date();
    until.setHours(8, 10, 0, 0);
    const since = until.getTime() - 810 * MIN;
    const at = (min: number) => new Date(since + min * MIN);
    const events: RecapEvent[] = [
      { id: 'refund', kind: 'needs', at: at(454), title: 'بازپرداخت ۲۴۰ دلار به شرکت آکمی', detail: 'عامل پشتیبانی · بیشتر از سقف تأیید خودکار',
        logo: ic(CreditCard), action: 'تأیید', doneLabel: 'تأیید شد' },
      { id: 'merge', kind: 'needs', at: at(597), title: 'ادغام اصلاح پرداخت', detail: 'هر ۲۱۲ آزمون سبز است',
        logo: ic(GitMerge), action: 'ادغام', doneLabel: 'ادغام شد' },
      { id: 'sync', kind: 'failed', at: at(502), title: 'همگام‌سازی مخاطبان با CRM', detail: 'توکن پس از ۱٬۲۸۴ از ۳٬۹۰۰ مخاطب منقضی شد',
        logo: ic(Database), action: 'تلاش دوباره', doneLabel: 'رفع شد' },
      { id: 'tickets', kind: 'done', at: at(25), title: 'پاسخ به تیکت‌های پشتیبانی', detail: 'پاسخ اول زیر ۲ دقیقه', count: 38, logo: ic(MessageSquare) },
      { id: 'prs', kind: 'done', at: at(90), title: 'بستن درخواست‌های ادغام کهنه', count: 6, logo: ic(GitPullRequest) },
      { id: 'issues', kind: 'done', at: at(230), title: 'دسته‌بندی مشکلات تازه', detail: '۴ مورد فوری علامت خورد', count: 17, logo: ic(ListChecks) },
    ];
    return { events, since: new Date(since), until };
  }, []);
}

/** Agent recap samples: the full night with every action, a failing action, a long lane, and a quiet night. */
export default function DemoRecap() {
  const { events, since, until } = useNight();
  const [run, setRun] = useState(0);
  const [log, setLog] = useState('');
  const failOnce = useRef(true);

  const long = useMemo<RecapEvent[]>(() => [
    ...events.filter((e) => e.kind !== 'done'),
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `l${i}`, kind: 'done' as const, at: new Date(since.getTime() + (60 + i * 140) * MIN),
      title: ['ارسال خبرنامه‌ی هفتگی', 'به‌روزرسانی قیمت‌ها', 'پشتیبان‌گیری از پایگاه داده', 'پاک‌سازی فایل‌های موقت', 'گزارش مصرف'][i],
      detail: i % 2 ? undefined : 'بدون خطا', count: i === 1 ? 24 : undefined,
    })),
  ], [events, since]);

  const quiet = useMemo<RecapEvent[]>(() => events.filter((e) => e.kind === 'done'), [events]);

  return (
    <>
      <Section title="خلاصه‌ی شب" aside={<Button onClick={() => { setRun((n) => n + 1); setLog(''); }}>از اول</Button>}>
        <div className="kit-stack">
          <AgentRecap
            key={`a-${run}`}
            events={events}
            since={since}
            until={until}
            onAction={async (e, a) => {
              setLog(`${a === 'review' ? 'بررسی' : 'اقدام'}: ${e.title}`);
              if (a === 'primary') await wait();
            }}
            onUndo={(e) => setLog(`واگرد: ${e.title}`)}
            onRedo={(e) => setLog(`دوباره: ${e.title}`)}
          />
          {log ? <p className="muted" role="status">{log}</p> : null}
        </div>
      </Section>

      <Section title="خلاصه‌ی شب · اقدام ناموفق و خطوط پر">
        <div className="kit-stack">
          <AgentRecap
            key={`b-${run}`}
            events={long}
            since={since}
            until={until}
            limit={2}
            title="شب بلند"
            onAction={async (e, a) => {
              if (a !== 'primary') return;
              await wait(900);
              if (e.id === 'sync' && failOnce.current) { failOnce.current = false; throw new Error('token'); }
            }}
          />
          <p className="muted">اولین «تلاش دوباره» رد می‌شود و کارت سر جایش برمی‌گردد؛ بار دوم می‌گیرد. هر خط حداکثر ۲ کارت نشان می‌دهد و شمارنده‌ها همه را می‌شمرند.</p>
        </div>
      </Section>

      <Section title="خلاصه‌ی شب · شبِ آرام، بدون بازپخش">
        <AgentRecap key={`c-${run}`} events={quiet} since={since} until={until} replay={0} title="دیشب" />
      </Section>
    </>
  );
}
