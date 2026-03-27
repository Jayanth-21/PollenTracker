/** In-memory cache with 30-minute TTL (per API route namespace). */

const TTL_MS = 30 * 60 * 1000;

/** @type {Record<string, Record<string, { storedAt: number, payload: unknown }>>} */
const buckets = {
  pollen: Object.create(null),
  weather: Object.create(null),
};

/**
 * @param {'pollen' | 'weather'} namespace
 * @param {string} key
 * @returns {unknown | null}
 */
export function getCached(namespace, key) {
  const bucket = buckets[namespace];
  const row = bucket[key];
  if (!row) return null;
  if (Date.now() - row.storedAt > TTL_MS) {
    delete bucket[key];
    return null;
  }
  return row.payload;
}

/**
 * @param {'pollen' | 'weather'} namespace
 * @param {string} key
 * @param {unknown} payload
 */
export function setCached(namespace, key, payload) {
  buckets[namespace][key] = { storedAt: Date.now(), payload };
}
