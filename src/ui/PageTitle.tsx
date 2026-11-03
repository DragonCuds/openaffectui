import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

/**
 * Page heading. `intro` is a short plain sentence under it: what this page is and what you do here.
 */
export function PageTitle({ title, summary, intro }: { title: string; summary?: ReactNode; intro?: ReactNode }) {
  return (
    <header className="page-title">
      <h1>{title}</h1>
      {summary ? <p className="page-title-summary">{summary}</p> : null}
      {intro ? <p className="page-intro"><Info size={16} strokeWidth={1.9} aria-hidden="true" /><span>{intro}</span></p> : null}
    </header>
  );
}
