import type { BrandBrief } from '../generation/types';
import type { AiNativeStructureFingerprint } from './nativeStructureFingerprint';

export type CreativePurpose = 'opening' | 'features' | 'proof' | 'objections' | 'closing' | 'navigation';
export interface SeedDecision { seed: string; decision: string; promptDirective: string }
export interface MorphologyConstraint { selected: string; alternatives: string[] }
export interface CreativeContract {
  commercialPurposes: string[];
  artDirection: string;
  compositionGrammar: string;
  visualRhythm: string;
  density: string;
  typographyBehavior: string;
  visualStrategy: string;
  morphologyConstraints: Record<CreativePurpose, MorphologyConstraint>;
  prohibitedPatterns: string[];
  noveltyBudget: number;
  artDirectionIntensity: number;
  conventionBreaking: boolean;
  seedDecisions: SeedDecision[];
}

type MorphologyOption = { id: string; compatible: string[] };
const morphologyPools: Record<CreativePurpose, MorphologyOption[]> = {
  opening: [
    { id: 'typographic-monument', compatible: ['type', 'editorial', 'minimal'] }, { id: 'editorial-spread', compatible: ['editorial', 'fashion', 'minimal'] },
    { id: 'campaign-poster', compatible: ['campaign', 'fashion', 'gaming'] }, { id: 'full-bleed-visual', compatible: ['campaign', 'fashion', 'immersive', 'gaming'] },
    { id: 'visual-index', compatible: ['editorial', 'map', 'technology'] }, { id: 'manifesto', compatible: ['type', 'editorial', 'minimal'] },
    { id: 'collage-opening', compatible: ['campaign', 'fashion', 'gaming'] }, { id: 'annotated-map', compatible: ['map', 'technology', 'campaign'] }
  ],
  features: [
    { id: 'editorial-index', compatible: ['editorial', 'type', 'minimal', 'fashion', 'campaign'] }, { id: 'annotated-diagram', compatible: ['map', 'technology', 'fashion', 'campaign'] },
    { id: 'story-sequence', compatible: ['campaign', 'editorial', 'fashion', 'gaming'] }, { id: 'comparison-field', compatible: ['technology', 'editorial', 'fashion', 'campaign'] },
    { id: 'horizontal-rail', compatible: ['campaign', 'technology', 'fashion', 'gaming'] }, { id: 'manifesto-list', compatible: ['type', 'minimal', 'editorial', 'fashion'] },
    { id: 'visual-atlas', compatible: ['map', 'campaign', 'technology', 'fashion'] }
  ],
  proof: [
    { id: 'giant-number-field', compatible: ['type', 'campaign', 'technology', 'fashion'] }, { id: 'data-strip', compatible: ['technology', 'minimal', 'editorial', 'campaign', 'fashion'] },
    { id: 'timeline', compatible: ['editorial', 'technology', 'campaign', 'fashion'] }, { id: 'annotated-proof', compatible: ['map', 'technology', 'editorial', 'campaign', 'fashion'] },
    { id: 'press-wall', compatible: ['campaign', 'fashion', 'editorial'] }, { id: 'quote-field', compatible: ['editorial', 'fashion', 'minimal', 'campaign'] },
    { id: 'evidence-map', compatible: ['map', 'technology', 'campaign', 'fashion'] }
  ],
  objections: [
    { id: 'editorial-q-and-a', compatible: ['editorial', 'minimal', 'type'] }, { id: 'myth-reality', compatible: ['campaign', 'editorial', 'technology'] },
    { id: 'claim-counterclaim', compatible: ['type', 'editorial', 'technology'] }, { id: 'conversation', compatible: ['campaign', 'fashion', 'gaming'] },
    { id: 'margin-notes', compatible: ['editorial', 'map', 'minimal'] }, { id: 'question-index', compatible: ['type', 'editorial', 'minimal'] },
    { id: 'accordion', compatible: ['minimal', 'technology'] }
  ],
  closing: [
    { id: 'manifesto-close', compatible: ['type', 'editorial', 'campaign', 'fashion'] }, { id: 'full-bleed-close', compatible: ['campaign', 'fashion', 'immersive', 'gaming'] },
    { id: 'integrated-conversion', compatible: ['editorial', 'technology', 'fashion', 'campaign'] }, { id: 'editorial-close', compatible: ['editorial', 'minimal', 'fashion', 'campaign'] },
    { id: 'sticky-action', compatible: ['technology', 'campaign', 'gaming', 'fashion'] }, { id: 'form-stage', compatible: ['minimal', 'technology', 'editorial', 'fashion'] }
  ],
  navigation: [
    { id: 'chapter-index', compatible: ['editorial', 'type', 'minimal'] }, { id: 'side-rail', compatible: ['map', 'technology', 'editorial'] },
    { id: 'campaign-marker', compatible: ['campaign', 'fashion', 'gaming'] }, { id: 'inline-sequence', compatible: ['minimal', 'technology', 'editorial'] },
    { id: 'open-navigation', compatible: ['campaign', 'fashion', 'immersive'] }
  ]
};

const initialProhibited = ['generic-split-hero', 'three-equal-feature-cards', 'three-centered-stats', 'centered-accordion', 'generic-network-svg', 'glowing-orb', 'bento-default', 'dashboard-mockup', 'centered-rounded-cta'];
const grammars = ['editorial-field', 'campaign-poster', 'annotated-atlas', 'typographic-manifesto', 'cinematic-sequence', 'asymmetric-index', 'comparative-narrative', 'map-led-story'];
const rhythms = ['quiet-to-dense-release', 'visual-interruption-and-pause', 'long-short-alternation', 'narrative-escalation', 'index-and-expansion', 'proof-led-cadence'];
const typographyBehaviors = ['typographic-scale', 'condensed-display-with-open-body', 'editorial-serif-contrast', 'geometric-sans-hierarchy', 'oversized-numeral-accent', 'mixed-scale-index'];

function hash(seed: string): number {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return value >>> 0;
}
function pick<T>(items: T[], seed: string): T { return items[hash(seed) % items.length]; }
function styleFamily(brief: BrandBrief, styleSeed: string): string {
  const text = `${brief.industry} ${brief.brandPersonality} ${brief.toneOfVoice} ${styleSeed}`.toLowerCase();
  if (/fashion|moda|apparel|style|estética/.test(text)) return 'fashion';
  if (/game|gaming|videojuego|juego/.test(text)) return 'gaming';
  if (/map|territor|geograf|local|regional/.test(text)) return 'map';
  if (/campaign|promoc|marketing|publicidad|retail|brand/.test(text)) return 'campaign';
  if (/tech|tecnolog|software|data|fintech|digital/.test(text)) return 'technology';
  if (/minimal|sobri|quiet|simple/.test(text)) return 'minimal';
  if (/type|tipograf|manifest/.test(text)) return 'type';
  if (/editorial|magazine|editor/.test(text)) return 'editorial';
  return 'editorial';
}

function explicitPatterns(prompt: string): Set<string> {
  const explicit = new Set<string>();
  const clauses = prompt.split(/[.!?\n]/).map(clause => clause.toLowerCase());
  for (const clause of clauses) {
    if (/\b(?:3|three|tres)\s+(?:equal\s+)?(?:feature\s+)?(?:cards?|tarjetas)\b/.test(clause) && !/\b(?:no|sin|avoid|evitar|prohibit|prohibido)\b/.test(clause)) explicit.add('three-equal-feature-cards');
    if (/\b(?:accordion|acorde[oó]n)\b/.test(clause) && !/\b(?:no|sin|avoid|evitar|prohibit|prohibido)\b/.test(clause)) explicit.add('centered-accordion');
    if (/\b(?:split\s+hero|hero\s+(?:copy-left|left)\s+(?:image-right|image))\b/.test(clause) && !/\b(?:no|sin|avoid|evitar|prohibit|prohibido)\b/.test(clause)) explicit.add('generic-split-hero');
    if (/\b(?:bento|dashboard\s+mockup|glowing\s+orb|orbe\s+luminoso)\b/.test(clause) && !/\b(?:no|sin|avoid|evitar|prohibit|prohibido)\b/.test(clause)) {
      if (/bento/.test(clause)) explicit.add('bento-default');
      if (/dashboard/.test(clause)) explicit.add('dashboard-mockup');
      if (/glowing\s+orb|orbe\s+luminoso/.test(clause)) explicit.add('glowing-orb');
    }
  }
  return explicit;
}

export function createCreativeContract(input: {
  brief: BrandBrief; entropySeed: string; styleSeed?: string; prompt?: string; noveltyBudget?: number; artDirectionIntensity?: number;
  recentFingerprints?: Array<{ id: string; fingerprint: AiNativeStructureFingerprint }>;
  attempt?: number; excludedMorphologies?: string[];
}): CreativeContract {
  const styleSeed = input.styleSeed?.trim() || `${input.brief.industry} ${input.brief.brandPersonality}`;
  const family = styleFamily(input.brief, styleSeed);
  const seed = `${input.entropySeed}:ai-native:${input.attempt ?? 0}`;
  const compositionGrammar = pick(grammars, `${seed}:grammar`);
  const recentMorphologies = new Set((input.recentFingerprints ?? []).flatMap(({ fingerprint }) => [fingerprint.heroLayout, fingerprint.faqMorphology, fingerprint.ctaMorphology, ...fingerprint.gridPatterns]));
  const excluded = new Set([...(input.excludedMorphologies ?? []), ...recentMorphologies]);
  const morphologyConstraints = {} as Record<CreativePurpose, MorphologyConstraint>;
  for (const purpose of Object.keys(morphologyPools) as CreativePurpose[]) {
    const compatible = morphologyPools[purpose].filter(option => option.compatible.includes(family));
    const pool = compatible.length ? compatible : morphologyPools[purpose];
    const available = pool.filter(option => !excluded.has(option.id));
    const selectedFrom = available.length ? available : pool;
    const selected = pick(selectedFrom, `${seed}:${purpose}`);
    const alternatives = pool.filter(option => option.id !== selected.id && !excluded.has(option.id)).map(option => option.id);
    morphologyConstraints[purpose] = { selected: selected.id, alternatives };
    excluded.add(selected.id);
  }
  const explicitFromPrompt = explicitPatterns(input.prompt ?? '');
  const prohibitedPatterns = initialProhibited.filter(pattern => !explicitFromPrompt.has(pattern));
  const industry = `${input.brief.industry} ${input.brief.valueProposition}`.toLowerCase();
  if (/technology|tecnolog|software|fintech/.test(industry)) prohibitedPatterns.push('generic-network-svg', 'dashboard-mockup', 'glowing-orb', 'bento-default');
  if (/fashion|moda|apparel/.test(industry)) prohibitedPatterns.push('three-equal-feature-cards', 'three-centered-stats', 'centered-rounded-cta');
  if (['annotated-atlas', 'map-led-story'].includes(compositionGrammar)) prohibitedPatterns.push('generic-network-svg', 'dashboard-mockup');
  if (['campaign-poster', 'cinematic-sequence', 'typographic-manifesto'].includes(compositionGrammar)) prohibitedPatterns.push('bento-default', 'three-equal-feature-cards');
  for (const { fingerprint } of input.recentFingerprints ?? []) {
    if (fingerprint.heroLayout === 'split-two-column') prohibitedPatterns.push('generic-split-hero');
    if (fingerprint.cardCount >= 3 && fingerprint.equalColumnPatterns.length) prohibitedPatterns.push('three-equal-feature-cards', 'bento-default');
    if (fingerprint.faqMorphology === 'accordion' && fingerprint.ctaMorphology === 'centered-cta') prohibitedPatterns.push('centered-accordion');
    if (fingerprint.stickyUsage > 0) prohibitedPatterns.push('sticky-action');
  }
  for (const [purpose, constraint] of Object.entries(morphologyConstraints) as Array<[CreativePurpose, MorphologyConstraint]>) {
    if (purpose === 'opening' && constraint.selected === 'annotated-map') prohibitedPatterns.push('generic-network-svg');
    if (purpose === 'features' && constraint.selected === 'horizontal-rail') prohibitedPatterns.push('three-equal-feature-cards');
    if (purpose === 'proof' && constraint.selected === 'giant-number-field') prohibitedPatterns.push('three-centered-stats');
    if (purpose === 'objections' && constraint.selected === 'accordion') prohibitedPatterns.push('centered-accordion');
    if (purpose === 'closing' && constraint.selected === 'integrated-conversion') prohibitedPatterns.push('centered-rounded-cta');
  }
  const noveltyBudget = Math.max(0, Math.min(1, input.noveltyBudget ?? 0.65));
  const artDirectionIntensity = Math.max(0, Math.min(1, input.artDirectionIntensity ?? 0.7));
  const seedDecisions: SeedDecision[] = [
    { seed: `${seed}:composition`, decision: compositionGrammar, promptDirective: `Adopt composition grammar “${compositionGrammar}”.` },
    { seed: `${seed}:rhythm`, decision: pick(rhythms, `${seed}:rhythm`), promptDirective: `Set visual rhythm to “${pick(rhythms, `${seed}:rhythm`)}”.` },
    { seed: `${seed}:density`, decision: pick(['sparse', 'restrained', 'layered', 'dense-editorial'], `${seed}:density`), promptDirective: `Use ${pick(['sparse', 'restrained', 'layered', 'dense-editorial'], `${seed}:density`)} content density.` },
    { seed: `${seed}:typography`, decision: pick(typographyBehaviors, `${seed}:typography`), promptDirective: `Use typography behavior “${pick(typographyBehaviors, `${seed}:typography`)}”.` }
  ];
  const artDirection = `${styleSeed || family}; interpret the ${family} market through brand-specific material, language, and imagery.`;
  const visualStrategy = /fashion|moda/.test(industry) ? 'Use brand-specific garments, material, styling, or retail context; avoid generic connectivity diagrams.'
    : /game|gaming|videojuego/.test(industry) ? 'Use a specific play surface, community artifact, or game-world material; avoid generic dashboards and network diagrams.'
      : /technology|tecnolog|software|fintech/.test(industry) ? 'Show the product, workflow, interface detail, or real operational artifact; avoid generic network SVGs, glowing orbs, and dashboard mockups.'
        : `Use imagery tied to ${input.brief.brandName || input.brief.industry || 'the brand'} and its market; avoid generic abstract connectivity SVGs when a specific asset is possible.`;
  const commercialPurposes = [
    `Introduce ${input.brief.brandName || 'the brand'} and its value proposition.`,
    `Explain the offer for ${input.brief.targetAudience || 'the intended audience'}.`,
    'Present proof only when supported by brief or verified sources.',
    'Resolve the audience’s actual objections without imposing a default presentation.',
    `Make the requested action clear: ${input.brief.primaryAction || 'the primary conversion action'}.`
  ];
  return {
    commercialPurposes, artDirection, compositionGrammar: seedDecisions[0].decision, visualRhythm: seedDecisions[1].decision,
    density: seedDecisions[2].decision, typographyBehavior: seedDecisions[3].decision, visualStrategy,
    morphologyConstraints, prohibitedPatterns: [...new Set(prohibitedPatterns)].filter(pattern => !explicitFromPrompt.has(pattern)), noveltyBudget, artDirectionIntensity,
    conventionBreaking: noveltyBudget >= 0.45,
    seedDecisions: [...seedDecisions, ...Object.entries(morphologyConstraints).map(([purpose, constraint]) => ({ seed: `${seed}:${purpose}`, decision: constraint.selected, promptDirective: `For ${purpose}, prefer morphology “${constraint.selected}”; compatible alternatives: ${constraint.alternatives.join(', ')}.` }))]
  };
}

export function composeCreativeContractPrompt(contract: CreativeContract): string {
  const morphologyLines = Object.entries(contract.morphologyConstraints).map(([purpose, value]) => `- ${purpose}: selected ${value.selected}; alternatives ${value.alternatives.join(', ')}.`);
  return [
    'CREATIVE CONTRACT — SEMANTIC DIRECTION ONLY; you still author the final HTML/CSS/JS.',
    'PURPOSE IS NOT PRESENTATION. Preserve the user’s requested content and commercial purpose. Do not force sections into cards, accordions, split heroes, or equal grids unless the user explicitly requested that presentation.',
    `Commercial purposes:\n${contract.commercialPurposes.map(item => `- ${item}`).join('\n')}`,
    `Art direction: ${contract.artDirection}\nComposition grammar: ${contract.compositionGrammar}\nVisual rhythm: ${contract.visualRhythm}\nDensity: ${contract.density}\nTypography behavior: ${contract.typographyBehavior}\nNovelty budget: ${contract.noveltyBudget.toFixed(2)}\nArt-direction intensity: ${contract.artDirectionIntensity.toFixed(2)}\nConvention breaking: ${contract.conventionBreaking ? 'intentional' : 'restrained'}`,
    `Morphology constraints (semantic suggestions, not a component template):\n${morphologyLines.join('\n')}`,
    `Prohibited patterns unless explicitly requested by the user:\n${contract.prohibitedPatterns.map(pattern => `- ${pattern}`).join('\n')}`,
    `Visual strategy: ${contract.visualStrategy}`,
    `Seed decisions already derived by Entrospec; consume these decisions, do not claim to hash the seed yourself:\n${contract.seedDecisions.map(item => `- ${item.seed} → ${item.decision} → ${item.promptDirective}`).join('\n')}`,
    'NEVER invent statistics, certifications, guarantees, customer counts, performance percentages, or business claims. If data is unavailable, use qualitative evidence structures instead.'
  ].join('\n\n');
}
