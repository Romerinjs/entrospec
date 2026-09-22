import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandBriefForm } from './BrandBriefForm';

describe('BrandBriefForm', () => {
  it('renders labeled brand fields and the reference upload', () => {
    const html = renderToStaticMarkup(<BrandBriefForm value={{ brandName: '', industry: '', valueProposition: '', targetAudience: '', brandPersonality: '', toneOfVoice: '', primaryAction: '' }} onChange={() => undefined} />);
    expect(html).toContain('Nombre de marca');
    expect(html).toContain('Público objetivo');
    expect(html).toContain('Referencia visual');
  });
});
