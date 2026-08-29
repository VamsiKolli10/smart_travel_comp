const DEFAULT_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 5 * 60 * 1000);
const MAX_ENTRIES = Number(process.env.API_CACHE_MAX || 500);
const CACHE_ENABLED = String(process.env.API_CACHE_ENABLED || "true") !== "false";
const CACHE_BACKEND = String(process.env.API_CACHE_BACKEND || "memory").toLowerCase();

// Minimal in-memory cache with TTL + simple LRU eviction
const store = new Map(); // key -> { value, expiresAt }
const stats = {
  hits: 0,
  misses: 0,
  evictions: 0,
  sets: 0,
};

const makeKey = (namespace, key) => `${namespace}:${key}`;

function getCached(namespace, key) {
  if (!CACHE_ENABLED) return null;
  if (!namespace || !key) return null;
  const cacheKey = makeKey(namespace, key);
  const entry = store.get(cacheKey);
  if (!entry) {
    stats.misses += 1;
    return null;
  }
  if (entry.expiresAt < Date.now()) {
    store.delete(cacheKey);
    stats.misses += 1;
    return null;
  }
  // refresh recency
  store.delete(cacheKey);
  store.set(cacheKey, entry);
  stats.hits += 1;
  return entry.value;
}

function setCached(namespace, key, value, ttlMs = DEFAULT_TTL_MS) {
  if (!CACHE_ENABLED) return;
  if (!namespace || !key || value === undefined) return;
  while (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    store.delete(oldestKey);
    stats.evictions += 1;
  }
  store.set(makeKey(namespace, key), {
    value,
    expiresAt: Date.now() + ttlMs,
  });
  stats.sets += 1;
}

function clearNamespace(namespace) {
  if (!CACHE_ENABLED) return 0;
  if (!namespace) return 0;
  let removed = 0;
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(`${namespace}:`)) {
      store.delete(key);
      removed += 1;
    }
  }
  return removed;
}

function getCacheStats() {
  return {
    ...stats,
    size: store.size,
    maxEntries: MAX_ENTRIES,
    defaultTtlMs: DEFAULT_TTL_MS,
    enabled: CACHE_ENABLED,
    backend: CACHE_BACKEND,
  };
}

module.exports = {
  getCached,
  setCached,
  clearNamespace,
  getCacheStats,
  DEFAULT_TTL_MS,
  MAX_ENTRIES,
};
