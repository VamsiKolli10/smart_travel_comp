const express = require("express");
const request = require("supertest");
const {
  createCustomLimiter,
  createRoleBasedLimiter,
  createMethodBasedLimiter,
} = require("../src/utils/rateLimiter");

function buildApp(middleware) {
  const app = express();
  app.use(middleware);
  app.get("/", (_req, res) => res.json({ ok: true }));
  app.post("/", (_req, res) => res.json({ ok: true }));
  return app;
}

describe("rateLimiter utilities", () => {
  test("createCustomLimiter blocks after max requests", async () => {
    const app = buildApp(
      createCustomLimiter({
        windowMs: 1000,
        max: 1,
        message: "limit hit",
        keyGenerator: () => "test-key",
      })
    );
    const agent = request.agent(app);

    const first = await agent.get("/");
    expect(first.statusCode).toBe(200);

    const second = await agent.get("/");
    expect(second.statusCode).toBe(429);
    expect(second.body.error?.code || second.body.error?.message).toBeDefined();
  });

  test("createRoleBasedLimiter applies role-specific limits", async () => {
    const limiter = createRoleBasedLimiter({
      windowMs: 1000,
      limits: { anonymous: 1 },
      defaultMessage: "role limit",
    });
    const app = buildApp(limiter);
    const agent = request.agent(app);

    const first = await agent.get("/");
    expect(first.statusCode).toBe(200);

    const second = await agent.get("/");
    expect(second.statusCode).toBe(429);
    expect(second.body.error?.code || second.body.error?.message).toBeDefined();
  });

  test("createMethodBasedLimiter applies per-method limits", async () => {
    const limiter = createMethodBasedLimiter({
      windowMs: 1000,
      limits: { POST: 1 },
      defaultMessage: "method limit",
    });
    const app = buildApp(limiter);
    const agent = request.agent(app);

    const first = await agent.post("/");
    expect(first.statusCode).toBe(200);

    const second = await agent.post("/");
    expect(second.statusCode).toBe(429);
    expect(second.body.error?.code || second.body.error?.message).toBeDefined();
  });
});
