import { test, expect } from '@playwright/test';
import blueprint from '../fixtures/valid-blueprint.json' with { type: 'json' };
import image from '../fixtures/generated-image.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  let textCall = true;
  await page.route('**/v1beta/models/**', async route => {
    if (textCall) {
      textCall = false;
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(blueprint) }] } }] }) });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(image) });
  });
});

test('builds a native landing and keeps the exact prompt in the bank', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nombre de marca').fill('Northline');
  await page.getByRole('button', { name: /ejecutar prompt/i }).click();
  await expect(page.getByText('Completado')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTitle('Landing Sandbox Preview')).toBeVisible();
  await page.getByRole('button', { name: /enviar al banco/i }).click();
  await page.getByRole('button', { name: /^Banco \(\d+\)$/i }).click();
  await expect(page.getByLabel('Prompt de origen')).toBeVisible();
});

test('shows an actionable error when text generation is unavailable', async ({ page }) => {
  await page.unroute('**/v1beta/models/**');
  await page.route('**/v1beta/models/**', route => route.fulfill({ status: 429, body: 'quota' }));
  await page.goto('/');
  await page.getByRole('button', { name: /ejecutar prompt/i }).click();
  await expect(page.getByText('Gemini respondió 429: quota')).toBeVisible({ timeout: 10000 });
});
