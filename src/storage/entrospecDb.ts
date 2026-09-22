export function openEntrospecDb(databaseName = 'entrospec'): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const projects = db.createObjectStore('projects', { keyPath: 'id' });
      projects.createIndex('collection', 'collection');
      projects.createIndex('createdAt', 'createdAt');
      db.createObjectStore('visualAssets', { keyPath: 'cacheKey' }).createIndex('createdAt', 'createdAt');
      db.createObjectStore('meta', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB unavailable'));
  });
}

export function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error || new Error('IndexedDB request failed')); });
}
