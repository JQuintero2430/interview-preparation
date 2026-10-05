/**
 * localStorage can throw on READ (corrupt JSON we wrote ourselves, blocked storage) and on WRITE
 * (quota exceeded, Safari private mode in older versions, storage disabled). Never let it crash render.
 */
export function readJson<T>(storage: Pick<Storage, 'getItem'>, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(storage: Pick<Storage, 'setItem'>, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
