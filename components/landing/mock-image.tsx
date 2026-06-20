'use client';

import { useState, type ReactNode } from 'react';

type Frame = 'phone' | 'browser' | 'card' | 'plain';

interface MockImageProps {
  /** Replace with a real screenshot path later, e.g. /screenshot/scn1.png */
  src?: string;
  alt?: string;
  label?: string;
  caption?: string;
  frame?: Frame;
  tone?: string;
  icon?: ReactNode;
  className?: string;
  /** aspect ratio as width/height, e.g. 9/19.5 for phone */
  ratio?: number;
  /** Render live UI inside the frame instead of an image/placeholder. */
  children?: ReactNode;
}

/**
 * Renders a real screenshot when available, otherwise a branded gradient
 * placeholder. Swap `src` with final assets — layout stays identical.
 */
export function MockImage({
  src,
  alt = '',
  label = 'Mock screenshot',
  caption,
  frame = 'card',
  tone = 'var(--nm-lavender)',
  icon,
  className = '',
  ratio = 16 / 10,
  children,
}: MockImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  const placeholder = (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-center"
      style={{
        background: `linear-gradient(135deg, ${tone}, var(--nm-cream))`,
      }}
    >
      {icon ? (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--nm-cream)', color: 'var(--nm-coral)' }}
        >
          {icon}
        </div>
      ) : null}
      <div className="px-6">
        <p className="font-poppins text-sm font-bold" style={{ color: 'var(--nm-ink)' }}>
          {label}
        </p>
        {caption ? (
          <p className="mt-1 font-poppins text-xs" style={{ color: 'var(--nm-ink-soft)' }}>
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  );

  const inner = children ? (
    <div className="h-full w-full">{children}</div>
  ) : showImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  ) : (
    placeholder
  );

  if (frame === 'phone') {
    return (
      <div
        className={`relative overflow-hidden rounded-[2.5rem] border-[10px] ${className}`}
        style={{
          borderColor: 'var(--nm-ink)',
          background: 'var(--nm-ink)',
          aspectRatio: '9 / 19.5',
          boxShadow: '0 30px 60px var(--nm-card-shadow)',
        }}
      >
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div className="h-full w-full overflow-hidden rounded-[1.8rem]">{inner}</div>
      </div>
    );
  }

  if (frame === 'browser') {
    return (
      <div
        className={`overflow-hidden rounded-2xl ${className}`}
        style={{
          background: 'var(--nm-cream)',
          boxShadow: '0 24px 48px var(--nm-card-shadow)',
          border: '1px solid var(--nm-border)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--nm-border)' }}
        >
          <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="h-3 w-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
          <div
            className="ml-3 h-6 flex-1 rounded-full px-3 text-[11px] leading-6"
            style={{ background: 'var(--nm-secondary)', color: 'var(--nm-ink-soft)' }}
          >
            app.notemarq.com
          </div>
        </div>
        <div style={{ aspectRatio: String(ratio) }}>{inner}</div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl ${className}`}
      style={{
        boxShadow: '0 20px 44px var(--nm-card-shadow)',
        border: '1px solid var(--nm-border)',
        aspectRatio: String(ratio),
      }}
    >
      {inner}
    </div>
  );
}
