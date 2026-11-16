import { useState } from 'react';
import { Section, Surface } from '../ui';
import { SentenceCompare } from '../ui/SentenceCompare';
import type { SentenceCompareBlock, SentenceComparePick } from '../ui/SentenceCompare';

/** Made-up sample: a short article where a new version rewrote two sentences and added one. */
const BLOCKS: SentenceCompareBlock[] = [
  { tag: 'h2', sentences: [{ id: 'a1', kind: 'same', text: 'چطور گیاه آپارتمانی را آبیاری کنیم', before: '' }] },
  {
    tag: 'p',
    sentences: [
      { id: 'a2', kind: 'changed', text: 'بیشتر گیاه‌های آپارتمانی از آبیاری زیاد آسیب می‌بینند، نه از کم‌آبی.', before: 'خیلی از گیاه‌ها اگر زیاد آب بخورند خراب می‌شوند.' },
      { id: 'a3', kind: 'same', text: 'قبل از هر آبیاری، انگشتت را دو بند توی خاک فرو کن.', before: '' },
      { id: 'a4', kind: 'added', text: 'اگر خاک هنوز خنک و نمدار است، یک روز دیگر صبر کن.', before: '' },
    ],
  },
  { tag: 'h3', sentences: [{ id: 'a5', kind: 'same', text: 'نشانه‌های آبیاری بیش از حد', before: '' }] },
  { tag: 'li', list: 'ul', sentences: [{ id: 'a6', kind: 'same', text: 'برگ‌های زرد و افتاده.', before: '' }] },
  { tag: 'li', list: 'ul', sentences: [{ id: 'a7', kind: 'changed', text: 'بوی نم و کپک از خاک گلدان.', before: 'بوی بد خاک.' }] },
];

export default function DemoSentenceCompare() {
  const [picks, setPicks] = useState<Record<string, SentenceComparePick>>({});
  const [disabled, setDisabled] = useState(false);
  return (
    <Section title="مقایسه‌ی جمله‌به‌جمله">
      <div className="kit-stack">
        <Surface>
          <SentenceCompare blocks={BLOCKS} picks={picks} onPick={(id, v) => setPicks((p) => ({ ...p, [id]: v }))} disabled={disabled} />
        </Surface>
        <label className="muted">
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} /> غیرفعال
        </label>
      </div>
    </Section>
  );
}
