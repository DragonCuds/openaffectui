"use client";

/*
 * Ported from affectUI Shimmer Loader (MIT) — https://www.affectui.com/motion/shimmer-loader
 */

import type { CSSProperties, ReactNode } from "react";

/*
 * Shimmer Loader – loading states with a soft light sweep.
 * ShimmerBlock (the original's Skeleton) draws placeholder blocks; the highlight is pinned to the viewport
 * (background-attachment: fixed), so every block on the page shares one sweep that travels across them together.
 * ShimmerText runs a highlight band through the letters of a label, like an AI "Thinking…" state.
 * Styles live in src/styles/shimmer.css.
 */

export type ShimmerBlockProps = {
  /** Width – a number is px, a string any CSS length; defaults to 100% */
  width?: number | string;
  /** Height – a number is px, a string any CSS length; defaults to 12px */
  height?: number | string;
  /** Corner radius; defaults to 6px */
  radius?: number | string;
  /** Round shape, e.g. for avatars – uses width for both sides */
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type ShimmerTextProps = {
  children: ReactNode;
  /** Seconds for one pass of the highlight */
  duration?: number;
  className?: string;
};

const len = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);

export function ShimmerBlock({ width, height, radius, circle, className, style }: ShimmerBlockProps) {
  const w = len(width);
  return (
    <span
      className={["ui-shm", className].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={{
        flexShrink: circle || typeof width === "number" ? 0 : undefined,
        width: w,
        height: circle ? (w ?? len(height)) : len(height),
        borderRadius: circle ? "50%" : len(radius),
        ...style,
      }}
    />
  );
}

export function ShimmerText({ children, duration = 2, className }: ShimmerTextProps) {
  return (
    <span
      className={["ui-shm-text", className].filter(Boolean).join(" ")}
      style={{ "--ui-shm-text-dur": `${duration}s` } as CSSProperties}
    >
      {children}
    </span>
  );
}
