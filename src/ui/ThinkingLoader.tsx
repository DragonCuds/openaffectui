
/** Three pulsing dots plus a label, for work that has no known length. */
export function ThinkingLoader({ label = 'در حال فکر کردن' }: { label?: string }) {
  return (
    <span className="think" role="status">
      <span className="think-dots" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="think-label">{label}</span>
    </span>
  );
}
