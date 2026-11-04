import { Fragment, useEffect, useMemo, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { pages } from '../docs/pages';
import { Link } from './router';
import { CodeBlock } from './CodeBlock';
import { Toc, type TocItem } from './Toc';

/** `code` spans inside plain text. */
export function Rich({ text }: { text: string }): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2
      ? <code key={i} className="ic" dir="ltr">{part.slice(1, -1)}</code>
      : <Fragment key={i}>{part}</Fragment>,
  );
}

export function GuidePage({ slug }: { slug: string }) {
  const idx = pages.findIndex((p) => p.slug === slug);
  const page = pages[idx];
  const prev = pages[idx - 1];
  const next = pages[idx + 1];

  useEffect(() => { document.title = `${page.title} — OpenAffectui`; }, [page]);

  const toc = useMemo<TocItem[]>(
    () => page.blocks.flatMap((b, i) => (b.h ? [{ id: `s${i}`, label: b.h }] : [])),
    [page],
  );

  return (
    <div className="page-grid">
      <article className="doc guide" key={page.slug}>
        <nav className="crumbs" aria-label="مسیر">
          <Link to="/docs/introduction">راهنما</Link>
          <ChevronLeft size={14} aria-hidden="true" />
          <span>{page.title}</span>
        </nav>
        <header className="doc-head">
          <h1>{page.title}</h1>
          <p className="doc-lead">{page.summary}</p>
        </header>
        {page.blocks.map((b, i) => (
          <div className="guide-block" key={i}>
            {b.h ? <h2 id={`s${i}`}><a href={`#s${i}`} className="anchor">{b.h}</a></h2> : null}
            {b.p ? <p className="doc-p"><Rich text={b.p} /></p> : null}
            {b.list ? <ul className="bullets">{b.list.map((t, j) => <li key={j}><Rich text={t} /></li>)}</ul> : null}
            {b.code ? <CodeBlock code={b.code} lang={b.lang ?? 'tsx'} title={b.lang === 'bash' ? 'ترمینال' : undefined} /> : null}
          </div>
        ))}
        <nav className="pager" aria-label="صفحه‌ی قبلی و بعدی">
          {prev ? (
            <Link to={`/docs/${prev.slug}`} className="pager-a" data-dir="prev">
              <span className="pager-l"><ArrowRight size={14} aria-hidden="true" /> قبلی</span>
              <span className="pager-t">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/docs/${next.slug}`} className="pager-a" data-dir="next">
              <span className="pager-l">بعدی <ArrowLeft size={14} aria-hidden="true" /></span>
              <span className="pager-t">{next.title}</span>
            </Link>
          ) : (
            <Link to="/components" className="pager-a" data-dir="next">
              <span className="pager-l">بعدی <ArrowLeft size={14} aria-hidden="true" /></span>
              <span className="pager-t">همه‌ی اجزا</span>
            </Link>
          )}
        </nav>
      </article>
      <Toc items={toc} />
    </div>
  );
}
