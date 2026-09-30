import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PromptViewer } from './PromptViewer';
import { PromptExecutionConsole } from './PromptExecutionConsole';

describe('PromptViewer (Paso 1)', () => {
  it('renders Step 1 prompt generator with transfer and AI synthesis action', () => {
    const html = renderToStaticMarkup(
      <PromptViewer
        value="Prompt exacto"
        generatedValue="Prompt exacto"
        onChange={vi.fn()}
        onTransferToExecution={vi.fn()}
        onGeneratePromptWithAI={vi.fn()}
        onReset={vi.fn()}
        disabled={false}
      />
    );
    expect(html).toContain('PASO 1');
    expect(html).toContain('GENERAR PROMPT CON IA');
    expect(html).toContain('LLAMADA 1');
    expect(html).toContain('Transferir al campo de ejecución');
    expect(html).toContain('Prompt exacto');
  });
});

describe('PromptExecutionConsole (Paso 2)', () => {
  it('renders Step 2 execution field with Gemini API launch button', () => {
    const html = renderToStaticMarkup(
      <PromptExecutionConsole
        prompt="Prompt listo para ejecutar con IA"
        onChangePrompt={vi.fn()}
        onExecute={vi.fn()}
        stage="idle"
        estimate={{ textCalls: 1, imageCalls: 0, totalCalls: 1 }}
        activeTechniqueCount={3}
      />
    );
    expect(html).toContain('PASO 2');
    expect(html).toContain('EJECUTAR CON GEMINI · 1 LLAMADA');
    expect(html).toContain('Prompt creativo de ejecución');
    expect(html).toContain('CONSTRUIR LANDING');
    expect(html).toContain('Prompt listo para ejecutar con IA');
    expect(html).toContain('1 LLAMADA');
  });
});
