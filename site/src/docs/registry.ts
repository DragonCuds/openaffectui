import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { CategoryId, DocEntry } from './types';
import { CATEGORIES } from './categories';
import { foundations } from './entries/foundations';
import { agents } from './entries/agents';
import { chat } from './entries/chat';
import { data } from './entries/data';
import { forms } from './entries/forms';
import { motion } from './entries/motion';
import { localDemos } from '../demos';

/** Every component in sidebar order. */
export const ENTRIES: DocEntry[] = [...foundations, ...agents, ...chat, ...data, ...forms, ...motion];

export const bySlug = new Map(ENTRIES.map((e) => [e.slug, e]));

export const entriesOf = (id: CategoryId) => ENTRIES.filter((e) => e.category === id);

export const categoryTitle = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.title ?? '';

type Demo = LazyExoticComponent<ComponentType>;

/** Live examples: the kit's own showcase demos where they exist, site demos for the rest. */
const kitDemos: Record<string, Demo> = {
  'approval-card': lazy(() => import('@kit/showcase/DemoApprovalCard')),
  'agent-inbox': lazy(() => import('@kit/showcase/DemoInbox')),
  'decision-inbox': lazy(() => import('@kit/showcase/DemoInbox')),
  'autonomy-dial': lazy(() => import('@kit/showcase/DemoDial')),
  'agent-monitor': lazy(() => import('@kit/showcase/DemoMonitor')),
  'agent-queue': lazy(() => import('@kit/showcase/DemoAgentQueue')),
  'agent-ledger': lazy(() => import('@kit/showcase/DemoLedger')),
  'agent-recap': lazy(() => import('@kit/showcase/DemoRecap')),
  'usage-meter': lazy(() => import('@kit/showcase/DemoUsage')),
  'chat-composer': lazy(() => import('@kit/showcase/DemoComposer')),
  'message-actions': lazy(() => import('@kit/showcase/DemoMessageActions')),
  'tool-call-card': lazy(() => import('@kit/showcase/DemoToolCall')),
  'inline-diff': lazy(() => import('@kit/showcase/DemoDiff')),
  'thinking-loader': lazy(() => import('@kit/showcase/DemoLoaders')),
  'change-summary': lazy(() => import('@kit/showcase/DemoChange')),
  'kpi-chart': lazy(() => import('@kit/showcase/DemoKpi')),
  'compact-breakdown': lazy(() => import('@kit/showcase/DemoBreakdown')),
  'date-range-picker': lazy(() => import('@kit/showcase/DemoRange')),
  'blur-swap': lazy(() => import('@kit/showcase/DemoBlur')),
  shimmer: lazy(() => import('@kit/showcase/DemoShimmer')),
};

export const DEMOS: Record<string, Demo> = { ...kitDemos, ...localDemos };

/** Raw kit sources for the Code tab, loaded on demand. Keys are paths relative to the kit src/. */
const raw = import.meta.glob('../../../src/**/*.{tsx,ts,css}', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const PREFIX = '../../../src/';

export function loadSource(file: string): Promise<string> {
  const load = raw[PREFIX + file];
  return load ? load() : Promise.resolve(`// ${file} پیدا نشد`);
}
