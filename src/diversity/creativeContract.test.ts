import { describe, expect, it } from 'vitest';
import { createCreativeContract } from './creativeContract';

const brief = { brandName: 'Rudzy', industry: 'Advertising / Moda / Videojuegos', valueProposition: 'Promotions with regional reach', targetAudience: 'Technology, fashion and gaming businesses', brandPersonality: 'Carismatic campaign', toneOfVoice: 'Direct', primaryAction: 'Contact us' };

describe('AI Native Creative Contract', () => {
  it('derives stable contracts for the same seed without inventing a content layout template', () => {
    const first = createCreativeContract({ brief, entropySeed: 'seed-repeatable', styleSeed: 'campaign editorial', prompt: 'Create a landing.' });
    const second = createCreativeContract({ brief, entropySeed: 'seed-repeatable', styleSeed: 'campaign editorial', prompt: 'Create a landing.' });
    expect(first).toEqual(second);
    expect(first.morphologyConstraints.features.selected).not.toMatch(/three.*cards/i);
    expect(first.commercialPurposes.join(' ')).toContain('Introduce Rudzy');
    expect(first.seedDecisions.every(item => item.seed && item.decision && item.promptDirective)).toBe(true);
  });

  it('distributes morphology choices across twelve entropy seeds for the same brief', () => {
    const contracts = Array.from({ length: 12 }, (_, index) => createCreativeContract({ brief, entropySeed: `variation-seed-${index}`, styleSeed: 'campaign editorial', prompt: 'Create a brand landing.' }));
    const unique = (key: 'opening' | 'features' | 'proof' | 'closing') => new Set(contracts.map(contract => contract.morphologyConstraints[key].selected)).size;
    expect(unique('opening')).toBeGreaterThanOrEqual(3);
    expect(unique('features')).toBeGreaterThanOrEqual(3);
    expect(unique('proof')).toBeGreaterThanOrEqual(3);
    expect(unique('closing')).toBeGreaterThanOrEqual(2);
    expect(new Set(contracts.map(contract => contract.compositionGrammar)).size).toBeGreaterThanOrEqual(6);
  });

  it('does not prohibit a presentation the user explicitly requested', () => {
    const contract = createCreativeContract({ brief, entropySeed: 'explicit', prompt: 'Create three equal feature cards and an accordion FAQ.' });
    expect(contract.prohibitedPatterns).not.toContain('three-equal-feature-cards');
    expect(contract.prohibitedPatterns).not.toContain('centered-accordion');
  });

  it('generates market-specific visual strategy and never explains hashing as model work', () => {
    const contract = createCreativeContract({ brief, entropySeed: 'specific', prompt: 'Create a landing.' });
    expect(contract.visualStrategy).toContain('brand-specific');
    expect(contract.seedDecisions.map(item => item.promptDirective).join(' ')).not.toMatch(/hash|chunk\s*1/i);
  });
});
