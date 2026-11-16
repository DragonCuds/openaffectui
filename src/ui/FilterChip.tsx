import { X } from 'lucide-react';

/** A chosen filter shown as a tag; the whole tag is a button that removes it. Styles in src/styles/filterchip.css. */
export function FilterChip({ children, onRemove, removeLabel = 'برداشتن فیلتر' }: { children: string; onRemove: () => void; removeLabel?: string }) {
  return (
    <button type="button" className="fchip" onClick={onRemove} aria-label={`${removeLabel}: ${children}`}>
      {children}
      <X size={13} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
