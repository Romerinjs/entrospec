import type { GeneratedVisualAsset, GenerationRecord } from '../generation/types';
import { openEntrospecDb, requestResult } from './entrospecDb';

export interface ProjectRepository {
  saveDraft(record: GenerationRecord | Record<string, unknown>): Promise<void>;
  saveCurated(record: GenerationRecord | Record<string, unknown>): Promise<void>;
  listDrafts(): Promise<any[]>;
  listCurated(): Promise<any[]>;
  getVisualAsset(cacheKey: string): Promise<GeneratedVisualAsset | undefined>;
  putVisualAsset(asset: GeneratedVisualAsset): Promise<void>;
  deleteProject(id: string): Promise<void>;
  migrateLegacyProjects(storage: { getItem(key: string): string | null; removeItem(key: string): void }): Promise<void>;
}

function storageError(message: string): Error & { code: 'STORAGE_ERROR' } { const error = new Error(message) as Error & { code: 'STORAGE_ERROR' }; error.code = 'STORAGE_ERROR'; return error; }

export function createProjectRepository(options: { databaseName?: string } = {}): ProjectRepository {
  const dbPromise = openEntrospecDb(options.databaseName);
  const write = async (record: any, collection: 'draft' | 'curated') => {
    if (collection === 'curated' && (!record.audit?.passesBank || Number(record.audit?.scores?.average || 0) < 8.5)) throw storageError('Solo se admiten landings con auditoría mínima de 8.5.');
    try { const db = await dbPromise; const tx = db.transaction('projects', 'readwrite'); tx.objectStore('projects').put({ ...record, collection }); await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } catch (cause) { throw storageError(cause instanceof Error ? cause.message : 'No se pudo guardar el proyecto.'); }
  };
  const list = async (collection: 'draft' | 'curated') => { const db = await dbPromise; const tx = db.transaction('projects', 'readonly'); return requestResult<any[]>(tx.objectStore('projects').index('collection').getAll(collection)); };
  return {
    saveDraft: record => write(record, 'draft'),
    saveCurated: record => write(record, 'curated'),
    listDrafts: () => list('draft'),
    listCurated: () => list('curated'),
    async getVisualAsset(cacheKey) { const db = await dbPromise; return requestResult<GeneratedVisualAsset | undefined>(db.transaction('visualAssets', 'readonly').objectStore('visualAssets').get(cacheKey)); },
    async putVisualAsset(asset) { const db = await dbPromise; const tx = db.transaction('visualAssets', 'readwrite'); tx.objectStore('visualAssets').put({ ...asset, createdAt: new Date().toISOString() }); await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(storageError('No se pudo guardar el activo.')); }); },
    async deleteProject(id) { const db = await dbPromise; const tx = db.transaction('projects', 'readwrite'); tx.objectStore('projects').delete(id); await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(storageError('No se pudo eliminar el proyecto.')); }); },
    async migrateLegacyProjects(storage) {
      const raw = storage.getItem('entrospec_landing_bank');
      if (!raw) return;
      let projects: any[];
      try { projects = JSON.parse(raw); if (!Array.isArray(projects)) throw new Error('Formato inválido'); } catch { throw storageError('El banco legacy no contiene JSON válido.'); }
      try {
        const db = await dbPromise; const tx = db.transaction('projects', 'readwrite'); const store = tx.objectStore('projects');
        for (const item of projects) store.put({ ...item, collection: 'draft', legacy: true });
        await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
        storage.removeItem('entrospec_landing_bank');
      } catch (cause) { throw storageError(cause instanceof Error ? cause.message : 'No se pudo migrar el banco legacy.'); }
    }
  };
}
