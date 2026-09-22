import type { GeneratedVisualAsset, LandingBlueprint } from './types';

export interface NativeRenderInput {
  blueprint: LandingBlueprint;
  visual: GeneratedVisualAsset;
  capabilities: string[];
  activeTechniqueIds: number[];
  ssot: { seed: string };
}

function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}

function escapeAttr(value: string): string { return escapeHtml(value); }

function sectionMarkup(section: LandingBlueprint['sections'][number]): string {
  const items = section.items?.map(item => `<article class="proof-item"><h3>${escapeHtml(item.heading)}</h3><p>${escapeHtml(item.body)}</p></article>`).join('') || '';
  const cta = section.ctaLabel && section.ctaAction ? `<a class="cta" href="${escapeAttr(section.ctaAction)}">${escapeHtml(section.ctaLabel)}</a>` : '';
  return `<section id="${escapeAttr(section.id)}" class="landing-section section-${escapeAttr(section.type)}"><div class="section-copy"><p class="eyebrow">${escapeHtml(section.type)}</p><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p>${cta}</div>${items ? `<div class="proof-grid">${items}</div>` : ''}</section>`;
}

export function renderLandingDocument(input: NativeRenderInput): string {
  const { blueprint, visual, capabilities, ssot } = input;
  const tokens = blueprint.designTokens;
  const hero = blueprint.sections.find(section => section.type === 'hero') || blueprint.sections[0];
  const otherSections = blueprint.sections.filter(section => section !== hero).map(section => sectionMarkup(section)).join('');
  const motion = capabilities.includes('css-motion');
  const interaction = capabilities.includes('interaction-js');
  const canvas = capabilities.includes('canvas');
  const visualMarkup = visual.mimeType === 'image/svg+xml' ? `<img src="${escapeAttr(visual.dataUrl)}" alt="${escapeAttr(visual.alt)}" class="hero-visual" />` : `<img src="${escapeAttr(visual.dataUrl)}" alt="${escapeAttr(visual.alt)}" class="hero-visual" />`;
  const script = [
    motion ? `document.querySelectorAll('.landing-section').forEach((el)=>{const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting)entry.target.classList.add('is-visible')}),{threshold:.12});observer.observe(el);});` : '',
    interaction ? `document.querySelectorAll('[data-scroll]').forEach((link)=>link.addEventListener('click',(event)=>{const target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:document.documentElement.classList.contains('reduce-motion')?'auto':'smooth'});}}));` : '',
    canvas ? `const canvas=document.querySelector('#signal-canvas');if(canvas){const ctx=canvas.getContext('2d');let t=0;const draw=()=>{canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=canvas.clientHeight*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);ctx.strokeStyle='${tokens.accent}';ctx.beginPath();for(let x=0;x<canvas.clientWidth;x+=12){const y=canvas.clientHeight/2+Math.sin((x+t)*.04)*18;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();t+=.8;requestAnimationFrame(draw)};draw();}` : ''
  ].filter(Boolean).join('\n');
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(blueprint.brandInterpretation.brandName)} — ${escapeHtml(blueprint.metadata.title)}</title>
<style>
:root{color-scheme:dark;--bg:${tokens.background};--surface:${tokens.surface};--accent:${tokens.accent};--text:${tokens.textPrimary};--muted:${tokens.textSecondary};--radius:${tokens.radius}}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:${escapeAttr(tokens.fontBody)},system-ui,sans-serif;line-height:1.5}a{color:inherit}button,a{focus-visible:outline:2px solid var(--accent);focus-visible:outline-offset:4px}.shell{max-width:1240px;margin:0 auto;padding:0 32px}.topbar{display:flex;justify-content:space-between;align-items:center;padding:28px 0}.brand{font-weight:700;letter-spacing:-.04em}.mono,.eyebrow{font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:56px;align-items:center;padding:72px 0 110px}.hero h1{max-width:780px;font-family:${escapeAttr(tokens.fontDisplay)},system-ui,sans-serif;font-size:clamp(42px,7vw,88px);line-height:.98;letter-spacing:-.065em;margin:16px 0 24px}.hero p{max-width:660px;font-size:18px;color:var(--muted)}.cta{display:inline-flex;margin-top:24px;padding:14px 22px;background:var(--accent);color:var(--bg);font-weight:700;text-decoration:none;border-radius:var(--radius)}.visual-frame{background:var(--surface);min-height:320px;padding:14px;display:flex;align-items:center}.hero-visual{display:block;width:100%;height:auto;max-height:460px;object-fit:cover}.signal{background:var(--bg);min-height:120px}.landing-section{padding:80px 0;display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);gap:48px}.landing-section h2{font-size:clamp(28px,4vw,54px);line-height:1;letter-spacing:-.05em;margin:8px 0 16px}.section-copy>p:not(.eyebrow){color:var(--muted);max-width:560px}.proof-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.proof-item{background:var(--surface);padding:24px;min-height:150px}.proof-item h3{margin:0 0 10px}.proof-item p{color:var(--muted);margin:0}.footer{padding:48px 0;color:var(--muted);font-size:12px}.scroll-reveal .landing-section{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease}.is-visible{opacity:1!important;transform:none!important}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.landing-section,.is-visible{transition:none!important;transform:none!important}}@media(max-width:760px){.shell{padding:0 20px}.hero,.landing-section{grid-template-columns:1fr;gap:28px;padding:54px 0 72px}.hero h1{font-size:clamp(42px,14vw,68px)}.proof-grid{grid-template-columns:1fr}.topbar{align-items:flex-start;gap:14px;flex-direction:column}}
</style>
</head>
<body>
<div class="shell">
<header class="topbar"><div class="brand">${escapeHtml(blueprint.brandInterpretation.brandName)}</div><nav class="mono"><a data-scroll href="#${escapeAttr(blueprint.sections[1]?.id || 'proof')}">Explorar</a></nav></header>
<main>
<section class="hero" id="${escapeAttr(hero.id)}"><div><p class="eyebrow">${escapeHtml(blueprint.layout.style)} · ${escapeHtml(ssot.seed.slice(0, 8))}</p><h1>${escapeHtml(hero.heading)}</h1><p>${escapeHtml(hero.body)}</p>${hero.ctaLabel && hero.ctaAction ? `<a class="cta" data-scroll href="${escapeAttr(hero.ctaAction)}">${escapeHtml(hero.ctaLabel)}</a>` : ''}</div><div class="visual-frame">${visualMarkup}${canvas ? '<canvas id="signal-canvas" class="signal" aria-hidden="true"></canvas>' : ''}</div></section>
${otherSections}
</main>
<footer class="footer"><span>${escapeHtml(blueprint.brandInterpretation.brandName)}</span><span class="mono">Semilla ${escapeHtml(ssot.seed)}</span></footer>
</div>
<script>${script}</script>
</body>
</html>`;
}
