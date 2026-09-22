import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LandingBank } from './LandingBank';

describe('LandingBank', () => {
  it('shows a curated landing beside its executed prompt', () => {
    const record: any = { id: 'one', blueprint: { metadata: { title: 'Northline' } }, request: { executedPrompt: 'Prompt exacto' }, htmlCode: '<!doctype html>', audit: { scores: { average: 9 } }, createdAt: new Date().toISOString() };
    const html = renderToStaticMarkup(<LandingBank projects={[record]} onSelectProjectForStudio={vi.fn()} onDeleteProject={vi.fn()} />);
    expect(html).toContain('Prompt exacto');
    expect(html).toContain('Northline');
  });
});
