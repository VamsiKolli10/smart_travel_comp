const usageBuckets = new Map();

function envKeyFor(service) {
  return service.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

function trackExternalCall({
  service,
  userId = "anonymous",
  cost = 1,
  windowMs = 10 * 60 * 1000,
  metadata = {},
}) {
  if (!service) return null;

  const now = Date.now();
  const bucketId = `${service}:${Math.floor(now / windowMs)}`;
  const bucket = usageBuckets.get(bucketId) || {
    count: 0,
    firstSeen: now,
    alerted: false,
  };
  bucket.count += cost;
  usageBuckets.set(bucketId, bucket);

  const envKey = `USAGE_ALERT_THRESHOLD_${envKeyFor(service)}`;
  const threshold = Number(process.env[envKey] || process.env.USAGE_ALERT_FALLBACK || 500);

  if (!bucket.alerted && threshold > 0 && bucket.count >= threshold) {
    bucket.alerted = true;
    console.warn(
      `[monitoring] ${service} usage crossed ${threshold} units in ${(now - bucket.firstSeen) / 1000}s`,
      {
        userId,
        metadata,
        count: bucket.count,
      }
    );
  }

  return bucket;
}

function getUsageSnapshot() {
  return Array.from(usageBuckets.entries()).map(([bucketId, info]) => ({
    bucketId,
    ...info,
  }));
}

module.exports = { trackExternalCall, getUsageSnapshot };
