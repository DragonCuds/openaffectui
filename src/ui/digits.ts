export const faNum = (n: number): string => n.toLocaleString('fa-IR');

export const faDuration = (sec: number): string => {
  const s = Math.max(0, Math.round(sec));
  return `${(Math.floor(s / 60)).toLocaleString('fa-IR')}:${(s % 60).toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`;
};
