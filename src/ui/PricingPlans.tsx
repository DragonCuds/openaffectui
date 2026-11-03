import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Button } from './Button';

export interface PricingPlan {
  id: string | number;
  name: string;
  /** Price line, already formatted (e.g. «۹۰۰٬۰۰۰ تومان»). */
  price: ReactNode;
  /** Small line under the price (period, or how an upgrade is counted). */
  note?: ReactNode;
  features: ReactNode[];
  /** The plan the person has now. */
  current?: boolean;
  /** Visual lift for the plan to push. */
  featured?: boolean;
  /** Button text; no button when empty. */
  actionLabel?: string;
  /** Icon placed before the button text. */
  actionIcon?: ReactNode;
  /** Quiet button instead of the primary one (for downgrade). */
  actionSoft?: boolean;
  onAction?: () => void;
  busy?: boolean;
}

/**
 * Plan cards side by side: name, price, feature ticks and one button.
 * The current plan gets a quiet tag, the featured one a soft glow. No borders.
 * Written from scratch (look only at the Pro affectUI Pricing Plans).
 */
export function PricingPlans({
  plans, disabled = false, currentLabel = 'طرح فعلی', className,
}: {
  plans: PricingPlan[];
  /** Turns every button off (e.g. while one request runs). */
  disabled?: boolean;
  currentLabel?: string;
  className?: string;
}) {
  return (
    <ul className={className ? `prc ${className}` : 'prc'}>
      {plans.map((p, i) => (
        <li key={p.id} className="prc-card" data-current={p.current || undefined} data-featured={p.featured || undefined} style={{ ['--i' as string]: i }}>
          <div className="prc-head">
            <b className="prc-name">{p.name}</b>
            {p.current ? <span className="prc-tag">{currentLabel}</span> : null}
          </div>
          <div className="prc-price">{p.price}</div>
          {p.note ? <small className="prc-note">{p.note}</small> : null}
          <ul className="prc-feat">
            {p.features.map((f, k) => <li key={k}><Check size={14} strokeWidth={2.2} aria-hidden="true" /><span>{f}</span></li>)}
          </ul>
          {p.actionLabel && p.onAction ? (
            <Button variant={p.actionSoft ? 'soft' : 'primary'} className="prc-btn" onClick={p.onAction} disabled={disabled || p.busy} aria-busy={p.busy || undefined}>
              {p.actionIcon}{p.actionLabel}
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
