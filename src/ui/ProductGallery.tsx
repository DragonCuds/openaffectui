import { useState } from 'react';

export type ProductImage = { src: string; alt: string; width?: number; height?: number };

/**
 * One big product photo with small thumbnails under it. `main` overrides the big photo from outside
 * (e.g. the chosen color); tapping a thumbnail shows that one. No borders: tinted stage, ring on the chosen thumb.
 * Styles in src/styles/product.css.
 */
export function ProductGallery({ images, main, label = 'عکس‌های محصول', className }: {
  images: ProductImage[];
  /** Photo to show when the viewer has not tapped a thumbnail since `main` last changed. */
  main?: ProductImage;
  label?: string;
  className?: string;
}) {
  const [picked, setPicked] = useState<{ src: string; for?: string } | null>(null);
  const shown = picked && picked.for === main?.src ? images.find((x) => x.src === picked.src) ?? main ?? images[0] : main ?? images[0];
  if (!shown) return null;
  return (
    <div className={['pgal', className ?? ''].filter(Boolean).join(' ')} role="group" aria-label={label}>
      <div className="pgal-stage">
        <img key={shown.src} src={shown.src} alt={shown.alt} width={shown.width} height={shown.height} decoding="async" />
      </div>
      {images.length > 1 ? (
        <div className="pgal-thumbs">
          {images.map((x) => (
            <button key={x.src} type="button" className="pgal-thumb" aria-pressed={x.src === shown.src} aria-label={x.alt}
              onClick={() => setPicked({ src: x.src, for: main?.src })}>
              <img src={x.src} alt="" width={x.width} height={x.height} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
