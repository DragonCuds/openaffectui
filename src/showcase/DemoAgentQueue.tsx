import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Bot, Cpu, Feather, Sparkles, Zap } from 'lucide-react';
import { Section } from '../ui';
import { AgentQueue, type QueueJob, type QueueKind, type QueueRateLimit, type QueueWorker } from '../ui/AgentQueue';
import { faNum } from '../ui/digits';

/* ───────── a small pretend job system, so the queue has something to show ───────── */

const WORKER_POOL: { name: string; detail: string; icon: ReactNode }[] = [
  { name: 'Sonnet 5.5', detail: 'مدل اصلی', icon: <Sparkles size={14} strokeWidth={1.8} /> },
  { name: 'GPT-6 Sol', detail: 'مدل دوم', icon: <Cpu size={14} strokeWidth={1.8} /> },
  { name: 'Gemini 3.8 Flash', detail: 'سریع', icon: <Zap size={14} strokeWidth={1.8} /> },
  { name: 'Haiku 5', detail: 'ارزان', icon: <Feather size={14} strokeWidth={1.8} /> },
  { name: 'Opus 5', detail: 'سنگین', icon: <Sparkles size={14} strokeWidth={1.8} /> },
  { name: 'Mistral L', detail: '', icon: <Cpu size={14} strokeWidth={1.8} /> },
  { name: 'Qwen 4', detail: '', icon: <Bot size={14} strokeWidth={1.8} /> },
  { name: 'Llama 5', detail: '', icon: <Feather size={14} strokeWidth={1.8} /> },
];

const TEMPLATES: { kind: QueueKind; name: (n: number) => string; detail?: string; ms: [number, number] }[] = [
  { kind: 'llm', name: (n) => `خلاصه‌ی تیکت ${faNum(4000 + (n % 999))}#`, detail: 'پشتیبانی', ms: [1400, 3000] },
  { kind: 'llm', name: () => 'امتیازدهی سرنخ – تیل‌اسپین', detail: 'فروش', ms: [1800, 3400] },
  { kind: 'llm', name: () => 'پیش‌نویس پاسخ – هولی', detail: 'ایمیل', ms: [2000, 3800] },
  { kind: 'llm', name: () => 'طبقه‌بندی ۱۲ ایمیل پشتیبانی', detail: 'جیمیل', ms: [1500, 2800] },
  { kind: 'llm', name: (n) => `استخراج فیلدهای فاکتور ${faNum(2000 + (n % 99))}#`, detail: 'PDF', ms: [2200, 3600] },
  { kind: 'llm', name: () => 'ترجمه‌ی یادداشت انتشار', ms: [2400, 4000] },
  { kind: 'tool', name: () => 'جستجوی مستندات: بازپرداخت', ms: [900, 1800] },
  { kind: 'tool', name: () => 'تعبیه‌ی ۲۴۰ سند', ms: [1600, 2600] },
  { kind: 'tool', name: () => 'خزش صفحه‌ی قیمت‌ها', ms: [1400, 2400] },
  { kind: 'tool', name: () => 'ارسال خلاصه به #پشتیبانی', ms: [800, 1500] },
  { kind: 'agent', name: () => 'اجرای مجموعه‌ی ارزیابی', ms: [2600, 4200] },
  { kind: 'agent', name: () => 'بررسی issueهای جدید گیت‌هاب', ms: [2400, 3800] },
  { kind: 'human', name: () => 'بازبینی متن کمپین', detail: 'منتظر تأیید', ms: [3000, 4500] },
];

const WINDOW = 96000;
const CYCLE = 36000;
const LIMIT_LEN = 9500;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Sim {
  jobs: QueueJob[] = [];
  need = new Map<string, number>();
  done = new Map<string, number>();
  seq = 0;
  concurrency = 4;
  paused = false;
  doneBase = 120;
  failedBase = 3;
  last: number;
  nextArr: number;
  rand = rng(7);
  readonly epoch: number;
  constructor(t0: number, epoch: number) {
    this.last = t0;
    this.epoch = epoch;
    this.nextArr = t0;
  }
  limitAt(t: number): QueueRateLimit | null {
    const k = Math.floor((t - this.epoch) / CYCLE);
    const from = this.epoch + k * CYCLE + 14000;
    return t >= from && t < from + LIMIT_LEN ? { from, until: from + LIMIT_LEN, label: 'محدودیت نرخ' } : null;
  }
  limits(t: number): QueueRateLimit[] {
    const out: QueueRateLimit[] = [];
    const k0 = Math.floor((t - WINDOW - this.epoch) / CYCLE);
    for (let k = k0; k <= k0 + Math.ceil(WINDOW / CYCLE) + 1; k++) {
      const from = this.epoch + k * CYCLE + 14000;
      if (from < t + 1 && from + LIMIT_LEN > t - WINDOW) out.push({ from, until: from + LIMIT_LEN, label: 'محدودیت نرخ' });
    }
    return out;
  }
  private rank(j: QueueJob) { return j.priority === 'high' ? 0 : j.priority === 'low' ? 2 : 1; }
  step(t: number) {
    const dt = Math.min(500, t - this.last);
    this.last = t;
    const limited = !!this.limitAt(t);
    // arrivals – a steady trickle with the odd burst
    while (this.nextArr <= t) {
      const tp = TEMPLATES[Math.floor(this.rand() * TEMPLATES.length)];
      const n = ++this.seq;
      const r = this.rand();
      const id = `j${n}`;
      this.jobs.push({
        id, name: tp.name(n), kind: tp.kind, status: 'queued', enqueuedAt: this.nextArr, detail: tp.detail,
        priority: r < 0.04 ? 'high' : r > 0.93 ? 'low' : 'normal', attempt: 1, maxAttempts: 3,
      });
      this.need.set(id, tp.ms[0] + this.rand() * (tp.ms[1] - tp.ms[0]));
      this.done.set(id, 0);
      this.nextArr += -Math.log(1 - this.rand()) * 1050;
    }
    // workers that were removed hand their job back to the front of the line
    for (const j of this.jobs) {
      if (j.status === 'running' && Number(j.worker!.slice(1)) > this.concurrency) {
        j.status = 'queued'; j.worker = undefined; j.startedAt = undefined; j.progress = undefined;
        j.priority = 'high';
      }
    }
    // progress – frozen while the provider rate-limits
    if (!limited) {
      for (const j of this.jobs) {
        if (j.status !== 'running') continue;
        const d = (this.done.get(j.id) ?? 0) + dt;
        this.done.set(j.id, d);
        const need = this.need.get(j.id)!;
        j.progress = Math.min(1, d / need);
        if (d >= need) {
          if (this.rand() < 0.045) {
            if ((j.attempt ?? 1) < (j.maxAttempts ?? 3)) {
              j.status = 'queued'; j.attempt = (j.attempt ?? 1) + 1; j.enqueuedAt = t;
              j.worker = undefined; j.startedAt = undefined; j.progress = undefined;
              this.done.set(j.id, 0);
            } else { j.status = 'failed'; j.endedAt = t; j.error = 'زمان درخواست تمام شد'; }
          } else { j.status = 'done'; j.endedAt = t; j.progress = 1; }
        }
      }
    }
    // start the front job on each free worker
    if (!this.paused) {
      const busy = new Set(this.jobs.filter((j) => j.status === 'running').map((j) => j.worker));
      const waiting = this.jobs.filter((j) => j.status === 'queued').sort((a, b) => this.rank(a) - this.rank(b) || a.enqueuedAt - b.enqueuedAt);
      for (let i = 1; i <= this.concurrency && waiting.length; i++) {
        if (busy.has(`w${i}`)) continue;
        const j = waiting.shift()!;
        j.status = 'running'; j.worker = `w${i}`; j.startedAt = t; j.progress = 0;
      }
    }
    // old history goes into the counters
    this.jobs = this.jobs.filter((j) => {
      if ((j.status === 'done' || j.status === 'failed') && (j.endedAt ?? t) < t - WINDOW - 3000) {
        if (j.status === 'done') this.doneBase++; else this.failedBase++;
        return false;
      }
      return true;
    });
  }
  snapshot(): QueueJob[] { return this.jobs.map((j) => ({ ...j })); }
}

function useSim() {
  const sim = useRef<Sim | null>(null);
  if (!sim.current) {
    const now = Date.now();
    const s = new Sim(now - 110000, now - 50000);
    for (let t = now - 110000; t < now; t += 100) s.step(t);
    sim.current = s;
  }
  const [jobs, setJobs] = useState<QueueJob[]>(() => sim.current!.snapshot());
  const [paused, setPausedS] = useState(false);
  const [n, setN] = useState(4);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = sim.current!;
      const t = Date.now();
      s.step(t);
      setJobs(s.snapshot());
      setNow(t);
    }, 100);
    return () => clearInterval(id);
  }, []);
  const api = useMemo(() => ({
    setPaused: (p: boolean) => { sim.current!.paused = p; setPausedS(p); },
    setConcurrency: (c: number) => { sim.current!.concurrency = c; setN(c); },
    promote: (j: QueueJob) => { const x = sim.current!.jobs.find((q) => q.id === j.id); if (x) x.priority = 'high'; },
    cancel: (j: QueueJob) => { sim.current!.jobs = sim.current!.jobs.filter((q) => q.id !== j.id); },
  }), []);
  const s = sim.current;
  return { jobs, paused, n, api, limits: s.limits(now), totals: { done: s.doneBase, failed: s.failedBase } };
}

const workersOf = (n: number): QueueWorker[] => WORKER_POOL.slice(0, n).map((w, i) => ({ id: `w${i + 1}`, ...w }));

/* ───────── fixed samples ───────── */

const T0 = 1_760_000_000_000;
const STATIC_NOW = T0 + 40000;
const STATIC_JOBS: QueueJob[] = [
  { id: 's1', name: 'امتیازدهی سرنخ – تیل‌اسپین', kind: 'llm', status: 'running', worker: 'w1', enqueuedAt: T0 + 30000, startedAt: T0 + 36000, progress: 0.62, detail: 'فروش' },
  { id: 's2', name: 'جستجوی مستندات: بازپرداخت', kind: 'tool', status: 'running', worker: 'w2', enqueuedAt: T0 + 31000, startedAt: T0 + 37500, progress: 0.35 },
  { id: 's3', name: 'اجرای مجموعه‌ی ارزیابی', kind: 'agent', status: 'running', worker: 'w3', enqueuedAt: T0 + 31000, startedAt: T0 + 38500, progress: 0.15 },
  { id: 's4', name: 'بازبینی متن کمپین', kind: 'human', status: 'queued', enqueuedAt: T0 + 36000, priority: 'high', detail: 'منتظر تأیید' },
  { id: 's5', name: 'استخراج فیلدهای فاکتور #۲۲۱۵', kind: 'llm', status: 'queued', enqueuedAt: T0 + 36500, detail: 'PDF' },
  { id: 's6', name: 'تعبیه‌ی ۲۴۰ سند', kind: 'tool', status: 'queued', enqueuedAt: T0 + 37500, attempt: 2, maxAttempts: 3 },
  { id: 's7', name: 'ترجمه‌ی یادداشت انتشار', kind: 'llm', status: 'queued', enqueuedAt: T0 + 38000, priority: 'low' },
  { id: 's8', name: 'خزش صفحه‌ی قیمت‌ها', kind: 'tool', status: 'queued', enqueuedAt: T0 + 38500 },
  { id: 's9', name: 'خلاصه‌ی تیکت #۴۹۶۴', kind: 'llm', status: 'queued', enqueuedAt: T0 + 38800 },
  { id: 's10', name: 'ارسال خلاصه به #پشتیبانی', kind: 'tool', status: 'queued', enqueuedAt: T0 + 39000 },
  ...Array.from({ length: 12 }, (_, i): QueueJob => ({
    id: `d${i}`, name: `کار ${faNum(i + 1)}`, kind: 'llm', status: 'done', worker: 'w1',
    enqueuedAt: T0 + i * 3000, startedAt: T0 + i * 3000 + 1500 + (i % 3) * 900, endedAt: T0 + i * 3000 + 4500 + (i % 3) * 900,
  })),
  { id: 'f1', name: 'ترجمه‌ی قرارداد', kind: 'llm', status: 'failed', worker: 'w2', enqueuedAt: T0 + 20000, startedAt: T0 + 22000, endedAt: T0 + 26000, error: 'زمان درخواست تمام شد' },
];
const STATIC_LIMIT: QueueRateLimit[] = [{ from: T0 + 38000, until: T0 + 47000, label: 'محدودیت نرخ' }];

/** The queue: a live system with pause/resume, worker stepper, move to front and cancel – plus a few fixed snapshots. */
export default function DemoAgentQueue() {
  const { jobs, paused, n, api, limits, totals } = useSim();
  return (
    <>
      <Section title="صف کارها">
        <AgentQueue
          jobs={jobs}
          workers={workersOf(n)}
          rateLimits={limits}
          paused={paused}
          onPausedChange={api.setPaused}
          onConcurrencyChange={api.setConcurrency}
          maxConcurrency={8}
          backpressure={12}
          window={WINDOW}
          totals={totals}
          onPromote={api.promote}
          onCancel={api.cancel}
          name="agent-jobs"
        />
      </Section>

      <Section title="صف: لحظه‌ی محدودیت نرخ و کارت باز">
        <AgentQueue
          jobs={STATIC_JOBS}
          workers={workersOf(4)}
          now={STATIC_NOW + 2000}
          rateLimits={STATIC_LIMIT}
          backpressure={8}
          window={60000}
          defaultOpenId="s6"
          onPromote={() => {}}
          onCancel={() => {}}
          name="agent-jobs"
        />
      </Section>

      <Section title="صف: عرض باریک">
        <div style={{ maxInlineSize: 380 }}>
          <AgentQueue
            jobs={STATIC_JOBS}
            workers={workersOf(3)}
            now={STATIC_NOW}
            rateLimits={STATIC_LIMIT}
            backpressure={8}
            window={60000}
            onPausedChange={() => {}}
            onConcurrencyChange={() => {}}
            name="agent-jobs"
          />
        </div>
      </Section>
    </>
  );
}
