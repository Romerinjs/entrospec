import { test, expect } from '@playwright/test';
import blueprint from '../fixtures/v2-creative-proposal.json' with { type: 'json' };
import image from '../fixtures/generated-image.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let state = 0x5eed;
    Object.defineProperty(window.crypto, 'getRandomValues', {
      configurable: true,
      value: (array: Uint32Array) => {
        for (let index = 0; index < array.length; index++) { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; array[index] = state; }
        return array;
      }
    });
  });
  await page.route('**/v1beta/models/**', async route => {
    const requestBody = route.request().postDataJSON() as { generationConfig?: { responseMimeType?: string } };
    if (requestBody.generationConfig?.responseMimeType === 'text/plain') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#FDFBF7;color:#284b3d;font:16px Arial}main{padding:24px}h1{font-size:clamp(2rem,8vw,5rem)}a{display:inline-flex;min-height:44px;align-items:center;padding:12px}:focus-visible{outline:2px solid #284b3d}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style></head><body><main><h1>Landing crema</h1><p>Conserva #FDFBF7</p><a href="#go">Explorar</a></main></body></html>' }] } }] }) });
      return;
    }
    if (requestBody.generationConfig?.responseMimeType === 'application/json') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(blueprint) }] } }] }) });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(image) });
  });
});

test('builds AI Native HTML, displays the exact request, and measures responsive rendering', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toContainText('NoveltyBench');
  await expect(page.getByLabel('Dirección artística')).toHaveValue('');
  await expect(page.getByLabel('Dirección artística')).toHaveAttribute('placeholder', 'Auto — derivar del brief');
  await page.getByLabel('Nombre de marca').fill('Northline');
  await page.getByRole('button', { name: /ejecutar con gemini/i }).click();
  await expect(page.getByText('Completado')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTitle('Landing Sandbox Preview')).toBeVisible();
  const generatedPage = page.frameLocator('iframe[title="Landing Sandbox Preview"]');
  await expect(generatedPage.getByText('Landing crema')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Request final enviado a Gemini' })).toBeVisible();
  await expect(page.getByText(/model: .+ · temperature: 0.82 · responseMimeType: text\/plain · executionMode: ai_native_html/)).toBeVisible();
  const creativePrompt = await page.getByLabel('Campo de ejecución con IA').inputValue();
  const transmittedPrompt = await page.getByRole('textbox', { name: 'Request final enviado a Gemini' }).inputValue();
  expect(transmittedPrompt.startsWith(creativePrompt)).toBe(true);
  expect(transmittedPrompt.slice(creativePrompt.length)).toContain('OUTPUT CONTRACT (Entrospec):');
  const previewFrame = page.locator('iframe[title="Landing Sandbox Preview"]');
  for (const width of [390, 768, 1024, 1440]) {
    await previewFrame.evaluate((frame, viewportWidth) => { frame.style.width = `${viewportWidth}px`; frame.style.maxWidth = 'none'; }, width);
    const audit = await generatedPage.locator('html').evaluate(element => {
      const root = element as HTMLElement; const viewWidth = root.clientWidth;
      const nodes = Array.from(root.querySelectorAll('body *')).filter(item => getComputedStyle(item).display !== 'none');
      const outside = nodes.filter(item => { const r = item.getBoundingClientRect(); return r.left < -1 || r.right > viewWidth + 1; }).length;
      const clipped = nodes.filter(item => { const r = item.getBoundingClientRect(); return r.height > 0 && (item.scrollHeight > item.clientHeight + 2 || item.scrollWidth > item.clientWidth + 2) && /hidden|clip/.test(`${getComputedStyle(item).overflow}${getComputedStyle(item).textOverflow}`); }).length;
      const ctas = nodes.filter(item => item.matches('a,button,[role="button"]')).map(item => { const r = item.getBoundingClientRect(); return { width: r.width, height: r.height }; });
      const fonts = nodes.map(item => parseFloat(getComputedStyle(item).fontSize)).filter(Number.isFinite);
      const controls = nodes.filter(item => item.matches('a,button,[role="button"]'));
      let controlCollisions = 0;
      for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) { const a = controls[i].getBoundingClientRect(); const b = controls[j].getBoundingClientRect(); if (a.width && a.height && b.width && b.height && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) controlCollisions++; }
      return { scrollWidth: root.scrollWidth, clientWidth: viewWidth, outside, clipped, ctas, minimumFontSize: Math.min(...fonts), controlCollisions };
    });
    expect(audit.scrollWidth <= audit.clientWidth + 1, `${width}px overflow: ${JSON.stringify(audit)}`).toBe(true);
    expect(audit.outside, `${width}px elements outside viewport`).toBe(0);
    expect(audit.clipped, `${width}px clipped text`).toBe(0);
    expect(audit.ctas.every(cta => cta.width >= 44 && cta.height >= 44), `${width}px CTA hit area`).toBe(true);
    expect(audit.minimumFontSize, `${width}px font sizes`).toBeGreaterThanOrEqual(12);
    expect(audit.controlCollisions, `${width}px invalid CTA overlap`).toBe(0);
  }
  await previewFrame.evaluate((frame, viewportWidth) => { frame.style.width = `${viewportWidth}px`; }, page.viewportSize()!.width);
  await expect(page.getByRole('button', { name: /guardar en banco/i })).toBeDisabled();
});

test('executes the same prompt in AI Native and local Procedural V2 without choosing a winner', async ({ page }) => {
  let geminiCalls = 0;
  await page.route('**/v1beta/models/**', async route => { geminiCalls++; const body = route.request().postDataJSON() as any; await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: body.generationConfig.responseMimeType === 'text/plain' ? '<!doctype html><html><head><style>:focus-visible{outline:2px solid green}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style></head><body><main><h1>AI Native</h1></main></body></html>' : JSON.stringify(blueprint) }] } }] }) }); });
  await page.goto('/');
  await page.getByLabel('Nombre de marca').fill('Northline');
  await page.getByRole('button', { name: 'Generar el mismo prompt en ambos modos' }).click();
  await expect(page.getByTitle('Comparación ai_native_html')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTitle('Comparación procedural')).toBeVisible({ timeout: 15000 });
  expect(geminiCalls).toBe(1);
  await expect(page.getByText(/Sin Gemini · 0 llamadas · procedural/)).toBeVisible();
});

test('shows an actionable error when text generation is unavailable', async ({ page }) => {
  await page.unroute('**/v1beta/models/**');
  await page.route('**/v1beta/models/**', route => route.fulfill({ status: 429, body: 'quota' }));
  await page.goto('/');
  await page.getByRole('button', { name: /ejecutar con gemini/i }).click();
  await expect(page.getByText('Gemini respondió 429: quota')).toBeVisible({ timeout: 10000 });
});
