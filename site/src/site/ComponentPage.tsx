import { useEffect, useMemo, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Minus } from 'lucide-react';
import type { DocEntry, PropGroup } from '../docs/types';
import { ENTRIES, bySlug, categoryTitle } from '../docs/registry';
import { Link } from './router';
import { CodeBlock, CopyButton } from './CodeBlock';
import { Preview } from './Preview';
import { Toc, type TocItem } from './Toc';

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="doc-block" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}><a href={`#${id}`} className="anchor">{title}</a></h2>
      {children}
    </section>
  );
}

function Props({ groups, main }: { groups: PropGroup[]; main: string }) {
  return (
    <div className="props-wrap">
      {groups.map((g, gi) => (
        <div className="props" key={gi}>
          {groups.length > 1 ? <p className="props-name" dir="ltr">{g.component ?? main}</p> : null}
          <ul>
            {g.items.map((p) => (
              <li key={p.name}>
                <div className="prop-head" dir="ltr">
                  <code className="prop-n">{p.name}{p.required ? null : <span className="prop-opt">?</span>}</code>
                  <code className="prop-t">{p.type}</code>
                  {p.default ? <span className="prop-d"><span>=</span> <code>{p.default}</code></span> : null}
                </div>
                <p className="prop-desc">{p.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ComponentPage({ slug }: { slug: string }) {
  const e = bySlug.get(slug) as DocEntry;
  const idx = ENTRIES.indexOf(e);
  const prev = ENTRIES[idx - 1];
  const next = ENTRIES[idx + 1];

  useEffect(() => { document.title = `${e.title} · ${e.name} — OpenAffectui`; }, [e]);

  const toc = useMemo<TocItem[]>(() => [
    { id: 'preview', label: 'پیش‌نمایش' },
    { id: 'install', label: 'نصب' },
    { id: 'when', label: 'کی به کار ببریم' },
    { id: 'usage', label: 'استفاده' },
    { id: 'props', label: 'ویژگی‌ها' },
    ...(e.keyboard?.length ? [{ id: 'keyboard', label: 'صفحه‌کلید' }] : []),
    ...(e.a11y?.length ? [{ id: 'a11y', label: 'دسترس‌پذیری' }] : []),
    ...(e.responsive?.length ? [{ id: 'responsive', label: 'اندازه‌ی صفحه' }] : []),
    ...(e.related?.length ? [{ id: 'related', label: 'مرتبط' }] : []),
  ], [e]);

  const path = `src/${e.file}`;
  const related = (e.related ?? []).map((s) => bySlug.get(s)).filter(Boolean) as DocEntry[];

  return (
    <div className="page-grid">
      <article className="doc" key={e.slug}>
        <nav className="crumbs" aria-label="مسیر">
          <Link to="/components">اجزا</Link>
          <ChevronLeft size={14} aria-hidden="true" />
          <Link to={`/components#${e.category}`}>{categoryTitle(e.category)}</Link>
        </nav>
        <header className="doc-head">
          <h1>{e.title}</h1>
          <div className="doc-meta">
            <code dir="ltr">{e.name}</code>
            <span className="badge" data-kind={e.origin}>{e.origin === 'mit' ? 'متن‌باز · MIT' : 'نوشته‌ی خودمان'}</span>
          </div>
          <p className="doc-lead">{e.summary}</p>
        </header>

        <Preview entry={e} />

        <Block id="install" title="نصب">
          <p className="doc-p">هر جزء یک فایل است با استایل خودش. کیت را کنار پروژه بگذار (<Link to="/docs/installation" className="inline-link">راهنمای نصب</Link>) و بعد:</p>
          <CodeBlock code={e.importLine} />
          <div className="path-row">
            <span className="muted">فایل</span>
            <code dir="ltr">{path}</code>
            <CopyButton text={path} label="کپی مسیر" />
          </div>
        </Block>

        <Block id="when" title="کی به کار ببریم">
          <div className="when">
            <div className="when-card" data-kind="yes">
              <p className="when-t">مناسب است برای</p>
              <ul>{e.whenToUse.map((w, i) => <li key={i}><Check size={15} strokeWidth={2.2} aria-hidden="true" /><span>{w}</span></li>)}</ul>
            </div>
            {e.whenNot?.length ? (
              <div className="when-card" data-kind="no">
                <p className="when-t">سراغش نرو وقتی</p>
                <ul>{e.whenNot.map((w, i) => {
                  const alt = w.see ? bySlug.get(w.see) : undefined;
                  return (
                    <li key={i}><Minus size={15} strokeWidth={2.2} aria-hidden="true" />
                      <span>{w.text}{alt ? <> <Link to={`/components/${alt.slug}`} className="inline-link">{alt.title}</Link></> : null}</span>
                    </li>
                  );
                })}</ul>
              </div>
            ) : null}
          </div>
        </Block>

        <Block id="usage" title="استفاده">
          <CodeBlock code={e.usage} />
        </Block>

        <Block id="props" title="ویژگی‌ها">
          <Props groups={e.props} main={e.name} />
        </Block>

        {e.keyboard?.length ? (
          <Block id="keyboard" title="صفحه‌کلید">
            <ul className="keys">
              {e.keyboard.map((k, i) => (
                <li key={i}>
                  <span className="keys-k" dir="ltr">{k.keys.split(/\s*\+\s*/).map((p, j) => <kbd key={j}>{p}</kbd>)}</span>
                  <span>{k.action}</span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {e.a11y?.length ? (
          <Block id="a11y" title="دسترس‌پذیری">
            <ul className="bullets">{e.a11y.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Block>
        ) : null}

        {e.responsive?.length ? (
          <Block id="responsive" title="اندازه‌ی صفحه">
            <ul className="bullets">{e.responsive.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Block>
        ) : null}

        {related.length ? (
          <Block id="related" title="مرتبط">
            <div className="tiles small">
              {related.map((r) => (
                <Link key={r.slug} to={`/components/${r.slug}`} className="tile">
                  <span className="tile-t">{r.title}</span>
                  <span className="tile-s">{r.summary}</span>
                </Link>
              ))}
            </div>
          </Block>
        ) : null}

        <nav className="pager" aria-label="جزء قبلی و بعدی">
          {prev ? (
            <Link to={`/components/${prev.slug}`} className="pager-a" data-dir="prev">
              <span className="pager-l"><ArrowRight size={14} aria-hidden="true" /> قبلی</span>
              <span className="pager-t">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/components/${next.slug}`} className="pager-a" data-dir="next">
              <span className="pager-l">بعدی <ArrowLeft size={14} aria-hidden="true" /></span>
              <span className="pager-t">{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      </article>
      <Toc items={toc} />
    </div>
  );
}
