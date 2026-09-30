import { describe, expect, it } from 'vitest';
import { compareAiNativeFingerprints, createAiNativeStructureFingerprint, detectUnsupportedClaims } from './nativeStructureFingerprint';

describe('AI Native structural fingerprint and claim audit', () => {
  it('detects common architecture patterns without modifying generated HTML', () => {
    const html = '<!doctype html><style>.hero{display:grid;grid-template-columns:1fr 1fr}.cards{display:grid;grid-template-columns:repeat(3,1fr)}.cta{text-align:center}.close{position:sticky;top:0}.bleed{width:100vw}</style><main><section class="hero"><h1>Launch</h1><img src="data:image/svg+xml,x"></section><section class="features"><article class="card">One</article><article class="card">Two</article><article class="card">Three</article></section><section class="proof"><p>Proof</p></section><section class="faq"><details><summary>Question?</summary>Answer</details></section><section class="close"><form><button>Contact</button></form></section></main>';
    const fingerprint = createAiNativeStructureFingerprint(html);
    expect(fingerprint.heroLayout).toBe('split-two-column');
    expect(fingerprint.sectionCount).toBe(5);
    expect(fingerprint.gridPatterns).toContain('repeat-3');
    expect(fingerprint.cardCount).toBe(3);
    expect(fingerprint.equalColumnPatterns).toContain('repeat-3');
    expect(fingerprint.faqMorphology).toBe('accordion');
    expect(fingerprint.ctaMorphology).toBe('sticky-action');
    expect(fingerprint.fullBleedUsage).toBe(1);
    expect(fingerprint.stickyUsage).toBe(1);
    expect(compareAiNativeFingerprints(fingerprint, fingerprint)).toBe(1);
  });

  it('flags ungrounded statistics and guarantees but leaves supplied claims alone', () => {
    const brief = { valueProposition: 'Regional reach', industry: 'Advertising' };
    const html = '<main><p>+85% reach in <72h. We guarantee results and 100% satisfaction.</p></main>';
    const unsupported = detectUnsupportedClaims(html, brief);
    expect(unsupported.some(claim => claim.text.includes('85%'))).toBe(true);
    expect(unsupported.some(claim => claim.text.includes('72h'))).toBe(true);
    expect(unsupported.some(claim => claim.kind === 'guarantee')).toBe(true);
    expect(unsupported.some(claim => claim.text.includes('100%'))).toBe(true);
    expect(detectUnsupportedClaims('<main>+85% reach</main>', { valueProposition: '+85% reach' })).toEqual([]);
  });
});
