/** The only text added to a user's creative execution prompt for AI Native. */
export const NATIVE_HTML_OUTPUT_CONTRACT = [
  '',
  'OUTPUT CONTRACT (Entrospec):',
  'Return one complete, self-contained HTML5 document with embedded CSS and JavaScript.',
  'Preserve all explicit user requirements and visual tokens. Do not return JSON or a Blueprint.',
  'Return only the document source; Markdown fences are optional.'
].join('\n');

export function composeNativeHtmlPrompt(executedPrompt: string): string {
  return `${executedPrompt}${NATIVE_HTML_OUTPUT_CONTRACT}`;
}

export function extractHtmlDocument(rawModelText: string): string {
  const fenced = rawModelText.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? rawModelText).trim();
  const start = candidate.search(/<!doctype\s+html|<html\b/i);
  return (start >= 0 ? candidate.slice(start) : candidate).trim();
}
