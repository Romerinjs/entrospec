import { describe, expect, it } from 'vitest';
import { auditLanding } from './auditEngine';

describe('auditLanding', () => {
  it('does not admit a document with blockers', () => {
    const result = auditLanding({ html: '<script src="https://cdn.example/x.js"></script>', blueprint: { techniquePlan: [] } as any, activeTechniqueIds: [], visualSource: 'procedural' });
    expect(result.passesBank).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });
});
