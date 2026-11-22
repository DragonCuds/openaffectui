export const faNum = (n: number): string => n.toLocaleString('fa-IR');

export const faDuration = (sec: number): string => {
  const s = Math.max(0, Math.round(sec));
  return `${(Math.floor(s / 60)).toLocaleString('fa-IR')}:${(s % 60).toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`;
};

/** Any Latin digits inside a Persian sentence (server text, labels) shown as Persian digits. Leaves URLs and Latin words alone. */
export const faText = (s: string | null | undefined): string =>
  s == null ? '' : s.replace(/(https?:\/\/\S+)|[0-9]/g, (m, url) => (url ? url : String.fromCharCode(0x06f0 + Number(m))));
