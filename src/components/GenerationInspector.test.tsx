import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GenerationInspector } from './GenerationInspector';

describe('GenerationInspector', () => {
  it('shows the executed prompt, calls, and visual provenance', () => {
    const record: any = { request: { executedPrompt: 'Prompt exacto' }, visual: { source: 'procedural' }, callsUsed: { textCalls: 1, imageCalls: 0 }, audit: { scores: { average: 8 }, evidence: [], blockers: [] }, blueprint: { metadata: { title: 'Northline' } } };
    const html = renderToStaticMarkup(<GenerationInspector record={record} />);
    expect(html).toContain('Prompt exacto');
    expect(html).toContain('procedural');
  });
});
