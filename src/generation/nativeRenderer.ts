import type { GeneratedVisualAsset, LandingBlueprint, LandingSection } from './types';

export interface NativeRenderInput {
  blueprint: LandingBlueprint;
  visual: GeneratedVisualAsset;
  capabilities: string[];
  activeTechniqueIds: number[];
  ssot: { seed: string };
}

export type LayoutArchetype = 'centered_monumental' | 'bento_showcase' | 'terminal_tech' | 'luxury_magazine' | 'split_immersive' | 'asym_editorial' | 'modular_split';
export type HeaderStyle = 'floating_pill' | 'system_status' | 'editorial_classic' | 'split_brand';

function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}

function escapeAttr(value: string): string { return escapeHtml(value); }

export function resolveLayoutArchetype(styleHint = '', seed = ''): LayoutArchetype {
  const norm = (styleHint || '').toLowerCase();
  if (norm.includes('bento') || norm.includes('tarjet') || norm.includes('grid')) {
    return 'bento_showcase';
  }
  if (norm.includes('term') || norm.includes('tech') || norm.includes('mono') || norm.includes('brutal') || norm.includes('code') || norm.includes('dev')) {
    return 'terminal_tech';
  }
  if (norm.includes('centr') || norm.includes('monument') || norm.includes('foco') || norm.includes('central')) {
    return 'centered_monumental';
  }
  if (norm.includes('lux') || norm.includes('serif') || norm.includes('mag') || norm.includes('editorial') || norm.includes('eleganc')) {
    return 'luxury_magazine';
  }
  if (norm.includes('split') || norm.includes('inmersiv') || norm.includes('balance')) {
    return 'split_immersive';
  }
  if (norm.includes('asim') || norm.includes('suiz') || norm.includes('retícula') || norm.includes('diagonal')) {
    return 'asym_editorial';
  }
  const archetypes: LayoutArchetype[] = [
    'bento_showcase',
    'centered_monumental',
    'terminal_tech',
    'luxury_magazine',
    'split_immersive',
    'asym_editorial'
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return archetypes[hash % archetypes.length];
}

function resolveHeaderStyle(seed = ''): HeaderStyle {
  const styles: HeaderStyle[] = ['floating_pill', 'system_status', 'editorial_classic', 'split_brand'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 17 + seed.charCodeAt(i)) >>> 0;
  return styles[hash % styles.length];
}

function resolveFontStacks(archetype: LayoutArchetype, fontDisplayHint?: string, fontBodyHint?: string) {
  let displayStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
  let bodyStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  if (archetype === 'terminal_tech') {
    displayStack = 'ui-monospace, "SF Mono", "Cascadia Code", "Fira Code", Menlo, Consolas, monospace';
    bodyStack = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  } else if (archetype === 'luxury_magazine') {
    displayStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", Charter, Georgia, serif';
    bodyStack = 'Charter, Georgia, -apple-system, serif';
  } else if (archetype === 'centered_monumental') {
    displayStack = '"Arial Black", "Helvetica Neue", -apple-system, sans-serif';
    bodyStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  } else if (archetype === 'bento_showcase') {
    displayStack = '"Helvetica Neue", -apple-system, "Segoe UI", Roboto, sans-serif';
    bodyStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }

  if (fontDisplayHint && fontDisplayHint !== 'system-ui') {
    displayStack = `${fontDisplayHint}, ${displayStack}`;
  }
  if (fontBodyHint && fontBodyHint !== 'system-ui') {
    bodyStack = `${fontBodyHint}, ${bodyStack}`;
  }

  return { displayStack, bodyStack };
}

function renderHeader(brandName: string, headerStyle: HeaderStyle, targetSectionId: string): string {
  const brand = escapeHtml(brandName);
  const targetId = escapeAttr(targetSectionId || 'features');

  switch (headerStyle) {
    case 'floating_pill':
      return `
      <header class="header-floating-pill">
        <div class="brand">${brand}</div>
        <nav class="pill-nav">
          <a data-scroll href="#${targetId}" class="nav-link">Explorar</a>
          <a data-scroll href="#cta" class="nav-cta">Comenzar</a>
        </nav>
      </header>`;

    case 'system_status':
      return `
      <header class="header-system-bar">
        <div class="system-left">
          <span class="status-pulse" aria-hidden="true"></span>
          <span class="brand mono">${brand}</span>
          <span class="system-badge mono">v2.4 ONLINE</span>
        </div>
        <nav class="system-right mono">
          <span class="system-metric">LATENCIA: &lt;14ms</span>
          <a data-scroll href="#${targetId}" class="system-action">[EXPLORAR]</a>
        </nav>
      </header>`;

    case 'editorial_classic':
      return `
      <header class="header-editorial">
        <div class="brand-editorial">${brand}</div>
        <div class="editorial-divider"></div>
        <nav class="editorial-nav">
          <a data-scroll href="#${targetId}">Capacidades</a>
          <a data-scroll href="#proof">Evidencia</a>
          <a data-scroll href="#cta">Contacto</a>
        </nav>
      </header>`;

    case 'split_brand':
    default:
      return `
      <header class="topbar">
        <div class="brand">${brand}</div>
        <nav class="mono">
          <a data-scroll href="#${targetId}">Explorar</a>
        </nav>
      </header>`;
  }
}

function renderHero(
  hero: LandingSection,
  blueprint: LandingBlueprint,
  archetype: LayoutArchetype,
  visualMarkup: string,
  canvas: boolean,
  seed: string
): string {
  const cta = hero.ctaLabel && hero.ctaAction
    ? `<a class="cta" data-scroll href="${escapeAttr(hero.ctaAction)}">${escapeHtml(hero.ctaLabel)}</a>`
    : '';

  // 1. BENTO SHOWCASE (Grid asimétrico 8+4 cols en el hero)
  if (archetype === 'bento_showcase') {
    const proofMetric = blueprint.sections.find(s => s.type === 'proof')?.items?.[0];
    const metricVal = proofMetric?.heading || '+99.8%';
    const metricDesc = proofMetric?.body || 'Rendimiento auditado';

    return `
    <section class="hero hero-bento-grid" id="${escapeAttr(hero.id)}">
      <div class="bento-cell bento-hero-main">
        <div class="hero-content">
          <p class="eyebrow">${escapeHtml(blueprint.layout?.style || 'Bento Architecture')} · ${escapeHtml(seed.slice(0, 8))}</p>
          <h1>${escapeHtml(hero.heading)}</h1>
          <p class="hero-lead">${escapeHtml(hero.body)}</p>
          ${cta}
        </div>
        <div class="bento-visual-wrapper">
          ${visualMarkup}
          ${canvas ? '<canvas id="signal-canvas" class="signal" aria-hidden="true"></canvas>' : ''}
        </div>
      </div>
      <div class="bento-satellite-column">
        <div class="bento-cell bento-stat-card">
          <span class="mono text-accent text-xs uppercase">Métrica Clave</span>
          <div class="metric-giant mono">${escapeHtml(metricVal)}</div>
          <p class="stat-caption">${escapeHtml(metricDesc)}</p>
        </div>
        <div class="bento-cell bento-trust-card">
          <span class="mono text-xs uppercase text-muted">Garantía Nativa</span>
          <h3 class="trust-title">Cero Dependencias</h3>
          <p class="stat-caption">Compilación HTML5 pura sin librerías externas ni código de terceros.</p>
        </div>
      </div>
    </section>`;
  }

  // 2. TERMINAL SYSTEM (Ventana de sistema con controles Unix y monospace)
  if (archetype === 'terminal_tech') {
    return `
    <section class="hero hero-terminal-window" id="${escapeAttr(hero.id)}">
      <div class="terminal-bar">
        <div class="terminal-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="terminal-title mono">${escapeHtml(blueprint.brandInterpretation.brandName.toLowerCase())}.core.sys</span>
        <span class="mono text-xs text-muted">SSoT:${escapeHtml(seed.slice(0, 8))}</span>
      </div>
      <div class="terminal-body">
        <div class="terminal-pane terminal-copy">
          <p class="mono text-accent text-xs">&gt; SYS_INIT: OK</p>
          <h1>${escapeHtml(hero.heading)}</h1>
          <p class="terminal-lead">${escapeHtml(hero.body)}</p>
          ${cta}
        </div>
        <div class="terminal-pane terminal-visual">
          ${visualMarkup}
          ${canvas ? '<canvas id="signal-canvas" class="signal" aria-hidden="true"></canvas>' : ''}
        </div>
      </div>
    </section>`;
  }

  // 3. CENTERED MONUMENTAL (Titular colosal centrado y visual panorámico inferior)
  if (archetype === 'centered_monumental') {
    return `
    <section class="hero hero-centered-monumental" id="${escapeAttr(hero.id)}">
      <div class="hero-content centered-flow">
        <p class="eyebrow">${escapeHtml(blueprint.layout?.style || 'Monumental Foco')} · ${escapeHtml(seed.slice(0, 8))}</p>
        <h1>${escapeHtml(hero.heading)}</h1>
        <p class="hero-lead-centered">${escapeHtml(hero.body)}</p>
        <div class="hero-cta-group">
          ${cta}
          <a class="cta-secondary" data-scroll href="#features">Explorar Módulos</a>
        </div>
      </div>
      <div class="panoramic-visual-frame">
        ${visualMarkup}
        ${canvas ? '<canvas id="signal-canvas" class="signal" aria-hidden="true"></canvas>' : ''}
      </div>
    </section>`;
  }

  // 4. SPLIT IMMERSIVE (Disposición 50/50 balanceada con tarjeta de valor)
  if (archetype === 'split_immersive') {
    return `
    <section class="hero hero-split-immersive" id="${escapeAttr(hero.id)}">
      <div class="hero-content split-side">
        <p class="eyebrow">${escapeHtml(blueprint.layout?.style || 'Split Inmersivo')} · ${escapeHtml(seed.slice(0, 8))}</p>
        <h1>${escapeHtml(hero.heading)}</h1>
        <p class="hero-lead">${escapeHtml(hero.body)}</p>
        <ul class="hero-highlights">
          <li>✓ Experiencia sin fricción ni tiempos de espera</li>
          <li>✓ Diseño de alta fidelidad adaptado a tu sector</li>
          <li>✓ Rendimiento instantáneo y responsive total</li>
        </ul>
        ${cta}
      </div>
      <div class="visual-frame split-visual-side">
        ${visualMarkup}
        ${canvas ? '<canvas id="signal-canvas" class="signal" aria-hidden="true"></canvas>' : ''}
      </div>
    </section>`;
  }

  // 5. ASYM EDITORIAL & LUXURY MAGAZINE (Default robusto)
  return `
  <section class="hero hero-editorial-asym" id="${escapeAttr(hero.id)}">
    <div class="hero-content">
      <p class="eyebrow">${escapeHtml(blueprint.layout?.style || archetype)} · ${escapeHtml(seed.slice(0, 8))}</p>
      <h1>${escapeHtml(hero.heading)}</h1>
      <p class="hero-lead">${escapeHtml(hero.body)}</p>
      ${cta}
    </div>
    <div class="visual-frame">
      ${visualMarkup}
      ${canvas ? '<canvas id="signal-canvas" class="signal" aria-hidden="true"></canvas>' : ''}
    </div>
  </section>`;
}

function renderSectionItems(section: LandingSection): string {
  if (!section.items || section.items.length === 0) return '';

  if (section.type === 'faq') {
    return `<div class="faq-accordion">${section.items.map((item, idx) => `
      <details class="faq-item" ${idx === 0 ? 'open' : ''}>
        <summary class="faq-summary">
          <span class="faq-question">${escapeHtml(item.heading)}</span>
          <span class="faq-indicator" aria-hidden="true">↓</span>
        </summary>
        <div class="faq-body"><p>${escapeHtml(item.body)}</p></div>
      </details>
    `).join('')}</div>`;
  }

  if (section.type === 'proof') {
    return `<div class="metrics-grid">${section.items.map(item => `
      <article class="metric-card">
        <div class="metric-value mono">${escapeHtml(item.heading)}</div>
        <p class="metric-label">${escapeHtml(item.body)}</p>
      </article>
    `).join('')}</div>`;
  }

  if (section.type === 'feature') {
    return `<div class="feature-grid">${section.items.map((item, idx) => `
      <article class="feature-card">
        <span class="feature-index mono">${String(idx + 1).padStart(2, '0')}</span>
        <h3 class="feature-title">${escapeHtml(item.heading)}</h3>
        <p class="feature-body">${escapeHtml(item.body)}</p>
      </article>
    `).join('')}</div>`;
  }

  return `<div class="proof-grid">${section.items.map(item => `
    <article class="proof-item">
      <h3>${escapeHtml(item.heading)}</h3>
      <p>${escapeHtml(item.body)}</p>
    </article>
  `).join('')}</div>`;
}

function renderSection(section: LandingSection, archetype: LayoutArchetype, index: number): string {
  const items = renderSectionItems(section);
  const cta = section.ctaLabel && section.ctaAction
    ? `<a class="cta" href="${escapeAttr(section.ctaAction)}">${escapeHtml(section.ctaLabel)}</a>`
    : '';

  if (section.type === 'cta') {
    return `
    <section id="${escapeAttr(section.id)}" class="landing-section section-cta-banner">
      <div class="cta-banner-inner">
        <p class="eyebrow">${escapeHtml(section.type)}</p>
        <h2>${escapeHtml(section.heading)}</h2>
        <p class="cta-lead">${escapeHtml(section.body)}</p>
        ${cta}
        ${items}
      </div>
    </section>`;
  }

  // Si la sección es de métricas/proof: renderizar como franja panorámica
  if (section.type === 'proof' && items) {
    return `
    <section id="${escapeAttr(section.id)}" class="landing-section section-proof-panoramic">
      <div class="panoramic-header">
        <p class="eyebrow">${escapeHtml(section.type)}</p>
        <h2>${escapeHtml(section.heading)}</h2>
        <p class="panoramic-body">${escapeHtml(section.body)}</p>
      </div>
      <div class="panoramic-metrics-container">
        ${items}
      </div>
    </section>`;
  }

  // Alternar el orden en secciones estándar para romper la simetría
  const isAlt = index % 2 === 1;

  return `
  <section id="${escapeAttr(section.id)}" class="landing-section section-${escapeAttr(section.type)} ${isAlt ? 'section-flow-reversed' : ''} archetype-${archetype}">
    <div class="section-copy">
      <p class="eyebrow">${escapeHtml(section.type)}</p>
      <h2>${escapeHtml(section.heading)}</h2>
      <p>${escapeHtml(section.body)}</p>
      ${cta}
    </div>
    ${items ? `<div class="section-content">${items}</div>` : ''}
  </section>`;
}

export function renderLandingDocument(input: NativeRenderInput): string {
  const { blueprint, visual, capabilities, ssot } = input;
  const tokens = blueprint.designTokens;
  const archetype = resolveLayoutArchetype(blueprint.layout?.style, ssot.seed);
  const headerStyle = resolveHeaderStyle(ssot.seed);
  const { displayStack, bodyStack } = resolveFontStacks(archetype, tokens.fontDisplay, tokens.fontBody);

  const hero = blueprint.sections.find(section => section.type === 'hero') || blueprint.sections[0];
  const targetId = blueprint.sections.find(s => s !== hero)?.id || 'features';

  const otherSections = blueprint.sections
    .filter(section => section !== hero)
    .map((section, idx) => renderSection(section, archetype, idx))
    .join('\n');

  const motion = capabilities.includes('css-motion');
  const interaction = capabilities.includes('interaction-js');
  const canvas = capabilities.includes('canvas');

  const visualMarkup = `<img src="${escapeAttr(visual.dataUrl)}" alt="${escapeAttr(visual.alt)}" class="hero-visual" />`;

  const script = [
    motion ? `document.querySelectorAll('.landing-section').forEach((el)=>{const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting)entry.target.classList.add('is-visible')}),{threshold:.12});observer.observe(el);});` : '',
    interaction ? `document.querySelectorAll('[data-scroll]').forEach((link)=>link.addEventListener('click',(event)=>{const target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:document.documentElement.classList.contains('reduce-motion')?'auto':'smooth'});}}));` : '',
    canvas ? `const canvas=document.querySelector('#signal-canvas');if(canvas){const ctx=canvas.getContext('2d');let t=0;const draw=()=>{canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=canvas.clientHeight*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);ctx.strokeStyle='${tokens.accent}';ctx.beginPath();for(let x=0;x<canvas.clientWidth;x+=12){const y=canvas.clientHeight/2+Math.sin((x+t)*.04)*18;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();t+=.8;requestAnimationFrame(draw)};draw();}` : ''
  ].filter(Boolean).join('\n');

  const headerHtml = renderHeader(blueprint.brandInterpretation.brandName, headerStyle, targetId);
  const heroHtml = renderHero(hero, blueprint, archetype, visualMarkup, canvas, ssot.seed);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(blueprint.brandInterpretation.brandName)} — ${escapeHtml(blueprint.metadata.title)}</title>
<style>
:root {
  color-scheme: dark;
  --bg: ${tokens.background};
  --surface: ${tokens.surface};
  --accent: ${tokens.accent};
  --text: ${tokens.textPrimary};
  --muted: ${tokens.textSecondary};
  --radius: ${tokens.radius};
  --font-display: ${displayStack};
  --font-body: ${bodyStack};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button:focus-visible, a:focus-visible, summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
.shell {
  max-width: 1260px;
  margin: 0 auto;
  padding: 0 32px;
}

/* 1. ESTILOS DE CABECERA DIVERSOS */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.header-floating-pill {
  position: sticky;
  top: 16px;
  z-index: 100;
  max-width: 820px;
  margin: 16px auto 0;
  padding: 10px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 9999px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.pill-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}
.pill-nav .nav-link {
  font-size: 13px;
  color: var(--muted);
  transition: color 0.15s;
}
.pill-nav .nav-link:hover { color: var(--text); }
.pill-nav .nav-cta {
  padding: 6px 16px;
  background: var(--accent);
  color: var(--bg);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
}
.header-system-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.4);
  font-size: 12px;
}
.system-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.status-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22C55E;
  box-shadow: 0 0 10px #22C55E;
  display: inline-block;
}
.system-badge {
  background: rgba(34,197,94,0.12);
  color: #22C55E;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}
.system-right {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--muted);
}
.system-action {
  color: var(--accent);
  font-weight: 700;
}
.header-editorial {
  padding: 36px 0 20px;
  text-align: center;
}
.brand-editorial {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: -0.02em;
}
.editorial-divider {
  width: 60px;
  height: 2px;
  background: var(--accent);
  margin: 12px auto;
}
.editorial-nav {
  display: flex;
  justify-content: center;
  gap: 28px;
  font-size: 13px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.brand {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.03em;
  font-size: 1.15rem;
}
.mono, .eyebrow {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}
.text-accent { color: var(--accent); }
.text-muted { color: var(--muted); }
.text-xs { font-size: 11px; }
.uppercase { text-transform: uppercase; }

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 14px 28px;
  background: var(--accent);
  color: var(--bg);
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--radius);
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.cta:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 14px 28px;
  background: transparent;
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.2);
  font-weight: 600;
  border-radius: var(--radius);
  transition: border-color 0.15s ease;
}
.cta-secondary:hover { border-color: var(--accent); }
.hero-cta-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.visual-frame {
  background: var(--surface);
  min-height: 280px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}
.hero-visual {
  display: block;
  width: 100%;
  height: auto;
  max-height: 520px;
  object-fit: cover;
  border-radius: calc(var(--radius) * 0.75);
}
.signal {
  background: var(--bg);
  min-height: 120px;
  width: 100%;
}

/* 2. ARQUETIPOS DE HERO ESTRUCTURALES */

/* A. BENTO SHOWCASE HERO */
.hero-bento-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: 24px;
  padding: 64px 0 96px;
}
.bento-cell {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.07);
  padding: 36px;
  position: relative;
  overflow: hidden;
}
.bento-hero-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.bento-hero-main h1 {
  font-family: var(--font-display);
  font-size: clamp(38px, 6vw, 76px);
  line-height: 1;
  letter-spacing: -0.05em;
  margin: 16px 0 20px;
}
.hero-lead {
  font-size: 1.1rem;
  color: var(--muted);
  max-width: 600px;
  line-height: 1.5;
}
.bento-visual-wrapper {
  margin-top: 36px;
  background: rgba(0,0,0,0.3);
  border-radius: var(--radius);
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.04);
}
.bento-satellite-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.bento-stat-card {
  border-left: 3px solid var(--accent);
}
.metric-giant {
  font-size: clamp(44px, 5vw, 68px);
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
  margin: 12px 0 8px;
}
.stat-caption {
  font-size: 0.95rem;
  color: var(--muted);
  margin: 0;
}
.trust-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  margin: 10px 0 6px;
}

/* B. TERMINAL SYSTEM HERO */
.hero-terminal-window {
  margin: 48px 0 80px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  background: #000;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}
.terminal-bar {
  background: #111;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.terminal-dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot-red { background: #FF5F56; }
.dot-yellow { background: #FFBD2E; }
.dot-green { background: #27C93F; }
.terminal-body {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  padding: 40px;
  gap: 40px;
  align-items: center;
}
.terminal-copy h1 {
  font-family: var(--font-display);
  font-size: clamp(34px, 5vw, 68px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 14px 0 18px;
}
.terminal-lead {
  font-size: 1.05rem;
  color: var(--muted);
  font-family: var(--font-body);
}

/* C. CENTERED MONUMENTAL HERO */
.hero-centered-monumental {
  padding: 80px 0 96px;
  text-align: center;
}
.centered-flow {
  max-width: 920px;
  margin: 0 auto;
}
.hero-centered-monumental h1 {
  font-family: var(--font-display);
  font-size: clamp(48px, 8.5vw, 104px);
  line-height: 0.94;
  letter-spacing: -0.055em;
  margin: 16px auto 24px;
}
.hero-lead-centered {
  max-width: 680px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--muted);
  line-height: 1.5;
}
.panoramic-visual-frame {
  max-width: 1060px;
  margin: 54px auto 0;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}

/* D. SPLIT IMMERSIVE HERO */
.hero-split-immersive {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 56px;
  align-items: center;
  padding: 72px 0 100px;
}
.hero-split-immersive h1 {
  font-family: var(--font-display);
  font-size: clamp(40px, 6vw, 84px);
  line-height: 0.98;
  letter-spacing: -0.04em;
  margin: 16px 0 20px;
}
.hero-highlights {
  list-style: none;
  padding: 0;
  margin: 24px 0 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.95rem;
  color: var(--muted);
}
.hero-highlights li {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* E. EDITORIAL ASYM HERO */
.hero-editorial-asym {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.75fr);
  gap: 56px;
  align-items: center;
  padding: 80px 0 110px;
}
.hero-editorial-asym h1 {
  font-family: var(--font-display);
  font-size: clamp(42px, 7vw, 90px);
  line-height: 0.96;
  letter-spacing: -0.06em;
  margin: 16px 0 24px;
}

/* 3. SECCIONES INTERMEDIAS Y RITMO DE FLUJO */
.landing-section {
  padding: 88px 0;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.landing-section h2 {
  font-family: var(--font-display);
  font-size: clamp(30px, 4.5vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.045em;
  margin: 8px 0 16px;
}
.section-copy > p:not(.eyebrow) {
  color: var(--muted);
  max-width: 580px;
  font-size: 1.05rem;
}

/* Distribución estándar de 2 columnas */
.landing-section:not(.section-cta-banner):not(.section-proof-panoramic) {
  display: grid;
  grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
  gap: 48px;
}

/* Distribución invertida para romper la monotonía visual */
.section-flow-reversed:not(.section-cta-banner):not(.section-proof-panoramic) {
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr) !important;
}
.section-flow-reversed .section-copy {
  order: 2;
}
.section-flow-reversed .section-content {
  order: 1;
}

/* SECCIÓN PROOF PANORÁMICA (Franja a todo el ancho) */
.section-proof-panoramic {
  background: var(--surface);
  margin: 40px -32px;
  padding: 72px 32px !important;
  border: 1px solid rgba(255,255,255,0.05);
  border-left: none;
  border-right: none;
}
.panoramic-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
}
.panoramic-body {
  color: var(--muted);
  font-size: 1.05rem;
}
.panoramic-metrics-container .metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}
.panoramic-metrics-container .metric-card {
  text-align: center;
  border-left: none;
  border-bottom: 2px solid var(--accent);
  background: rgba(0,0,0,0.3);
  padding: 32px 20px;
}

/* FEATURES: Grid ordenado con números monoespaciados */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
.feature-card {
  background: var(--surface);
  padding: 28px;
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.04);
}
.feature-index {
  display: inline-block;
  color: var(--accent);
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 12px;
}
.feature-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  margin: 0 0 10px;
}
.feature-body {
  color: var(--muted);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* PROOF: Métricas destacadas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.metric-card {
  background: var(--surface);
  padding: 24px;
  border-radius: var(--radius);
  border-left: 2px solid var(--accent);
}
.metric-value {
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}
.metric-label {
  color: var(--muted);
  margin: 0;
  font-size: 0.9rem;
}

/* FAQ: Acordeón interactivo nativo */
.faq-accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.05);
  overflow: hidden;
}
.faq-summary {
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  user-select: none;
  list-style: none;
}
.faq-summary::-webkit-details-marker { display: none; }
.faq-question { font-size: 1.05rem; }
.faq-indicator {
  color: var(--accent);
  font-family: ui-monospace, monospace;
  font-weight: bold;
  transition: transform 0.2s ease;
}
.faq-item[open] .faq-indicator { transform: rotate(180deg); }
.faq-body {
  padding: 0 24px 20px;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.faq-body p { margin: 0; }

/* CTA BANNER: Bloque de conversión inmersivo */
.section-cta-banner {
  padding: 96px 0;
  text-align: center;
}
.cta-banner-inner {
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  padding: 64px 32px;
  max-width: 900px;
  margin: 0 auto;
}
.cta-banner-inner h2 {
  font-size: clamp(34px, 5vw, 64px);
  margin: 12px 0 16px;
}
.cta-lead {
  font-size: 1.15rem;
  color: var(--muted);
  max-width: 600px;
  margin: 0 auto;
}

/* Proof items genéricos */
.proof-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.proof-item {
  background: var(--surface);
  padding: 24px;
  border-radius: var(--radius);
  min-height: 140px;
}
.proof-item h3 { margin: 0 0 10px; }
.proof-item p { color: var(--muted); margin: 0; }

/* FOOTER */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 48px 0;
  color: var(--muted);
  font-size: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* SCROLL REVEAL & ACCESIBILIDAD */
.scroll-reveal .landing-section {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.is-visible {
  opacity: 1 !important;
  transform: none !important;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .landing-section, .is-visible {
    transition: none !important;
    transform: none !important;
  }
}

@media (max-width: 860px) {
  .shell { padding: 0 20px; }
  .hero-bento-grid,
  .hero-terminal-window .terminal-body,
  .hero-split-immersive,
  .hero-editorial-asym,
  .landing-section:not(.section-cta-banner) {
    grid-template-columns: 1fr !important;
    gap: 32px;
    padding: 54px 0 72px;
  }
  .section-flow-reversed .section-copy { order: 1; }
  .section-flow-reversed .section-content { order: 2; }
  .hero h1 { font-size: clamp(38px, 12vw, 64px); }
  .proof-grid, .feature-grid, .metrics-grid {
    grid-template-columns: 1fr;
  }
  .topbar, .header-floating-pill, .header-system-bar {
    align-items: flex-start;
    gap: 14px;
    flex-direction: column;
    border-radius: 16px;
  }
}
</style>
</head>
<body class="archetype-layout-${archetype}">
<div class="shell">
  ${headerHtml}
  <main>
    ${heroHtml}
    ${otherSections}
  </main>
  <footer class="footer">
    <span>${escapeHtml(blueprint.brandInterpretation.brandName)}</span>
    <span class="mono">Semilla ${escapeHtml(ssot.seed)}</span>
  </footer>
</div>
<script>${script}</script>
</body>
</html>`;
}


