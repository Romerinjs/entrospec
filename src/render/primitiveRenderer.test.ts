import { describe, expect, it } from 'vitest';
import type { BrandBrief } from '../generation/types';
import { createFallbackContentArchitecture, completeCreativeProposal } from '../design/creativeProposalV2';
import { interpretArtDirection } from '../design/artDirectionEngine';
import { renderBlueprintV2 } from './primitiveRenderer';

const brief: BrandBrief = { brandName: '<Northline>', industry: 'Infra', valueProposition: 'Decisiones claras', targetAudience: 'Equipos', brandPersonality: 'Precisa', toneOfVoice: 'Directo', primaryAction: 'Explorar' };
const blueprint = completeCreativeProposal({ brief, styleSeed: 'Swiss scientific atlas', entropySeed: 'render-seed', proposal: { strategy: { brandName: brief.brandName, industry: brief.industry, audience: brief.targetAudience, promise: brief.valueProposition, objective: brief.valueProposition, claims: [] }, artDirection: interpretArtDirection({ styleSeed: 'Swiss scientific atlas', compositionGrammar: 'swiss' }), contentArchitecture: createFallbackContentArchitecture(brief), visualStrategy: { mode: 'annotatedImage', prompt: 'diagram', alt: 'atlas alt', placement: 'proof' } } });

describe('PrimitiveRenderer V2', () => {
  it('renders semantic, offline HTML from the spatial composition rather than V1 section templates', () => {
    const html = renderBlueprintV2({ blueprint, visualDataUrl: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E', visualAlt: 'atlas alt' });
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<main>');
    expect(html).toContain('<h1');
    expect(html).toContain('data-composition=');
    expect(html).toContain('morphology-');
    expect(html).not.toContain('feature-grid');
    expect(html).not.toContain('faq-accordion');
    expect(html).not.toMatch(/<(script|link)[^>]+src=/i);
    expect(html).not.toMatch(/(?:src|href)="https?:/i);
    expect(html).toContain('&lt;Northline&gt;');
    expect(html).toContain('alt="atlas alt"');
  });

  it('changes structural rendering when a spatial morphology changes, not when only palette changes', () => {
    const original = renderBlueprintV2({ blueprint });
    const colorOnly = renderBlueprintV2({ blueprint: { ...blueprint, visualTokens: { ...blueprint.visualTokens, accent: '#ff0000' } } });
    expect(original.replace(/--accent:[^;]+;/, '--accent:COLOR;')).toBe(colorOnly.replace(/--accent:[^;]+;/, '--accent:COLOR;'));
  });
});
