import { describe, expect, it } from 'vitest';
import { validateGeneratedDocument } from './documentValidator';

describe('validateGeneratedDocument', () => {
  it('rejects remote dependencies and missing landmarks', () => {
    const report = validateGeneratedDocument('<!doctype html><script src="https://cdn.example/x.js"></script>');
    expect(report.blockingIssues.map(issue => issue.code)).toEqual(expect.arrayContaining(['REMOTE_DEPENDENCY', 'MISSING_MAIN']));
  });

  it('accepts a native offline document with reduced motion and focus state', () => {
    const report = validateGeneratedDocument('<!DOCTYPE html><html><head><style>:focus-visible{outline:2px solid red}@media(prefers-reduced-motion:reduce){*{animation:none}}</style></head><body><main><h1>Hi</h1></main><script>document.body.dataset.ok="1"</script></body></html>');
    expect(report.blockingIssues).toHaveLength(0);
  });
});
