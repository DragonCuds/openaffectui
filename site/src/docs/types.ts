/** Contract for every docs entry. Text is Persian unless it is code. */

export type CategoryId = 'foundations' | 'agents' | 'chat' | 'data' | 'forms' | 'motion';

export interface PropDoc {
  /** Prop name exactly as in the TS type. */
  name: string;
  /** TS type, short ('string', "'sm' | 'md'", '() => void'). */
  type: string;
  /** Default value as code, if any ('"md"', 'true'). */
  default?: string;
  required?: boolean;
  /** One plain Persian sentence. */
  desc: string;
}

export interface PropGroup {
  /** Component or type name this list belongs to ('ToolCallGroup'). Omit for the main component. */
  component?: string;
  items: PropDoc[];
}

export interface DocEntry {
  /** URL slug, kebab-case: 'approval-card' → /components/approval-card */
  slug: string;
  /** Code name: 'ApprovalCard'. */
  name: string;
  /** Persian display title: 'کارت تأیید'. */
  title: string;
  category: CategoryId;
  /** One Persian sentence, what it is and what it does. */
  summary: string;
  /** 'mit' = ported from free affectUI code (MIT notice kept); 'own' = written by us from public behaviour. */
  origin: 'mit' | 'own';
  /** Source path relative to the kit src/: 'ui/ApprovalCard.tsx'. */
  file: string;
  /** Extra source files relative to the kit src/, usually its css: ['styles/approval.css']. */
  extraFiles?: string[];
  /** Import line(s) exactly as a panel writes them. */
  importLine: string;
  whenToUse: string[];
  whenNot?: { text: string; see?: string }[];
  /** Short, real, compiling usage snippet (TSX). */
  usage: string;
  props: PropGroup[];
  keyboard?: { keys: string; action: string }[];
  a11y?: string[];
  responsive?: string[];
  /** Slugs of related entries. */
  related?: string[];
}

export interface DocBlock {
  h?: string;
  p?: string;
  list?: string[];
  code?: string;
  /** language label for code: 'bash' | 'tsx' | 'css' */
  lang?: string;
}

export interface DocPage {
  slug: string;
  title: string;
  summary: string;
  blocks: DocBlock[];
}
