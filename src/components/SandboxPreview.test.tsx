import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SandboxPreview } from './SandboxPreview';

describe('SandboxPreview', () => {
  it('uses a scripts-only sandbox for the generated document', () => {
    const record: any = { htmlCode: '<!doctype html><main>ok</main>', blueprint: { metadata: { title: 'Northline' } }, audit: { passesBank: false } };
    const html = renderToStaticMarkup(<SandboxPreview record={record} onSaveDraft={vi.fn()} onSaveCurated={vi.fn()} />);
    expect(html).toContain('sandbox="allow-scripts"');
    expect(html).not.toContain('allow-same-origin');
  });
});
