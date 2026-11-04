import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { ThinkingLoader } from '@kit/ui';
import type { DocEntry } from '../docs/types';
import { DEMOS, loadSource } from '../docs/registry';
import { CodeBlock } from './CodeBlock';
import { langOf } from './highlight';

class Guard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="muted">این نمونه بالا نیامد.</p> : this.props.children; }
}

function Source({ files }: { files: string[] }) {
  const [active, setActive] = useState(files[0]);
  const [text, setText] = useState<Record<string, string>>({});
  useEffect(() => {
    if (text[active] !== undefined) return;
    let live = true;
    loadSource(active).then((t) => { if (live) setText((m) => ({ ...m, [active]: t })); });
    return () => { live = false; };
  }, [active, text]);
  const name = (f: string) => f.split('/').pop();
  return (
    <div className="source">
      {files.length > 1 ? (
        <div className="file-tabs" role="tablist" aria-label="فایل‌ها" dir="ltr">
          {files.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={f === active} onClick={() => setActive(f)}>{name(f)}</button>
          ))}
        </div>
      ) : null}
      {text[active] === undefined
        ? <div className="source-wait"><ThinkingLoader variant="plain" size="sm" label="در حال آوردن کد" /></div>
        : <CodeBlock code={text[active]} lang={langOf(active)} title={`src/${active}`} lines tall />}
    </div>
  );
}

/** The big preview frame: live examples, or the component's real source. */
export function Preview({ entry }: { entry: DocEntry }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [run, setRun] = useState(0);
  const Demo = DEMOS[entry.slug];
  const files = [entry.file, ...(entry.extraFiles ?? [])];
  return (
    <div className="preview" id="preview">
      <div className="preview-bar">
        <div className="tabs" role="tablist" aria-label="نمایش">
          <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>پیش‌نمایش</button>
          <button type="button" role="tab" aria-selected={tab === 'code'} onClick={() => setTab('code')}>کد</button>
          <span className="tabs-pill" data-at={tab} aria-hidden="true" />
        </div>
        {tab === 'preview' ? (
          <button type="button" className="icon-btn" onClick={() => setRun((n) => n + 1)} aria-label="نمونه‌ها از اول" title="از اول">
            <RotateCcw size={15} strokeWidth={1.9} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {tab === 'preview' ? (
        <div className="stage" key={run}>
          <Guard>
            <Suspense fallback={<div className="stage-wait"><ThinkingLoader size="sm" label="در حال آماده‌سازی" /></div>}>
              {Demo ? <div className="stage-inner kit-page"><Demo /></div> : <p className="muted">برای این جزء هنوز نمونه‌ی زنده نداریم.</p>}
            </Suspense>
          </Guard>
        </div>
      ) : <Source files={files} />}
    </div>
  );
}
