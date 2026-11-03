import {
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';

export type BlurMorph = 'height' | 'both' | 'none';

export type BlurSwapProps = {
  /** Key of the current content. Changing it starts the swap. */
  id: string | number;
  className?: string;
  children?: ReactNode;
  /** Which sides glide to the new size. "both" makes the box as wide as its content. */
  morph?: BlurMorph;
  /** Blur in px at the outer ends of the fade. */
  blur?: number;
  /** Length of the swap and of the size morph, in ms. */
  duration?: number;
  /** Root element. Use "span" for inline content such as a word inside a sentence. */
  as?: 'div' | 'span';
};

type Layer = { key: number; node: ReactNode };
type Size = { w: number; h: number };

const EASE_BOX = 'cubic-bezier(0.4, 0, 0.2, 1)';
const EASE_OUT = 'cubic-bezier(0.3, 0, 0.7, 0.6)'; // leaving copy lets go early
const EASE_IN = 'cubic-bezier(0.2, 0.4, 0.2, 1)'; // new content settles late and soft
const GROW = 1.02;
const SHRINK = 0.98;

const px = (v: string) => parseFloat(v) || 0;

/** Padding + border of the box on one axis, so animated sizes stay border-box. */
function chrome(el: HTMLElement, axis: 'w' | 'h') {
  const cs = getComputedStyle(el);
  return axis === 'h'
    ? px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth)
    : px(cs.paddingLeft) + px(cs.paddingRight) + px(cs.borderLeftWidth) + px(cs.borderRightWidth);
}

/**
 * Swaps content with a soft blur while the box glides to the size of what comes next.
 * The leaving copy stays rendered (aria-hidden, inert) and blurs out while the new content
 * sharpens in. Only the leaving copy and the current content are ever on screen.
 */
export function BlurSwap({
  id,
  className,
  children,
  morph = 'height',
  blur = 10,
  duration = 420,
  as = 'div',
}: BlurSwapProps) {
  const Tag = as as ElementType;
  const [st, setSt] = useState<{ id: string | number; cur: number; leave: Layer | null }>({
    id,
    cur: 0,
    leave: null,
  });
  const latest = useRef<ReactNode>(children); // children of the id we last committed
  const boxRef = useRef<HTMLElement | null>(null);
  const prevCur = useRef(st.cur);
  const idle = useRef<Size | null>(null); // last known resting border-box size
  const running = useRef<Animation[]>([]);

  // id changed: freeze what was on screen as the leaving copy, mount the new content.
  if (st.id !== id) {
    setSt({ id, cur: st.cur + 1, leave: { key: st.cur, node: latest.current } });
  }

  // The swap. Runs before paint, so the new content never shows un-animated.
  useLayoutEffect(() => {
    if (prevCur.current === st.cur) return;
    prevCur.current = st.cur;
    const box = boxRef.current;
    if (!box) return;
    const leaveEl = box.querySelector<HTMLElement>(':scope > [data-bs="leave"]');
    const curEl = box.querySelector<HTMLElement>(':scope > [data-bs="cur"]');

    // Where we are right now, if an earlier swap was still running (interrupt cleanly).
    const wasRunning = running.current.length > 0;
    let from: Size | null = null;
    let seen: { opacity: string; filter: string; transform: string } | null = null;
    if (wasRunning) {
      const r = box.getBoundingClientRect();
      from = { w: r.width, h: r.height };
      if (leaveEl) {
        const cs = getComputedStyle(leaveEl);
        seen = { opacity: cs.opacity, filter: cs.filter, transform: cs.transform };
      }
    } else {
      from = idle.current;
    }
    running.current.forEach((a) => a.cancel());
    running.current = [];
    delete box.dataset.swapping;

    const leaveKey = st.leave ? st.leave.key : -1;
    const finishLeave = () =>
      setSt((s) => (s.leave && s.leave.key === leaveKey ? { ...s, leave: null } : s));

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof box.animate !== 'function' || !curEl) {
      finishLeave();
      return;
    }

    const anims: Animation[] = [];
    const D = Math.max(1, duration);
    const B = `blur(${blur}px)`;

    // Box glides to the size of the new content.
    if (morph !== 'none' && from) {
      const to: Size = {
        w: curEl.offsetWidth + chrome(box, 'w'),
        h: curEl.offsetHeight + chrome(box, 'h'),
      };
      const frames: [Keyframe, Keyframe] = [{}, {}];
      let moved = false;
      if (Math.abs(from.h - to.h) > 0.5) {
        frames[0].height = `${from.h}px`;
        frames[1].height = `${to.h}px`;
        moved = true;
      }
      if (morph === 'both' && Math.abs(from.w - to.w) > 0.5) {
        frames[0].width = `${from.w}px`;
        frames[1].width = `${to.w}px`;
        moved = true;
      }
      if (moved) anims.push(box.animate(frames, { duration: D, easing: EASE_BOX }));
    }

    // Leaving copy: lets go of its sharpness, fades, grows slightly.
    if (leaveEl) {
      const startOpacity = seen ? parseFloat(seen.opacity) : 1;
      const a = leaveEl.animate(
        [
          {
            opacity: seen ? seen.opacity : 1,
            filter: seen ? seen.filter : 'blur(0px)',
            transform: seen ? seen.transform : 'scale(1)',
          },
          { opacity: 0, filter: B, transform: `scale(${GROW})` },
        ],
        {
          // an interrupted copy that was barely visible leaves faster
          duration: seen ? D * Math.max(0.4, startOpacity) : D,
          easing: EASE_OUT,
          fill: 'forwards',
        },
      );
      anims.push(a);
    }

    // New content: sharpens in from a blur at 98%, a little behind the leaving copy.
    const enter = curEl.animate(
      [
        { opacity: 0, filter: B, transform: `scale(${SHRINK})` },
        { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
      ],
      { duration: D * 0.88, delay: D * 0.12, easing: EASE_IN, fill: 'backwards' },
    );
    anims.push(enter);

    running.current = anims;
    box.dataset.swapping = '';
    Promise.all(anims.map((a) => a.finished))
      .then(() => {
        if (running.current !== anims) return;
        running.current = [];
        delete box.dataset.swapping;
        // lock the resting size for the next swap
        const r = box.getBoundingClientRect();
        idle.current = { w: r.width, h: r.height };
        finishLeave();
      })
      .catch(() => {
        /* cancelled by a newer swap */
      });
  }, [st.cur]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remember the resting size (content may also change height while idle).
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (box && running.current.length === 0) {
      const r = box.getBoundingClientRect();
      idle.current = { w: r.width, h: r.height };
    }
    latest.current = children;
  });

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (running.current.length > 0) return;
      const r = box.getBoundingClientRect();
      idle.current = { w: r.width, h: r.height };
    });
    ro.observe(box);
    return () => {
      ro.disconnect();
      running.current.forEach((a) => a.cancel());
      running.current = [];
    };
  }, []);

  return (
    <Tag
      ref={boxRef}
      className={className ? `blurswap ${className}` : 'blurswap'}
      data-morph={morph}
      data-as={as}
    >
      {st.leave ? (
        <Tag key={st.leave.key} className="blurswap-layer" data-bs="leave" aria-hidden="true" inert>
          {st.leave.node}
        </Tag>
      ) : null}
      <Tag key={st.cur} className="blurswap-layer" data-bs="cur">
        {children}
      </Tag>
    </Tag>
  );
}

/** Same component under affectUI's name. */
export const BlurCrossfade = BlurSwap;
