const { enforceQuota, resetQuotaState } = require("../src/utils/quota");

describe("Quota utility", () => {
  beforeEach(() => {
    resetQuotaState();
    jest.restoreAllMocks();
  });

  test("allows within window then blocks and resets after window", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    const first = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 2,
      windowMs: 1000,
    });
    expect(first.allowed).toBe(true);
    expect(first.resetAt).toBeGreaterThan(now);

    const second = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 2,
      windowMs: 1000,
    });
    expect(second.allowed).toBe(true);

    const third = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 2,
      windowMs: 1000,
    });
    expect(third.allowed).toBe(false);
    expect(third.resetAt).toBeDefined();

    // Advance beyond window
    jest.spyOn(Date, "now").mockReturnValue(now + 1500);
    const afterReset = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 2,
      windowMs: 1000,
    });
    expect(afterReset.allowed).toBe(true);
  });

  test("tracks quotas separately by identifier", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    const u1First = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 1,
      windowMs: 1000,
    });
    const u2First = enforceQuota({
      identifier: "u2",
      key: "test",
      limit: 1,
      windowMs: 1000,
    });

    expect(u1First.allowed).toBe(true);
    expect(u2First.allowed).toBe(true);

    const u1Second = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 1,
      windowMs: 1000,
    });
    expect(u1Second.allowed).toBe(false);

    const u2Second = enforceQuota({
      identifier: "u2",
      key: "test",
      limit: 1,
      windowMs: 1000,
    });
    expect(u2Second.allowed).toBe(false);
  });

  test("tracks quotas separately by key", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    const key1First = enforceQuota({
      identifier: "u1",
      key: "key1",
      limit: 1,
      windowMs: 1000,
    });
    const key2First = enforceQuota({
      identifier: "u1",
      key: "key2",
      limit: 1,
      windowMs: 1000,
    });

    expect(key1First.allowed).toBe(true);
    expect(key2First.allowed).toBe(true);

    const key1Second = enforceQuota({
      identifier: "u1",
      key: "key1",
      limit: 1,
      windowMs: 1000,
    });
    expect(key1Second.allowed).toBe(false);

    const key2Second = enforceQuota({
      identifier: "u1",
      key: "key2",
      limit: 1,
      windowMs: 1000,
    });
    expect(key2Second.allowed).toBe(false);
  });

  test("provides resetAt timestamp for blocked requests", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    enforceQuota({ identifier: "u1", key: "test", limit: 1, windowMs: 1000 });
    const blocked = enforceQuota({
      identifier: "u1",
      key: "test",
      limit: 1,
      windowMs: 1000,
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.resetAt).toBeGreaterThan(now);
    expect(blocked.resetAt).toBeLessThanOrEqual(now + 1000);
  });
});
