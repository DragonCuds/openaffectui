import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Segmented } from './Segmented';

const SPARK_FLAT = 'M0 20 L10 19 L20 21 L30 18 L40 20 L50 19 L60 22 L70 19 L80 20 L90 18 L100 21 L110 19 L120 20 L130 19 L140 20';
const SPARK_DIP = 'M0 14 L10 13 L20 15 L30 13 L40 14 L50 16 L60 22 L70 29 L80 33 L90 34 L100 33 L110 34 L120 35 L130 34 L140 34';

export type CareRelayScene = {
  id: string;
  /** Tab text, e.g. a time of day. */
  tab: string;
  tone: 'ok' | 'check';
  /** Clock shown on the phone. */
  clock?: string;
  /** What the phone screen says: one status line and up to three short lines under it, each "label: value". */
  status: string;
  lines: string[];
  /** Small heart-rate line on the phone: steady or a dip. */
  trend?: 'flat' | 'dip';
  /** One short line at the bottom of the phone, e.g. who got an SMS. */
  foot?: string;
  /** One reply per person, same order as `people`. Empty string = this person gets nothing. */
  replies: string[];
  /** Desktop screen only: one row per wearer, e.g. room + state. `flag` marks the one to check. */
  rows?: { label: string; value: string; flag?: boolean }[];
  /** Index in `wearers` of the person to check; that face gets the alert ring. */
  flag?: number;
};

type Wearer = { src: string; alt: string; name: string };

/**
 * Marketing picture of "who wears it -> phone app (with the ring) -> the people who hear about it".
 * Several scenes (a calm day, a night alert) switch with a segmented control and step on their own
 * every few seconds until the viewer picks one; no auto-step with reduced motion.
 * Wide screens: one row in the page direction. Phones: one column. No borders.
 */
export function CareRelay({ label, wearer, wearers, device = 'phone', ring, appName, people, scenes, interval = 6500 }: {
  label: string;
  /** One person (family). */
  wearer?: Wearer;
  /** Several people (care home); shown as a small group of faces. */
  wearers?: Wearer[];
  /** Phone for a family, desktop screen for a care-home nurse station. */
  device?: 'phone' | 'desktop';
  ring?: { src: string; width?: number; height?: number };
  appName: string;
  people: { label: string; icon?: ReactNode }[];
  scenes: CareRelayScene[];
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || scenes.length < 2) return;
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % scenes.length), interval);
    return () => clearInterval(t);
  }, [held, scenes.length, interval]);
  const s = scenes[i];

  return (
    <div className="lp-relay" data-tone={s.tone} role="group" aria-label={label}>
      {scenes.length > 1 ? (
        <div className="lp-relay-tabs">
          <Segmented label={label} value={s.id} options={scenes.map((x) => ({ value: x.id, label: x.tab }))} onChange={(v) => { setHeld(true); setI(Math.max(0, scenes.findIndex((x) => x.id === v))); }} />
        </div>
      ) : null}
      <div className="lp-relay-row" data-device={device}>
        {wearers && wearers.length ? (
          <ul className="lp-relay-group">
            {wearers.map((w, n) => (
              <li key={w.src} data-flag={s.flag === n ? '' : undefined}>
                <span className="lp-relay-face">
                  <img src={w.src} alt={w.alt} width={240} height={240} loading="lazy" decoding="async" />
                  {ring ? <img className="lp-relay-minring" src={ring.src} width={ring.width} height={ring.height} alt="" loading="lazy" decoding="async" /> : null}
                </span>
                <span>{w.name}</span>
              </li>
            ))}
          </ul>
        ) : wearer ? (
          <figure className="lp-relay-who">
            <img src={wearer.src} alt={wearer.alt} width={240} height={240} loading="lazy" decoding="async" />
            <figcaption>{wearer.name}</figcaption>
          </figure>
        ) : null}

        <span className="lp-relay-wire" aria-hidden="true" />

        <div className="lp-relay-dev">
          {device === 'desktop' ? (
            <div className="lp-relay-desk">
              <div className="lp-relay-screen" aria-live="polite">
                <p className="lp-relay-app"><span>{appName}</span>{s.clock ? <span className="lp-relay-clock">{s.clock}</span> : null}</p>
                <p className="lp-relay-status" key={'s' + s.id}><span className="lp-relay-dot" aria-hidden="true" />{s.status}</p>
                <div className="lp-relay-rows" key={s.id}>
                  {(s.rows ?? []).map((r) => (
                    <p key={r.label} className="lp-relay-row-item" data-flag={r.flag ? '' : undefined}><span>{r.label}</span><b>{r.value}</b></p>
                  ))}
                </div>
                {s.foot ? <p className="lp-relay-foot" key={'f' + s.id}>{s.foot}</p> : null}
              </div>
              <span className="lp-relay-stand" aria-hidden="true" />
            </div>
          ) : (
            <div className="lp-relay-phone" aria-live="polite">
              <span className="lp-relay-notch" aria-hidden="true" />
              <p className="lp-relay-app"><span>{appName}</span>{s.clock ? <span className="lp-relay-clock">{s.clock}</span> : null}</p>
              <div className="lp-relay-card" key={s.id}>
                <p className="lp-relay-status"><span className="lp-relay-dot" aria-hidden="true" />{s.status}</p>
                {s.lines.map((l) => { const [k, v] = l.split(': '); return <p key={l} className="lp-relay-line"><span>{k}</span>{v ? <b>{v}</b> : null}</p>; })}
              </div>
              {s.trend ? (
                <svg className="lp-relay-spark" viewBox="0 0 140 40" preserveAspectRatio="none" aria-hidden="true" key={'t' + s.id}>
                  <path d={s.trend === 'dip' ? SPARK_DIP : SPARK_FLAT} />
                </svg>
              ) : null}
              {s.foot ? <p className="lp-relay-foot" key={'f' + s.id}>{s.foot}</p> : null}
            </div>
          )}
          {ring && device === 'phone' ? <img className="lp-relay-ring" src={ring.src} width={ring.width} height={ring.height} alt="" loading="lazy" decoding="async" /> : null}
        </div>

        <span className="lp-relay-wire" aria-hidden="true" />

        <ul className="lp-relay-people">
          {people.map((p, n) => (
            <li key={p.label} data-quiet={s.replies[n] ? undefined : ''} style={{ '--n': n } as CSSProperties}>
              <span className="lp-relay-who-chip">{p.icon ? <span className="lp-relay-ic" aria-hidden="true">{p.icon}</span> : null}{p.label}</span>
              <span className="lp-relay-say" key={s.id + n}>{s.replies[n] || '—'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
