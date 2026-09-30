export interface DocumentIssue { code: string; message: string }
export interface DocumentValidationReport { blockingIssues: DocumentIssue[]; warnings: DocumentIssue[] }

export function validateGeneratedDocument(html: string): DocumentValidationReport {
  const blockingIssues: DocumentIssue[] = [];
  const warnings: DocumentIssue[] = [];
  if (!/^\s*<!doctype html>/i.test(html)) blockingIssues.push({ code: 'MISSING_DOCTYPE', message: 'Falta doctype HTML5.' });
  if (!/<main\b/i.test(html)) blockingIssues.push({ code: 'MISSING_MAIN', message: 'Falta un elemento main.' });
  if (/<(?:script|link|img|video|source)\b[^>]+(?:src|href)=['"]https?:/i.test(html) || /(?:fetch|XMLHttpRequest|WebSocket|import\s*\()/i.test(html)) warnings.push({ code: 'REMOTE_DEPENDENCY', message: 'El documento contiene referencias remotas o dependencias externas.' });
  if (!/:focus-visible\b/i.test(html)) warnings.push({ code: 'MISSING_FOCUS', message: 'No se encontró estado focus-visible.' });
  if (!/prefers-reduced-motion/i.test(html)) warnings.push({ code: 'MISSING_REDUCED_MOTION', message: 'No se encontró regla para movimiento reducido.' });
  if (!/<style\b/i.test(html)) blockingIssues.push({ code: 'MISSING_STYLE', message: 'Falta CSS embebido.' });
  if (!/<script\b/i.test(html)) warnings.push({ code: 'MISSING_SCRIPT', message: 'No hay JavaScript embebido.' });
  if (/<(?:script|style)[^>]*src=/i.test(html)) warnings.push({ code: 'REMOTE_DEPENDENCY', message: 'Script o estilo externo detectado.' });
  return { blockingIssues, warnings };
}
