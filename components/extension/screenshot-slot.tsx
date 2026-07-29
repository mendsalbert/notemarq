'use client';

import Image from 'next/image';
import { useState } from 'react';
import { IconPhoto } from '@tabler/icons-react';

export function ScreenshotSlot({
  step,
  imageFile,
}: {
  step: string;
  imageFile: string;
}) {
  const src = `/extension/${imageFile}`;
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  return (
    <div
      className={`relative mt-5 overflow-hidden rounded-2xl ${
        status === 'ready'
          ? 'border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
          : 'border border-dashed border-[#d1d5db] bg-gradient-to-b from-[#f3f4f6] to-[#e8eaed]'
      }`}
    >
      <div className="relative aspect-[16/10] w-full">
        {status !== 'missing' && (
          <Image
            src={src}
            alt={`Step ${step} screenshot`}
            fill
            className={`object-cover object-top transition-opacity ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 672px) 100vw, 672px"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('missing')}
          />
        )}

        {status !== 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#9ca3af] shadow-sm">
              <IconPhoto size={22} stroke={1.75} />
            </div>
            <div>
              <p className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
                Screenshot {step}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6b7280]">
                Drop your screenshot here:
              </p>
              <code className="mt-1.5 inline-block rounded-md bg-white px-2 py-1 text-xs text-[#1c1c2e]">
                website/public/extension/{imageFile}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
