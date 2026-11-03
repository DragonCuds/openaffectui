export type Tone = 'ok' | 'busy' | 'warn' | 'bad' | 'info' | 'quiet';

/** busy pulses (something is running); warn is the same colour held still. */
export function StatusDot({ tone }: { tone: Tone }) {
  return <span className={tone === 'quiet' ? 'dot' : `dot dot-${tone}`} aria-hidden="true" />;
}
