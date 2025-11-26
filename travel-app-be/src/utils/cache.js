const DEFAULT_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 5 * 60 * 1000);
const MAX_ENTRIES = Number(process.env.API_CACHE_MAX || 500);

// Minimal in-memory cache with TTL + simple LRU eviction
const store = new Map(); // key -> { value, expiresAt }

const makeKey = (namespace, key) => `${namespace}:${key}`;

function getCached(namespace, key) {
  if (!namespace || !key) return null;
  const cacheKey = makeKey(namespace, key);
  const entry = store.get(cacheKey);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(cacheKey);
    return null;
  }
  // refresh recency
  store.delete(cacheKey);
  store.set(cacheKey, entry);
  return entry.value;
}

function setCached(namespace, key, value, ttlMs = DEFAULT_TTL_MS) {
  if (!namespace || !key || value === undefined) return;
  while (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    store.delete(oldestKey);
  }
  store.set(makeKey(namespace, key), {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

module.exports = {
  getCached,
  setCached,
  DEFAULT_TTL_MS,
  MAX_ENTRIES,
};
