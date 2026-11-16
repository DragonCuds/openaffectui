"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Hand,
  Hash,
  ListChecks,
  Mail,
  Mic,
  Plus,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

/*
 * Chat Composer – the main input of an AI assistant that can act on connected tools.
 * Written from scratch (look and motion matched by watching the public demo, no source copied).
 *
 * One white card with three rows:
 *  - the message field (or, while recording, the heard words: gray first, dark once confirmed)
 *  - a toolbar: plus, "Request approval", model picker, microphone, send
 *  - a tray: "Connect apps" which, after loading, is replaced by "Select a project"
 * A single hover fill glides between the rows under the pointer. The model picker is a listbox
 * that morphs out of the corner next to its button and opens toward the side with more room.
 * Styles live in src/styles/composer.css (imported by ui.css).
 */

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  icon?: ReactNode;
};

export const defaultModels: ChatModel[] = [
  { id: "auto", name: "خودکار", description: "برای هر پیام بهترین مدل را انتخاب می‌کند", icon: <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { id: "fast", name: "سریع", description: "پاسخ‌های کوتاه برای کارهای روزمره", icon: <Zap size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--busy)" }} /> },
  { id: "deep", name: "دقیق", description: "فکر عمیق‌تر برای نوشتن و کد", icon: <Brain size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--cc-blue, #3b82f6)" }} /> },
];

export type ChatComposerLabels = {
  placeholder: string;
  attach: string;
  requestApproval: string;
  unrestricted: string;
  connectApps: string;
  selectProject: string;
  voice: string;
  send: string;
  discard: string;
  use: string;
  model: string;
  connecting: string;
  connected: string;
  approving: string;
  approved: string;
  recording: string;
  recorded: string;
  discarded: string;
  modelPicked: string;
};

export const faLabels: ChatComposerLabels = {
  placeholder: "از اینجا شروع کن…",
  attach: "افزودن پیوست",
  requestApproval: "درخواست تأیید",
  unrestricted: "دسترسی نامحدود",
  connectApps: "اتصال برنامه‌ها",
  selectProject: "انتخاب پروژه",
  voice: "ورودی صوتی",
  send: "ارسال پیام",
  discard: "دور انداختن ضبط",
  use: "استفاده از ضبط",
  model: "انتخاب مدل",
  connecting: "در حال اتصال برنامه‌ها",
  connected: "برنامه‌ها وصل شد؛ یک پروژه انتخاب کن",
  approving: "در حال درخواست تأیید",
  approved: "دسترسی نامحدود فعال شد",
  recording: "در حال ضبط صدا",
  recorded: "متن ضبط‌شده اضافه شد",
  discarded: "ضبط دور انداخته شد",
  modelPicked: "مدل انتخاب شد:",
};

export const enLabels: ChatComposerLabels = {
  placeholder: "Start by typing...",
  attach: "Add attachment",
  requestApproval: "Request approval",
  unrestricted: "Unrestricted access",
  connectApps: "Connect apps",
  selectProject: "Select a project",
  voice: "Voice input",
  send: "Send message",
  discard: "Discard recording",
  use: "Use recording",
  model: "Choose model",
  connecting: "Connecting apps",
  connected: "Apps connected, select a project",
  approving: "Requesting approval",
  approved: "Unrestricted access granted",
  recording: "Recording",
  recorded: "Transcript added",
  discarded: "Recording discarded",
  modelPicked: "Model selected:",
};

export type ChatComposerProps = {
  placeholder?: string;
  models?: ChatModel[];
  /** Duration of the connect and approval loading states, in ms */
  loadMs?: number;
  /** Demo transcript that appears word by word in gray while recording – replace with real speech-to-text */
  dictation?: string;
  /** Texts of every label; defaults to Persian */
  labels?: Partial<ChatComposerLabels>;
  /** Controlled text; leave out for an uncontrolled field */
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  onSend?: (message: string, details: { model: string }) => void;
  onModelChange?: (model: ChatModel) => void;
  onAttach?: () => void;
  onConnectApps?: () => void;
  onRequestApproval?: () => void;
  onSelectProject?: () => void;
  /** Plain message box for talking to a person: just the field and the send button (no attach, approval, model, voice or apps). */
  simple?: boolean;
  /** Longest message the field takes. */
  maxLength?: number;
  className?: string;
};

const DEFAULT_DICTATION = "یک گزارش کوتاه برای تیم درباره‌ی پیشرفت این هفته بنویس";
const WORD_START_MS = 650;
const WORD_STEP_MS = 340;
const COMMIT_MS = 220;
const TRACE_BARS = 16;
const TRACE_STEP_MS = 100;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

/* ───────── hover fill that glides between rows ───────── */

function useGlide<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  const hide = useCallback(() => {
    const f = fillRef.current;
    if (f) f.dataset.on = "0";
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (e.pointerType === "touch") return;
      const root = rootRef.current;
      const fill = fillRef.current;
      if (!root || !fill) return;
      const t = (e.target as Element).closest<HTMLElement>("[data-glide]");
      if (!t || !root.contains(t) || (t as HTMLButtonElement).disabled) {
        hide();
        return;
      }
      const rr = root.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      const first = fill.dataset.on !== "1";
      if (first) fill.dataset.snap = "1";
      fill.style.width = `${tr.width}px`;
      fill.style.height = `${tr.height}px`;
      fill.style.borderRadius = getComputedStyle(t).borderRadius;
      fill.style.transform = `translate(${tr.left - rr.left - root.clientLeft}px, ${tr.top - rr.top - root.clientTop}px)`;
      if (first) {
        void fill.offsetWidth; // settle the start position without a glide
        delete fill.dataset.snap;
      }
      fill.dataset.on = "1";
    },
    [hide],
  );

  return { rootRef, fillRef, onPointerMove, onPointerLeave: hide, hide };
}

/* ───────── dotted audio trace ───────── */

function Trace({ active, speakingRef }: { active: boolean; speakingRef: { current: boolean } }) {
  const [levels, setLevels] = useState<number[]>(() => Array(TRACE_BARS).fill(0));
  useEffect(() => {
    if (!active) {
      setLevels(Array(TRACE_BARS).fill(0));
      return;
    }
    const t = setInterval(() => {
      setLevels((a) => {
        const amp = speakingRef.current ? (Math.random() < 0.22 ? 0 : 0.2 + Math.random() * 0.8) : 0;
        return [...a.slice(1), amp];
      });
    }, TRACE_STEP_MS);
    return () => clearInterval(t);
  }, [active, speakingRef]);
  return (
    <span className="cc-trace" aria-hidden="true" dir="ltr">
      {levels.map((v, i) => (
        <i key={i} style={{ height: v ? 4 + v * 14 : 3 }} />
      ))}
    </span>
  );
}

/* ───────── model picker (listbox in a portal, morphs out of the corner) ───────── */

type PickerProps = {
  open: boolean;
  anchor: HTMLElement | null;
  popRef: { current: HTMLDivElement | null };
  models: ChatModel[];
  selected: number;
  active: number;
  kbd: boolean;
  listId: string;
  optId: (i: number) => string;
  dir: "rtl" | "ltr";
  onHover: (i: number) => void;
  onPick: (i: number) => void;
  onExited: () => void;
};

function ModelPicker({ open, anchor, popRef, models, selected, active, kbd, listId, optId, dir, onHover, onPick, onExited }: PickerProps) {
  const surface = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);
  const glide = useGlide<HTMLUListElement>();

  const place = useCallback(() => {
    const el = popRef.current;
    if (!el || !anchor) return;
    const M = 12;
    const rect = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const left = clamp(rect.left + rect.width / 2 - w / 2, M, vw - w - M);
    const above = rect.top - M;
    const below = vh - rect.bottom - M;
    const up = above >= h && below >= h ? above >= below : above >= h ? true : below >= h ? false : above >= below;
    const top = clamp(up ? rect.top + 3 - h : rect.bottom - 3, M, vh - h - M);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.dataset.up = up ? "1" : "0";
    el.style.setProperty("--cc-ox", `${rect.left + rect.width / 2 - left}px`);
  }, [anchor, popRef]);

  // First placement and the morph out of the corner nearest the button.
  useLayoutEffect(() => {
    const el = popRef.current;
    const sf = surface.current;
    if (!el || !sf) return;
    place();
    el.style.visibility = "visible";
    if (reduced() || !sf.animate) return;
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    const up = el.dataset.up === "1";
    const ox = parseFloat(el.style.getPropertyValue("--cc-ox")) || W / 2;
    const sw = 64;
    const sh = 34;
    const x0 = clamp(ox - sw / 2, 0, W - sw);
    const y0 = up ? H - sh : 0;
    const from = `inset(${y0}px ${W - x0 - sw}px ${H - y0 - sh}px ${x0}px round 10px)`;
    const a = sf.animate(
      [
        { clipPath: from, opacity: 0.5 },
        { opacity: 1, offset: 0.3 },
        { clipPath: "inset(0px 0px 0px 0px round 16px)", opacity: 1 },
      ],
      { duration: 260, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)", fill: "both" },
    );
    anim.current = a;
    return () => {
      a.cancel();
      anim.current = null;
    };
  }, [place, popRef]);

  useEffect(() => {
    const on = () => place();
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [place]);

  // Close: play the morph backwards, then unmount.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const a = anim.current;
    if (open) {
      if (a) {
        a.playbackRate = 1;
        a.play();
      }
      return;
    }
    if (!a || reduced()) {
      onExited();
      return;
    }
    a.onfinish = () => onExited();
    a.playbackRate = -1.7;
    a.play();
    return () => {
      a.onfinish = null;
    };
  }, [open, onExited]);

  return createPortal(
    <div ref={popRef} className="cc-pop" dir={dir} style={{ visibility: "hidden" }}>
      <div ref={surface} className="cc-pop-surface">
        <ul
          ref={glide.rootRef}
          id={listId}
          role="listbox"
          aria-label="models"
          className="cc-pop-list"
          onPointerMove={glide.onPointerMove}
          onPointerLeave={glide.onPointerLeave}
        >
          <span ref={glide.fillRef} className="cc-fill" aria-hidden="true" data-on="0" />
          {models.map((m, i) => (
            <li
              key={m.id}
              id={optId(i)}
              role="option"
              aria-selected={i === selected}
              data-glide=""
              data-active={i === active ? "1" : "0"}
              data-kbd={kbd ? "1" : "0"}
              className="cc-opt"
              onPointerDown={(e) => e.preventDefault()}
              onPointerMove={() => onHover(i)}
              onClick={() => onPick(i)}
            >
              <span className="cc-opt-ico">{m.icon}</span>
              <span className="cc-opt-txt">
                <span className="cc-opt-name">{m.name}</span>
                <span className="cc-opt-desc">{m.description}</span>
              </span>
              {i === selected ? <Check className="cc-opt-check" size={17} strokeWidth={2} aria-hidden="true" /> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

/* ───────── the composer ───────── */

export function ChatComposer({
  placeholder,
  models = defaultModels,
  loadMs = 1300,
  dictation = DEFAULT_DICTATION,
  labels: labelOverride,
  value: controlled,
  onValueChange,
  disabled = false,
  onSend,
  onModelChange,
  onAttach,
  onConnectApps,
  onRequestApproval,
  onSelectProject,
  simple = false,
  maxLength,
  className,
}: ChatComposerProps) {
  const L = useMemo<ChatComposerLabels>(() => ({ ...faLabels, ...labelOverride }), [labelOverride]);
  const uid = useId();
  const listId = `${uid}-models`;
  const optId = useCallback((i: number) => `${uid}-opt-${i}`, [uid]);

  const rootRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const modelBtn = useRef<HTMLButtonElement>(null);
  const micBtn = useRef<HTMLButtonElement>(null);
  const useBtn = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const speakingRef = useRef(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const glide = useGlide<HTMLDivElement>();

  const [inner, setInner] = useState("");
  const value = controlled ?? inner;
  const setValue = useCallback(
    (v: string) => {
      if (controlled === undefined) setInner(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange],
  );

  const [sel, setSel] = useState(0);
  const [pk, setPk] = useState({ open: false, mounted: false, active: 0, kbd: false });
  const [conn, setConn] = useState<"idle" | "loading" | "ready">("idle");
  const [appr, setAppr] = useState<"idle" | "loading" | "granted">("idle");
  const [rec, setRec] = useState<"off" | "on" | "commit">("off");
  const [heard, setHeard] = useState(0);
  const [note, setNote] = useState("");
  const [dir, setDir] = useState<"rtl" | "ltr">("rtl");

  const words = useMemo(() => dictation.trim().split(/\s+/).filter(Boolean), [dictation]);
  speakingRef.current = rec === "on" && heard < words.length;

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
    return t;
  }, []);
  useEffect(() => {
    const set = timers.current;
    return () => {
      set.forEach((t) => {
        clearTimeout(t);
        clearInterval(t as unknown as number);
      });
    };
  }, []);

  useLayoutEffect(() => {
    if (rootRef.current) setDir(getComputedStyle(rootRef.current).direction === "ltr" ? "ltr" : "rtl");
  });

  // Grow with the content up to about six lines.
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.blockSize = "auto";
    el.style.blockSize = `${Math.min(el.scrollHeight, 150)}px`;
  }, [value, rec]);

  // A hovered control may change under a still pointer; drop the fill until the pointer moves again.
  useEffect(() => glide.hide(), [conn, appr, rec, glide]);

  /* picker */
  const openPicker = (kbd: boolean, active = sel) => setPk({ open: true, mounted: true, active, kbd });
  const closePicker = useCallback(() => setPk((p) => (p.open ? { ...p, open: false } : p)), []);
  const onExited = useCallback(() => setPk((p) => (p.open ? p : { ...p, mounted: false })), []);
  const pick = (i: number) => {
    setSel(i);
    onModelChange?.(models[i]);
    setNote(`${L.modelPicked} ${models[i].name}`);
    closePicker();
    modelBtn.current?.focus();
  };

  useEffect(() => {
    if (!pk.open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || modelBtn.current?.contains(t)) return;
      closePicker();
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [pk.open, closePicker]);

  /** Keys shared by the field and the model button; returns true when handled. */
  const pickerKey = (e: KeyboardEvent<HTMLElement>): boolean => {
    const onBtn = e.target === modelBtn.current;
    const n = models.length;
    if (e.altKey || e.ctrlKey || e.metaKey) return false;
    if (!pk.open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!onBtn && taRef.current && taRef.current.value.includes("\n")) return false;
        e.preventDefault();
        openPicker(true);
        return true;
      }
      return false;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setPk((p) => ({ ...p, active: (p.active + 1) % n, kbd: true }));
        return true;
      case "ArrowUp":
        e.preventDefault();
        setPk((p) => ({ ...p, active: (p.active - 1 + n) % n, kbd: true }));
        return true;
      case "Home":
        e.preventDefault();
        setPk((p) => ({ ...p, active: 0, kbd: true }));
        return true;
      case "End":
        e.preventDefault();
        setPk((p) => ({ ...p, active: n - 1, kbd: true }));
        return true;
      case "Enter":
        e.preventDefault();
        pick(pk.active);
        return true;
      case " ":
        if (!onBtn) return false;
        e.preventDefault();
        pick(pk.active);
        return true;
      case "Tab":
        closePicker();
        return false;
      default:
        return false;
    }
  };

  /* send */
  const text = value.trim();
  const canSend = !disabled && rec === "off" && text.length > 0;
  const send = () => {
    if (!canSend) return;
    onSend?.(text, { model: models[sel].id });
    setValue("");
  };

  const onFieldKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (pickerKey(e)) return;
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    send();
  };

  /* connect apps */
  const connect = () => {
    if (conn !== "idle" || disabled) return;
    setConn("loading");
    setNote(L.connecting);
    onConnectApps?.();
    later(() => {
      setConn("ready");
      setNote(L.connected);
    }, loadMs);
  };

  /* request approval */
  const approve = () => {
    if (appr !== "idle" || disabled) return;
    setAppr("loading");
    setNote(L.approving);
    onRequestApproval?.();
    later(() => {
      setAppr("granted");
      setNote(L.approved);
    }, loadMs);
  };

  /* voice */
  const wordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopWords = () => {
    if (wordTimer.current) clearInterval(wordTimer.current);
    wordTimer.current = null;
  };
  useEffect(() => stopWords, []);

  const startRec = () => {
    if (rec !== "off" || disabled) return;
    setPk((p) => (p.open ? { ...p, open: false } : p));
    setHeard(0);
    setRec("on");
    setNote(L.recording);
    if (reduced()) setHeard(words.length);
    else {
      later(() => {
        setHeard((h) => Math.min(h + 1, words.length));
        wordTimer.current = setInterval(() => {
          setHeard((h) => {
            if (h + 1 >= words.length) stopWords();
            return Math.min(h + 1, words.length);
          });
        }, WORD_STEP_MS);
      }, WORD_START_MS);
    }
    later(() => useBtn.current?.focus(), 0);
  };

  const discardRec = () => {
    if (rec === "off") return;
    stopWords();
    setRec("off");
    setHeard(0);
    setNote(L.discarded);
    later(() => micBtn.current?.focus(), 0);
  };

  const useRec = () => {
    if (rec !== "on") return;
    stopWords();
    const add = words.slice(0, heard).join(" ");
    setRec("commit"); // words turn dark
    later(
      () => {
        if (add) setValue(value && !/\s$/.test(value) ? `${value} ${add}` : `${value}${add}`);
        setRec("off");
        setHeard(0);
        setNote(L.recorded);
        later(() => {
          const el = taRef.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }, 0);
      },
      reduced() ? 0 : COMMIT_MS,
    );
  };

  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    if (pk.open) {
      e.preventDefault();
      closePicker();
      modelBtn.current?.focus();
    } else if (rec === "on") {
      e.preventDefault();
      discardRec();
    }
  };

  const onCardClick = (e: ReactMouseEvent) => {
    if ((e.target as Element).closest("button, textarea, a, [role='listbox']")) return;
    if (rec === "off") taRef.current?.focus();
  };

  const recording = rec !== "off";
  const hearing = words.slice(0, heard);
  const model = models[sel];
  const labelStyle = { "--cc-load": `${loadMs}ms` } as CSSProperties;

  return (
    <div ref={rootRef} className={`cc${className ? ` ${className}` : ""}`} data-simple={simple ? "1" : undefined} style={labelStyle} onKeyDown={onRootKey}>
      <div
        ref={glide.rootRef}
        className="cc-card"
        data-rec={recording ? "1" : "0"}
        onPointerMove={glide.onPointerMove}
        onPointerLeave={glide.onPointerLeave}
        onClick={onCardClick}
      >
        <span ref={glide.fillRef} className="cc-fill" aria-hidden="true" data-on="0" />

        {/* message field / heard words */}
        <div className="cc-main">
          <textarea
            ref={taRef}
            className="cc-field"
            rows={1}
            value={value}
            placeholder={placeholder ?? L.placeholder}
            disabled={disabled}
            hidden={recording}
            maxLength={maxLength}
            aria-label={placeholder ?? L.placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onFieldKey}
          />
          {recording ? (
            <div className={`cc-field cc-live${rec === "commit" ? " is-commit" : ""}`} aria-hidden="true">
              {value ? `${value} ` : ""}
              {hearing.map((w, i) => (
                <span key={i} className="cc-w">
                  {w}{" "}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {simple ? (
          <div className="cc-bar">
            <span className="cc-spacer" />
            <button type="button" className="cc-send" aria-label={L.send} disabled={!canSend} onClick={send}>
              <ArrowUp size={19} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
          {/* toolbar */}
          <div className="cc-bar">
            <button type="button" className="cc-btn cc-plus" data-glide="" aria-label={L.attach} disabled={disabled} onClick={() => onAttach?.()}>
              <Plus size={19} strokeWidth={1.6} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="cc-btn cc-approve"
              data-glide={appr === "idle" ? "" : undefined}
              data-state={appr}
              aria-busy={appr === "loading"}
              aria-label={appr === "granted" ? L.unrestricted : L.requestApproval}
              disabled={disabled}
              onClick={approve}
            >
              <span className="cc-ap-a" aria-hidden={appr === "granted"}>
                <Hand className="cc-hand" size={18} strokeWidth={1.6} aria-hidden="true" />
                <span className="cc-ap-label cc-label">{L.requestApproval}</span>
              </span>
              <span className="cc-ap-b" aria-hidden={appr !== "granted"}>
                <ShieldAlert size={18} strokeWidth={1.6} aria-hidden="true" />
                <span className="cc-ap-label">{L.unrestricted}</span>
              </span>
            </button>

            <span className="cc-spacer" />

            <div className="cc-end">
              <div className="cc-grp cc-tools" data-hidden={recording ? "1" : "0"} inert={recording}>
                <button
                  ref={modelBtn}
                  type="button"
                  className="cc-btn cc-model"
                  data-glide=""
                  data-open={pk.open ? "1" : "0"}
                  role="combobox"
                  aria-label={`${L.model}: ${model.name}`}
                  aria-haspopup="listbox"
                  aria-expanded={pk.open}
                  aria-controls={listId}
                  aria-activedescendant={pk.open ? optId(pk.active) : undefined}
                  disabled={disabled}
                  onClick={() => (pk.open ? closePicker() : openPicker(false))}
                  onKeyDown={(e) => {
                    pickerKey(e);
                  }}
                >
                  <span className="cc-model-name">{model.name}</span>
                  <ChevronDown className="cc-chev" size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button ref={micBtn} type="button" className="cc-btn cc-icon-btn cc-mic" aria-label={L.voice} disabled={disabled} onClick={startRec}>
                  <Mic size={19} strokeWidth={1.6} aria-hidden="true" />
                </button>
                <button type="button" className="cc-send" aria-label={L.send} disabled={!canSend} onClick={send}>
                  <ArrowUp size={19} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <div className="cc-grp cc-recbar" data-hidden={recording ? "0" : "1"} inert={!recording}>
                <Trace active={rec === "on"} speakingRef={speakingRef} />
                <button type="button" className="cc-btn cc-discard" aria-label={L.discard} onClick={discardRec}>
                  <X size={19} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button ref={useBtn} type="button" className="cc-send cc-use" aria-label={L.use} onClick={useRec}>
                  <Check size={19} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          </>
        )}

        {simple ? null : (
          <>
          {/* tray: Connect apps → Select a project */}
          <div className="cc-tray">
            <button
              type="button"
              className="cc-conn cc-conn-a"
              data-glide={conn === "idle" ? "" : undefined}
              data-state={conn}
              data-shown={conn === "ready" ? "0" : "1"}
              aria-busy={conn === "loading"}
              inert={conn === "ready"}
              aria-hidden={conn === "ready"}
              disabled={disabled}
              onClick={connect}
            >
              <span className="cc-logos" aria-hidden="true">
                <span className="cc-logo" style={{ color: "#ea4335" }}><Mail size={18} strokeWidth={2} /></span>
                <span className="cc-logo" style={{ color: "#2eb67d" }}><Hash size={18} strokeWidth={2.2} /></span>
                <span className="cc-logo" style={{ color: "#7b68ee" }}><ListChecks size={18} strokeWidth={2.2} /></span>
              </span>
              <span className="cc-label cc-conn-label">{L.connectApps}</span>
            </button>
            <button
              type="button"
              className="cc-conn cc-conn-b"
              data-glide=""
              data-shown={conn === "ready" ? "1" : "0"}
              inert={conn !== "ready"}
              aria-hidden={conn !== "ready"}
              disabled={disabled}
              onClick={() => onSelectProject?.()}
            >
              <FolderOpen className="cc-folder" size={18} strokeWidth={1.8} aria-hidden="true" />
              <span className="cc-conn-label">{L.selectProject}</span>
              {dir === "rtl" ? <ChevronLeft className="cc-go" size={14} strokeWidth={1.8} aria-hidden="true" /> : <ChevronRight className="cc-go" size={14} strokeWidth={1.8} aria-hidden="true" />}
            </button>
          </div>
          </>
        )}
      </div>

      {pk.mounted ? (
        <ModelPicker
          open={pk.open}
          anchor={modelBtn.current}
          popRef={popRef}
          models={models}
          selected={sel}
          active={pk.active}
          kbd={pk.kbd}
          listId={listId}
          optId={optId}
          dir={dir}
          onHover={(i) => setPk((p) => (p.active === i && !p.kbd ? p : { ...p, active: i, kbd: false }))}
          onPick={pick}
          onExited={onExited}
        />
      ) : null}

      <span className="cc-sr" role="status" aria-live="polite">
        {note}
      </span>
    </div>
  );
}
