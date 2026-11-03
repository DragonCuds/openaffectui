import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Database, FileText, HardDrive, Mail, MessageSquare, Send, ShoppingCart, WalletCards } from 'lucide-react';
import { Section } from '@kit/ui';
import { AutonomyDial, type DialAction } from '../ui/AutonomyDial';

const tile = (bg: string, node: ReactNode) => (
  <span style={{ display: 'grid', placeItems: 'center', inlineSize: 18, blockSize: 18, borderRadius: 5, background: bg, color: '#fff' }}>{node}</span>
);

const SALES: DialAction[] = [
  { id: 'read', label: 'خواندن فایل‌ها و سندها', icon: <FileText size={18} strokeWidth={1.8} /> },
  { id: 'draft', label: 'نوشتن پیش‌نویس ایمیل', icon: <Mail size={18} strokeWidth={1.8} style={{ color: '#ea4335' }} /> },
  { id: 'crm', label: 'به‌روزرسانی رکوردهای CRM', risk: 'risky', icon: <Database size={18} strokeWidth={1.8} style={{ color: '#ff7a59' }} /> },
  { id: 'send', label: 'ارسال ایمیل', risk: 'risky', icon: <Send size={18} strokeWidth={1.8} style={{ color: '#ea4335' }} /> },
  { id: 'delete', label: 'حذف فایل‌ها', risk: 'destructive', icon: <HardDrive size={18} strokeWidth={1.8} style={{ color: '#1fa463' }} /> },
  { id: 'spend', label: 'خرج کردن پول', risk: 'destructive', locked: true, icon: tile('#635bff', <WalletCards size={12} strokeWidth={2.2} />) },
];

const SUPPORT: DialAction[] = [
  { id: 'tag', label: 'برچسب‌زدن به تیکت‌ها', icon: <MessageSquare size={18} strokeWidth={1.8} /> },
  { id: 'reply', label: 'پاسخ به پرسش‌های ساده', autoAt: 2, icon: <Mail size={18} strokeWidth={1.8} style={{ color: '#ea4335' }} /> },
  { id: 'refund', label: 'بازگرداندن وجه', risk: 'destructive', autoAt: 3, icon: <ShoppingCart size={18} strokeWidth={1.8} style={{ color: '#1fa463' }} /> },
];

// the same walk-through the original demo plays by itself: [dial stop, "حذف فایل‌ها" locked?]
const WALK: [number, boolean][] = [[1, false], [2, false], [2, true], [1, true], [1, false], [2, false], [2, true], [0, false]];

/** Autonomy dial: plays a short walk-through until you touch it, then it is yours. */
export default function DemoDial() {
  const [level, setLevel] = useState(1);
  const [locked, setLocked] = useState<string[]>(['spend']);
  const [auto, setAuto] = useState(true);
  const step = useRef(0);
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => {
      step.current = (step.current + 1) % WALK.length;
      const [l, del] = WALK[step.current];
      setLevel(l);
      setLocked(del ? ['spend', 'delete'] : ['spend']);
    }, 2600);
    return () => window.clearInterval(t);
  }, [auto]);
  const stop = () => setAuto(false);

  const [lv2, setLv2] = useState(2);
  return (
    <>
      <Section title="دستیار فروش (خودکار تا وقتی دست بزنی)">
        <div onPointerDown={stop} onKeyDown={stop}>
          <AutonomyDial
            title="دستیار فروش"
            subtitle="کارهایی که بدون پرسیدن از تو انجام می‌دهد"
            value={level}
            onChange={setLevel}
            actions={SALES}
            locked={locked}
            onLockedChange={setLocked}
          />
        </div>
      </Section>
      <Section title="چهار سطح، هر کار با سطح خودش">
        <AutonomyDial
          title="دستیار پشتیبانی"
          subtitle="هر کار از چه سطحی خودکار می‌شود"
          value={lv2}
          onChange={setLv2}
          levels={[{ label: 'فقط ببین' }, { label: 'پیشنهاد بده' }, { label: 'با تأیید' }, { label: 'خودکار' }]}
          actions={SUPPORT}
        />
      </Section>
      <Section title="غیرفعال">
        <AutonomyDial title="دستیار فروش (قفل‌شده)" value={2} onChange={() => {}} actions={SALES} disabled />
      </Section>
    </>
  );
}
