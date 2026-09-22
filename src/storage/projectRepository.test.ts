import { describe, expect, it } from 'vitest';
import { createProjectRepository } from './projectRepository';

const record: any = { id: 'one', collection: 'draft', audit: { passesBank: true, scores: { average: 9 } }, htmlCode: '<!doctype html>', createdAt: new Date().toISOString() };
const dbName = () => `entrospec-test-${Math.random().toString(16).slice(2)}`;

describe('project repository', () => {
  it('keeps drafts separate and rejects ineligible curated records', async () => {
    const repo = createProjectRepository({ databaseName: dbName() });
    await repo.saveDraft(record);
    expect((await repo.listDrafts()).map(item => item.id)).toEqual(['one']);
    await expect(repo.saveCurated({ ...record, audit: { ...record.audit, passesBank: false, scores: { average: 7 } } })).rejects.toMatchObject({ code: 'STORAGE_ERROR' });
  });

  it('round trips visual assets', async () => {
    const repo = createProjectRepository({ databaseName: dbName() });
    await repo.putVisualAsset({ cacheKey: 'x', source: 'procedural', mimeType: 'image/svg+xml', dataUrl: 'data:image/svg+xml,x', alt: 'x', byteLength: 1 });
    expect(await repo.getVisualAsset('x')).toMatchObject({ cacheKey: 'x' });
  });

  it('migrates legacy localStorage records before removing the key', async () => {
    const repo = createProjectRepository({ databaseName: dbName() });
    const storage = new Map<string, string>([['entrospec_landing_bank', JSON.stringify([{ id: 'legacy', title: 'Legacy', htmlCode: '<!doctype html>', createdAt: new Date().toISOString() }])]]);
    const adapter = { getItem: (key: string) => storage.get(key) || null, removeItem: (key: string) => storage.delete(key) };
    await repo.migrateLegacyProjects(adapter);
    expect(storage.has('entrospec_landing_bank')).toBe(false);
    expect((await repo.listDrafts()).find(item => item.id === 'legacy')).toBeTruthy();
  });
});
