const { enforceQuota } = require("../src/utils/quota");

describe("Quota utility", () => {
  test("allows within window then blocks and resets after window", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    const first = enforceQuota({ identifier: "u1", key: "test", limit: 2, windowMs: 1000 });
    expect(first.allowed).toBe(true);
    const second = enforceQuota({ identifier: "u1", key: "test", limit: 2, windowMs: 1000 });
    expect(second.allowed).toBe(true);
    const third = enforceQuota({ identifier: "u1", key: "test", limit: 2, windowMs: 1000 });
    expect(third.allowed).toBe(false);

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
});
