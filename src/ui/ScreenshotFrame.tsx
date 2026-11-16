/** Soft rounded frame with shadow around a real screenshot. Lazy image with intrinsic size. */
export function ScreenshotFrame({ src, alt, width, height, caption }: {
  src: string; alt: string; width: number; height: number; caption?: string;
}) {
  return (
    <figure className="lp-shot">
      <div className="lp-shot-frame">
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="lp-shot-img" />
      </div>
      {caption ? <figcaption className="lp-shot-cap">{caption}</figcaption> : null}
    </figure>
  );
}
