import { useState } from 'react';
import { Button, Modal, Section, Select } from '@kit/ui';
import '@kit/showcase/showcase.css';

const CITIES = [
  { value: 'tehran', label: 'تهران' },
  { value: 'shiraz', label: 'شیراز' },
  { value: 'tabriz', label: 'تبریز' },
  { value: 'mashhad', label: 'مشهد' },
];

const AREAS = [
  'تجریش', 'ونک', 'سعادت‌آباد', 'شهرک غرب', 'پونک', 'جردن', 'یوسف‌آباد', 'امیرآباد', 'انقلاب', 'هفت‌تیر',
  'نارمک', 'تهرانپارس', 'پیروزی', 'نازی‌آباد', 'صادقیه', 'ستارخان', 'جنت‌آباد', 'شهران', 'اکباتان', 'چیتگر',
].map((a) => ({ value: a, label: a }));

const SORTS = [
  { value: 'soon', label: 'زودترین' },
  { value: 'new', label: 'تازه‌ترین' },
  { value: 'pay', label: 'بیشترین دستمزد' },
];

/** Select: a short list with an empty choice, a long list that scrolls, a disabled one, and one inside a dialog. */
export default function DemoSelect() {
  const [city, setCity] = useState<string>('');
  const [area, setArea] = useState<string>('ونک');
  const [sort, setSort] = useState<string>('soon');
  const [open, setOpen] = useState(false);
  const [inDialog, setInDialog] = useState<string>('');

  return (
    <>
      <Section title="فهرست کوتاه" aside="Enter یا فاصله باز می‌کند؛ با حرف اول هم می‌پرد">
        <div className="kit-stack">
          <Select label="شهر" value={city} onChange={setCity} options={CITIES} placeholder="یکی را انتخاب کنید" hint="گزینه‌ی خالی همان placeholder است." />
          <Select label="مرتب‌سازی" value={sort} onChange={(v) => setSort(v || 'soon')} options={SORTS} />
        </div>
      </Section>

      <Section title="فهرست بلند" aside="بیشتر از جای صفحه که باشد، داخل خودش اسکرول می‌خورد">
        <Select label="محله" value={area} onChange={setArea} options={AREAS} placeholder="همه‌ی محله‌ها" />
      </Section>

      <Section title="غیرفعال و داخل پنجره">
        <div className="kit-stack">
          <Select label="شهر" value="tehran" onChange={() => undefined} options={CITIES} disabled />
          <div className="kit-row"><Button onClick={() => setOpen(true)}>باز کردن پنجره</Button></div>
        </div>
        <Modal open={open} onClose={() => setOpen(false)} title="محله‌ی کار" footer={<Button variant="primary" onClick={() => setOpen(false)}>تمام</Button>}>
          <p>فهرست روی پنجره باز می‌شود و بریده نمی‌شود. Esc اول فقط فهرست را می‌بندد.</p>
          <Select label="محله" value={inDialog} onChange={setInDialog} options={AREAS} placeholder="انتخاب کنید" />
        </Modal>
      </Section>
    </>
  );
}
