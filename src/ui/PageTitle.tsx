import type { ReactNode } from 'react';

export function PageTitle({ title, summary }: { title: string; summary?: ReactNode }) {
  return (
    <header className="page-title">
      <h1>{title}</h1>
      {summary ? <p className="page-title-summary">{summary}</p> : null}
    </header>
  );
}
