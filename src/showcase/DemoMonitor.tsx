import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Asterisk, FileText, GitBranch, HardDrive, Hash, ListChecks, Sparkles } from 'lucide-react';
import { Button, Section } from '../ui';
import { AgentMonitor, type AgentRunStep, type MonitorState, type StepKind } from '../ui/AgentMonitor';
import { faNum } from '../ui/digits';

/* tool logos: plain lucide icons in each tool's colour (no brand marks) */
const I = {
  claude: <Asterisk color="#d97757" strokeWidth={2.25} />,
  gpt: <Sparkles color="var(--text)" strokeWidth={1.75} />,
  tasks: <ListChecks color="#5e6ad2" strokeWidth={2.25} />,
  repo: <GitBranch color="var(--text)" strokeWidth={2.25} />,
  notes: <FileText color="var(--text)" strokeWidth={2} />,
  chat: <Hash color="#c2185b" strokeWidth={2.25} />,
  sheet: <HardDrive color="#1fa463" strokeWidth={2} />,
};

type AgentInfo = { name: string; role: string; mark: ReactNode };
const CLAUDE: AgentInfo = { name: 'Claude Opus 5.5', role: 'عامل انتشار · نسخه‌ی ۳٫۲', mark: I.claude };
const GPT: AgentInfo = { name: 'GPT-5', role: `عامل پشتیبانی · تیکت ۴۸۲۱`, mark: I.gpt };

type Phase = {
  id: string;
  run: string;
  done: string;
  took: number;
  icon?: ReactNode;
  kind?: StepKind;
  tool: string;
  detail: string;
  output?: string;
  ask?: { title: string; command: string; icon?: ReactNode };
  fail?: 'hard';
  failText?: string;
};
type Script = { id: string; agent: AgentInfo; phases: Phase[]; note?: string };

const RELEASE: Script = {
  id: 'release',
  agent: CLAUDE,
  note: `v3.2.0 منتشر شد · ${faNum(14)} تغییر`,
  phases: [
    { id: 'issues', run: 'در حال جمع‌آوری ایشوهای v3.2', done: `${faNum(14)} ایشو جمع شد`, took: 1700, icon: I.tasks, tool: 'پیگیری کار',
      detail: 'همه‌ی موارد بسته‌شده‌ی چرخه‌ی v3.2: ۹ قابلیت و ۵ رفع اشکال؛ دو مورد هم برای v3.3 ماند.', output: 'cycle:v3.2 status:done' },
    { id: 'compare', run: 'مقایسه‌ی v3.1...main', done: `${faNum(38)} کامیت مقایسه شد`, took: 2300, icon: I.repo, tool: 'مخزن کد',
      detail: 'تغییرها بین نسخه‌ی قبلی و شاخه‌ی اصلی خوانده شد؛ دو تغییر شکننده بالای فهرست رفت.', output: 'git log v3.1..main --oneline' },
    { id: 'notes', run: 'در حال نوشتن یادداشت‌های انتشار', done: 'یادداشت‌های انتشار نوشته شد', took: 2900, icon: I.notes, tool: 'یادداشت‌ها',
      detail: 'بر اساس بخش گروه‌بندی شد و برای کسی که فقط نگاه می‌کند نوشته شد؛ دو تغییر شکننده بالای صفحه.', output: 'notes/release-v3.2.md' },
    { id: 'build', run: 'در حال ساخت پیش‌نمایش', done: `پیش‌نمایش در ${faNum(41)} ثانیه ساخته شد`, took: 2600, kind: 'run', tool: 'ترمینال',
      detail: 'ساخت کامل با آزمون‌های سریع؛ همه‌ی بررسی‌ها سبز بود.', output: 'pnpm build --preview' },
    { id: 'ship', run: 'انتشار v3.2.0', done: 'v3.2.0 منتشر شد', took: 1700, icon: I.repo, tool: 'مخزن کد',
      detail: 'نسخه‌ی تازه با یادداشت‌ها روی شاخه‌ی اصلی منتشر شد.', output: 'gh release create v3.2.0 --latest',
      ask: { title: 'آماده‌ی انتشار', command: 'gh release create v3.2.0 --latest', icon: I.repo } },
    { id: 'announce', run: 'در حال اعلام در کانال انتشارها', done: 'در کانال انتشارها اعلام شد', took: 1300, icon: I.chat, tool: 'پیام‌رسان',
      detail: 'پیام انتشار با پیوند یادداشت‌ها در کانال تیم رفت.', output: 'کانال انتشارها · v3.2.0' },
  ],
};

const SUPPORT: Script = {
  id: 'support',
  agent: GPT,
  phases: [
    { id: 'thread', run: 'در حال خواندن گفتگوی مشتری', done: 'گفتگوی مشتری خوانده شد', took: 2000, icon: I.chat, tool: 'پیام‌رسان',
      detail: 'دوازده پیام از امروز صبح؛ مشتری سفارش ۲۰۹۳۱ را مرجوع کرده و بازپرداخت می‌خواهد.', output: 'thread:SUP-4821' },
    { id: 'policy', run: 'در حال جست‌وجوی سیاست بازپرداخت', done: 'سیاست بازپرداخت پیدا شد', took: 2100, icon: I.notes, tool: 'یادداشت‌ها',
      detail: 'تا ۳۰ روز پس از خرید، بازپرداخت کامل با تأیید پشتیبان.', output: 'refund-policy · v4' },
    { id: 'orders', run: 'در حال بررسی برگه‌ی سفارش‌ها', done: 'برگه‌ی سفارش‌ها قفل بود', took: 2300, icon: I.sheet, tool: 'برگه‌ی سفارش‌ها',
      detail: 'برگه را شخص دیگری باز کرده و ویرایش را قفل کرده است.', output: 'sheet:orders · locked', fail: 'hard', failText: 'برگه‌ی سفارش‌ها قفل است' },
  ],
};

const SUPPORT_RETRY: Script = {
  id: 'support-retry',
  agent: GPT,
  note: 'بازپرداخت ارسال شد · تیکت بسته شد',
  phases: [
    { id: 'match', run: 'در حال تطبیق سفارش ۲۰۹۳۱', done: 'سفارش ۲۰۹۳۱ تطبیق داده شد', took: 2200, icon: I.sheet, tool: 'برگه‌ی سفارش‌ها',
      detail: 'سفارش با مبلغ و تاریخ در برگه جور شد.', output: 'order:20931' },
    { id: 'reply', run: 'در حال نوشتن پاسخ', done: 'پاسخ نوشته شد', took: 2700, kind: 'edit', tool: 'ویرایشگر',
      detail: 'پاسخ کوتاه و مؤدب با تأکید بر زمان بازپرداخت.' },
    { id: 'close', run: 'در حال بستن تیکت', done: `تیکت ۴۸۲۱ بسته شد`, took: 1200, icon: I.tasks, tool: 'پیگیری کار',
      detail: 'وضعیت تیکت به «بسته» تغییر کرد.', output: 'SUP-4821 → closed' },
  ],
};

const ORDER = [RELEASE, SUPPORT];

type Run = {
  state: MonitorState;
  agent: AgentInfo;
  steps: AgentRunStep[];
  since?: number;
  until?: number;
  pausedFor: number;
  cost: number;
  ask?: Phase['ask'];
  outcome?: { note: string };
  error?: string;
};

type Core = {
  script: Script | null;
  idx: number;
  stepEnd: number;
  waitAt: number;
  pauseAt: number;
  nextAt: number;
  next: 'retry' | 'rotate' | null;
  rot: number;
  after: Phase[];
};

const IDLE: Run = { state: 'idle', agent: CLAUDE, steps: [], pausedFor: 0, cost: 0 };
const queued = (p: Phase): AgentRunStep => ({ id: p.id, label: p.run, kind: p.kind, icon: p.icon, tool: p.tool, detail: p.detail, output: p.output, state: 'queued' });

/** A small scripted run, the way an agent's events would drive the monitor */
function useRunner(auto: boolean) {
  const [run, setRun] = useState<Run>(IDLE);
  const core = useRef<Core>({ script: null, idx: 0, stepEnd: Infinity, waitAt: Infinity, pauseAt: 0, nextAt: Infinity, next: null, rot: 0, after: [] });
  const autoRef = useRef(auto);
  autoRef.current = auto;
  const runRef = useRef(run);
  runRef.current = run;

  const begin = (r: Run, i: number, t: number): Run => {
    const c = core.current;
    const p = c.script!.phases[i];
    c.idx = i;
    const steps = r.steps.map((s) => (s.id === p.id ? { ...s, label: p.run, state: 'running' as const, since: t } : s));
    if (p.ask) {
      c.stepEnd = Infinity;
      c.waitAt = t + 4500;
      return { ...r, steps, state: 'waiting', ask: p.ask };
    }
    c.stepEnd = t + p.took;
    c.waitAt = Infinity;
    return { ...r, steps, state: 'running', ask: undefined };
  };

  const start = (script: Script, carry: AgentRunStep[] = [], keep?: Run) => {
    const t = Date.now();
    const c = core.current;
    c.script = script;
    c.next = null;
    c.nextAt = Infinity;
    const base: Run = keep
      ? { ...keep, state: 'running', until: undefined, error: undefined, outcome: undefined, pausedFor: keep.pausedFor + (t - (keep.until ?? t)) }
      : { state: 'running', agent: script.agent, steps: [], since: t, pausedFor: 0, cost: 0 };
    const withSteps = { ...base, steps: [...carry, ...script.phases.map(queued)] };
    setRun(begin(withSteps, 0, t));
  };

  const finish = (r: Run, t: number): Run => {
    const c = core.current;
    c.stepEnd = Infinity;
    c.waitAt = Infinity;
    if (autoRef.current) { c.next = 'rotate'; c.nextAt = t + 6500; }
    return { ...r, state: 'finished', until: t, ask: undefined, outcome: c.script?.note ? { note: c.script.note } : undefined };
  };

  const complete = (r: Run, t: number): Run => {
    const c = core.current;
    const p = c.script!.phases[c.idx];
    const steps = r.steps.map((s) => (s.id === p.id
      ? { ...s, label: p.done, state: (p.fail ? 'failed' : 'done') as AgentRunStep['state'], took: p.took }
      : s));
    if (p.fail) {
      c.stepEnd = Infinity;
      c.waitAt = Infinity;
      if (autoRef.current) { c.next = 'retry'; c.nextAt = t + 5500; }
      return { ...r, steps, state: 'failed', until: t, error: p.failText };
    }
    const nr = { ...r, steps };
    return c.idx + 1 < c.script!.phases.length ? begin(nr, c.idx + 1, t) : finish(nr, t);
  };

  const allow = () => {
    const t = Date.now();
    const c = core.current;
    const p = c.script!.phases[c.idx];
    c.waitAt = Infinity;
    c.stepEnd = t + p.took;
    setRun((r) => ({ ...r, state: 'running', ask: undefined, steps: r.steps.map((s) => (s.id === p.id ? { ...s, since: t, label: p.run } : s)) }));
  };

  const decline = () => {
    const t = Date.now();
    const c = core.current;
    const p = c.script!.phases[c.idx];
    c.waitAt = Infinity;
    c.stepEnd = Infinity;
    if (autoRef.current) { c.next = 'rotate'; c.nextAt = t + 6500; }
    setRun((r) => ({
      ...r, state: 'failed', until: t, ask: undefined, error: 'اجرای دستور رد شد',
      steps: r.steps.map((s) => (s.id === p.id ? { ...s, state: 'failed' as const, took: Math.max(300, t - (s.since ?? t)), label: p.run } : s)),
    }));
  };

  const pause = () => {
    const t = Date.now();
    core.current.pauseAt = t;
    setRun((r) => ({ ...r, state: 'paused', until: t }));
  };

  const resume = () => {
    const t = Date.now();
    const c = core.current;
    const d = t - c.pauseAt;
    c.stepEnd += d;
    setRun((r) => ({ ...r, state: 'running', until: undefined, pausedFor: r.pausedFor + d, steps: r.steps.map((s) => (s.state === 'running' && s.since != null ? { ...s, since: s.since + d } : s)) }));
  };

  const cancel = () => {
    const t = Date.now();
    const c = core.current;
    c.stepEnd = Infinity;
    c.waitAt = Infinity;
    if (autoRef.current) { c.next = 'rotate'; c.nextAt = t + 6500; }
    setRun((r) => {
      const at = r.state === 'paused' ? (r.until ?? t) : t;
      return {
        ...r, state: 'cancelled', until: at, ask: undefined,
        steps: r.steps.map((s) => (s.state === 'running' ? { ...s, state: 'done' as const, took: Math.max(300, at - (s.since ?? at)), label: s.label.replace('در حال ', '') } : s)),
      };
    });
  };

  const retry = () => {
    const r = runRef.current;
    const carry = r.steps.filter((s) => s.state === 'done' || s.state === 'failed');
    start(SUPPORT_RETRY, carry, r);
  };

  const rotate = () => {
    const c = core.current;
    const s = ORDER[c.rot % ORDER.length];
    c.rot += 1;
    start(s);
  };

  // the clock of the scripted run: a tick every 100 ms
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      const c = core.current;
      const r = runRef.current;
      if (r.state === 'running' && t >= c.stepEnd) { setRun(complete(r, t)); return; }
      if (r.state === 'waiting' && t >= c.waitAt) { allow(); return; }
      if (r.state === 'running' || r.state === 'waiting') {
        setRun((x) => ({ ...x, cost: x.cost + (x.state === 'running' ? 0.00042 : 0.00006) }));
      }
      if ((r.state === 'finished' || r.state === 'failed' || r.state === 'cancelled') && t >= c.nextAt && c.next) {
        if (c.next === 'retry') retry();
        else { setRun((x) => ({ ...x, state: 'idle', steps: [], ask: undefined, outcome: undefined, error: undefined, cost: 0, since: undefined, until: undefined, pausedFor: 0 })); c.next = 'rotate'; c.nextAt = t + 2400; }
      } else if (r.state === 'idle' && t >= c.nextAt && c.next === 'rotate') rotate();
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // first run on mount
  useEffect(() => {
    const id = setTimeout(rotate, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { run, rotate, allow, decline, pause, resume, cancel, retry };
}

/* ---------------------------------------------------------------- fixed snapshots of every state */
const Snapshots = memo(function Snapshots() {
  const T = useMemo(() => Date.now(), []);
  const mk = (list: [string, string, string | undefined, number, AgentRunStep['state'], ReactNode?, StepKind?][]) =>
    list.map(([id, label, tool, took, state, icon, kind]) => ({ id, label, tool, took, state, icon, kind, detail: 'شرح کوتاه از کاری که این مرحله انجام داد.' }) as AgentRunStep);

  const done = mk([
    ['a', 'ایشوها جمع شد', 'پیگیری کار', 1700, 'done', I.tasks],
    ['b', `${faNum(38)} کامیت مقایسه شد`, 'مخزن کد', 2300, 'done', I.repo],
    ['c', 'یادداشت‌های انتشار نوشته شد', 'یادداشت‌ها', 2900, 'done', I.notes],
    ['d', 'پیش‌نمایش ساخته شد', 'ترمینال', 2600, 'done', undefined, 'run'],
  ]);
  const withRun = (label: string): AgentRunStep[] => [
    ...done,
    { id: 'e', label, tool: 'مخزن کد', icon: I.repo, state: 'running', since: T, detail: '' },
    { id: 'f', label: 'اعلام در کانال', state: 'queued' },
  ];

  const fin: AgentRunStep[] = [...done, { id: 'e', label: 'v3.2.0 منتشر شد', tool: 'مخزن کد', icon: I.repo, state: 'done', took: 1700 }, { id: 'f', label: 'در کانال انتشارها اعلام شد', tool: 'پیام‌رسان', icon: I.chat, state: 'done', took: 1300 }];
  const bad: AgentRunStep[] = [
    { id: 'a', label: 'گفتگوی مشتری خوانده شد', tool: 'پیام‌رسان', icon: I.chat, state: 'done', took: 2000 },
    { id: 'b', label: 'سیاست بازپرداخت پیدا شد', tool: 'یادداشت‌ها', icon: I.notes, state: 'done', took: 2100 },
    { id: 'c', label: 'برگه‌ی سفارش‌ها قفل بود', tool: 'برگه‌ی سفارش‌ها', icon: I.sheet, state: 'failed', took: 2300, detail: 'برگه را شخص دیگری قفل کرده است.' },
    { id: 'd', label: 'نوشتن پاسخ', kind: 'edit', state: 'queued' },
    { id: 'e', label: 'بستن تیکت', state: 'queued' },
  ];
  const noop = () => {};
  const cells: { cap: string; node: ReactNode; tall?: boolean }[] = [
    { cap: 'آماده', node: <AgentMonitor state="idle" agent={CLAUDE} onOpenLog={noop} /> },
    {
      cap: 'در حال اجرا', node: (
        <AgentMonitor state="running" agent={CLAUDE} steps={withRun('در حال انتشار v3.2.0')} since={T - 9000} until={undefined} cost={0.047}
          onPause={noop} onCancel={noop} onOpenLog={noop} />
      ),
    },
    {
      cap: 'منتظر شماست', node: (
        <AgentMonitor state="waiting" agent={CLAUDE} steps={withRun('انتشار v3.2.0')} since={T - 11000} cost={0.061}
          ask={{ title: 'آماده‌ی انتشار', command: 'gh release create v3.2.0 --latest', icon: I.repo }}
          onAllow={noop} onDecline={noop} onOpenLog={noop} />
      ),
    },
    {
      cap: 'متوقف', node: (
        <AgentMonitor state="paused" agent={CLAUDE} steps={withRun('در حال انتشار v3.2.0')} since={T - 9000} until={T - 4000} cost={0.039}
          onResume={noop} onCancel={noop} onOpenLog={noop} />
      ),
    },
    {
      cap: 'تمام شد', node: (
        <AgentMonitor state="finished" agent={CLAUDE} steps={fin} since={T - 19000} until={T} cost={0.079}
          outcome={{ note: `v3.2.0 منتشر شد · ${faNum(14)} تغییر` }} onOpenLog={noop} />
      ),
    },
    {
      cap: 'ناموفق', node: (
        <AgentMonitor state="failed" agent={GPT} steps={bad} since={T - 6000} until={T} cost={0.023}
          error="برگه‌ی سفارش‌ها قفل است" onRetry={noop} onOpenLog={noop} />
      ),
    },
    {
      cap: 'لغو شد', node: (
        <AgentMonitor state="cancelled" agent={CLAUDE} steps={[...done.slice(0, 3), { id: 'x', label: 'ساخت پیش‌نمایش', state: 'done', took: 2700, kind: 'run' }]}
          since={T - 8000} until={T} cost={0.039} onOpenLog={noop} />
      ),
    },
    {
      cap: 'کارت اطلاعات یک مرحله', tall: true, node: (
        <AgentMonitor state="finished" agent={CLAUDE} steps={fin} since={T - 19000} until={T} cost={0.079} defaultOpenId="c"
          outcome={{ note: `v3.2.0 منتشر شد · ${faNum(14)} تغییر` }} onOpenLog={noop} />
      ),
    },
    {
      cap: 'جمع‌شده: ابزارهای استفاده‌شده، در حال اجرا', node: (
        <AgentMonitor state="running" defaultFolded agent={CLAUDE} steps={withRun('در حال انتشار v3.2.0')} since={T - 9000} cost={0.047} />
      ),
    },
    {
      cap: 'جمع‌شده: منتظر شما', node: (
        <AgentMonitor state="waiting" defaultFolded agent={CLAUDE} steps={withRun('انتشار v3.2.0')} since={T - 11000} cost={0.061} />
      ),
    },
    {
      cap: 'جمع‌شده: تمام شد', node: (
        <AgentMonitor state="finished" defaultFolded agent={CLAUDE} steps={fin} since={T - 19000} until={T} cost={0.079} />
      ),
    },
    {
      cap: 'جمع‌شده: ناموفق', node: (
        <AgentMonitor state="failed" defaultFolded agent={GPT} steps={bad} since={T - 6000} until={T} cost={0.023} />
      ),
    },
  ];
  return (
    <div className="mon-demo-grid">
      {cells.map((c) => (
        <div className="mon-demo-cell" key={c.cap}>
          <div className="mon-demo-stage" style={{ minBlockSize: c.tall ? 400 : 0, alignItems: 'flex-start' }}>{c.node}</div>
          <p className="mon-demo-cap">{c.cap}</p>
        </div>
      ))}
    </div>
  );
});

/** Agent Monitor: a scripted live run (pause, cancel, allow with Enter, fold, click a step) and a fixed snapshot of every state. */
export default function DemoMonitor() {
  const [auto, setAuto] = useState(true);
  const r = useRunner(auto);
  const run = r.run;
  return (
    <>
      <Section
        title="پایشگر عامل"
        aside={(
          <>
            <Button aria-pressed={auto} onClick={() => setAuto((v) => !v)}>{auto ? 'پخش خودکار: روشن' : 'پخش خودکار: خاموش'}</Button>
            <Button onClick={r.rotate}>اجرای بعدی</Button>
          </>
        )}
      >
        <div className="mon-demo-stage">
          <AgentMonitor
            state={run.state}
            agent={run.agent}
            steps={run.steps}
            since={run.since}
            until={run.until}
            pausedFor={run.pausedFor}
            cost={run.state === 'idle' ? undefined : run.cost}
            ask={run.ask}
            outcome={run.outcome}
            error={run.error}
            onAllow={r.allow}
            onDecline={r.decline}
            onPause={r.pause}
            onResume={r.resume}
            onCancel={r.cancel}
            onRetry={r.retry}
            onOpenLog={() => {}}
          />
        </div>
      </Section>
      <Section title="همه‌ی حالت‌ها">
        <Snapshots />
      </Section>
    </>
  );
}
