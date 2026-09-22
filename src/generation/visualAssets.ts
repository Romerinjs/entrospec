import type { GeneratedVisualAsset } from './types';

export interface VisualCacheKeyInput { prompt: string; seed: string; referenceHash?: string }
export interface ImageCodec { compress(input: { mimeType: string; dataUrl: string }, options?: { maxWidth: number; maxHeight: number; quality: number }): Promise<{ dataUrl: string; byteLength: number }> }
export interface VisualAssetCache {
  get(cacheKey: string): Promise<GeneratedVisualAsset | undefined>;
  put(asset: GeneratedVisualAsset): Promise<void>;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

export async function makeVisualCacheKey(input: VisualCacheKeyInput): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(input));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function normalizeGeneratedImage(raw: { mimeType: string; data: string }, codec: ImageCodec, cacheKey: string, alt: string): Promise<GeneratedVisualAsset> {
  if (!/^image\/(png|jpeg|webp)$/i.test(raw.mimeType) || !raw.data) throw new Error('Unsupported image data');
  const normalized = await codec.compress({ mimeType: raw.mimeType, dataUrl: `data:${raw.mimeType};base64,${raw.data}` }, { maxWidth: 1600, maxHeight: 1200, quality: 0.78 });
  return { cacheKey, source: 'generated', mimeType: 'image/webp', dataUrl: normalized.dataUrl, alt, byteLength: normalized.byteLength };
}

export function createProceduralVisual(input: { seed: string; accent: string; background: string; alt: string }): GeneratedVisualAsset {
  const phase = Array.from(input.seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" role="img" aria-label="${escapeXml(input.alt)}"><rect width="1200" height="700" fill="${input.background}"/><path d="M0 ${380 + phase % 80} C240 ${100 + phase % 120} 420 ${620 - phase % 100} 680 ${300 + phase % 70} S980 ${140 + phase % 120} 1200 ${360 + phase % 60}" fill="none" stroke="${input.accent}" stroke-width="3"/><circle cx="${160 + phase % 500}" cy="${180 + phase % 220}" r="130" fill="${input.accent}" opacity=".08"/><circle cx="${850 - phase % 300}" cy="${480 - phase % 160}" r="210" fill="${input.accent}" opacity=".05"/></svg>`;
  return { cacheKey: `procedural-${input.seed}`, source: 'procedural', mimeType: 'image/svg+xml', dataUrl: `data:image/svg+xml,${encodeURIComponent(svg)}`, alt: input.alt, byteLength: svg.length };
}
