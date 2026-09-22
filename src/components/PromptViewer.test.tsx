import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PromptViewer } from './PromptViewer';

describe('PromptViewer', () => {
  it('renders an executable editable prompt', () => {
    const html = renderToStaticMarkup(<PromptViewer value="Prompt exacto" generatedValue="Prompt exacto" onChange={vi.fn()} onExecute={vi.fn()} onReset={vi.fn()} disabled={false} />);
    expect(html).toContain('Ejecutar prompt');
    expect(html).toContain('Prompt exacto');
  });
});
