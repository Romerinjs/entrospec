import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TechniquesSelector, type TechniqueItemView } from './TechniquesSelector';

const mockTechniques: TechniqueItemView[] = [
  { id: 1, title: 'SSoT', description: 'Semilla', directive: 'Derivar chunks', enabled: true },
  { id: 2, title: 'Persuasión profunda', description: 'Objeciones', directive: 'Explicar objeciones', enabled: false },
  { id: 3, title: 'Creator-Critic', description: 'Auditoría', directive: 'Exponer auditoría', enabled: false },
  { id: 4, title: 'Imagen generativa', description: 'Hero visual', directive: 'Crear hero', enabled: false },
  { id: 5, title: 'Motion', description: 'Movimiento', directive: 'Interacción', enabled: false },
  { id: 6, title: 'Diseño sustractivo', description: 'Menos ruido', directive: 'Eliminar 30%', enabled: false },
  { id: 7, title: 'Restricciones anti-slop', description: 'Cero clichés', directive: 'Bloquear clichés', enabled: false },
  { id: 8, title: 'Microcopy humano', description: 'Copy directo', directive: 'Acción concreta', enabled: false }
];

describe('TechniquesSelector', () => {
  it('renders all 8 techniques with call metrics and isolate buttons', () => {
    const html = renderToStaticMarkup(
      <TechniquesSelector
        techniques={mockTechniques}
        onToggleTechnique={vi.fn()}
        onIsolateTechnique={vi.fn()}
        onSelectAll={vi.fn()}
        totalCalls={1}
      />
    );
    expect(html).toContain('LAS 8 TÉCNICAS DEL SISTEMA');
    expect(html).toContain('TÉCNICA 01');
    expect(html).toContain('TÉCNICA 08');
    expect(html).toContain('1 LLAMADA API');
    expect(html).toContain('Aislar (1 llamada)');
  });
});
