const colorCache = new Map<string, string>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  weight: number,
): [number, number, number] {
  const w = clamp(weight, 0, 1);
  return [
    Math.round(a[0] * (1 - w) + b[0] * w),
    Math.round(a[1] * (1 - w) + b[1] * w),
    Math.round(a[2] * (1 - w) + b[2] * w),
  ];
}

/** Turn a sampled color into a card background tint — light pastels or dark moody tones. */
export function tintRgb(r: number, g: number, b: number, isDark: boolean): string {
  const [h, s] = rgbToHsl(r, g, b);
  if (isDark) {
    const darkS = clamp(s * 0.62, 0.2, 0.45);
    const darkL = 0.11;
    const tinted = hslToRgb(h, darkS, darkL);
    const [dr, dg, db] = mixRgb(tinted, [20, 20, 20], 0.35);
    return toHex(dr, dg, db);
  }
  const pastelS = clamp(s * 0.5, 0.18, 0.42);
  const pastelL = 0.9;
  const [pr, pg, pb] = hslToRgb(h, pastelS, pastelL);
  return toHex(pr, pg, pb);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

async function loadImageForSampling(imageUrl: string): Promise<HTMLImageElement> {
  try {
    return await loadImage(imageUrl);
  } catch {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Proxy image load failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await loadImage(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

/** Sample the most common hue bucket from a preview image. */
export async function extractImageAccent(imageUrl: string, isDark: boolean): Promise<string | null> {
  const cacheKey = `v2:${imageUrl}:${isDark ? 'dark' : 'light'}`;
  const cached = colorCache.get(cacheKey);
  if (cached) return cached;

  try {
    const img = await loadImageForSampling(imageUrl);
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 200) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lightness = (max + min) / 2 / 255;
      const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(2 * (max + min) / 2 - 255));
      if (lightness < 0.12 || lightness > 0.92 || saturation < 0.12) continue;

      const [h] = rgbToHsl(r, g, b);
      const bucket = Math.floor(h / 20);
      const entry = buckets.get(bucket) ?? { count: 0, r: 0, g: 0, b: 0 };
      entry.count += 1;
      entry.r += r;
      entry.g += g;
      entry.b += b;
      buckets.set(bucket, entry);
    }

    let best: { count: number; r: number; g: number; b: number } | null = null;
    for (const entry of buckets.values()) {
      if (!best || entry.count > best.count) best = entry;
    }

    if (!best) return null;

    const accent = tintRgb(
      Math.round(best.r / best.count),
      Math.round(best.g / best.count),
      Math.round(best.b / best.count),
      isDark,
    );
    colorCache.set(cacheKey, accent);
    return accent;
  } catch {
    return null;
  }
}
