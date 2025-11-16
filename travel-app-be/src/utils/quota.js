const windows = new Map();

function buildKey(identifier, key) {
  return `${key}:${identifier}`;
}

function enforceQuota({
  identifier = "anonymous",
  key,
  limit = 10,
  windowMs = 3600000,
}) {
  if (!key) {
    throw new Error("Quota enforcement requires a key");
  }
  const now = Date.now();
  const bucketKey = buildKey(identifier, key);
  const existing = windows.get(bucketKey);
  const resetAt = existing && existing.resetAt > now ? existing.resetAt : now + windowMs;
  const count = existing && existing.resetAt > now ? existing.count : 0;

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  windows.set(bucketKey, { count: count + 1, resetAt });
  return {
    allowed: true,
    remaining: Math.max(0, limit - (count + 1)),
    resetAt,
  };
}

module.exports = { enforceQuota };
