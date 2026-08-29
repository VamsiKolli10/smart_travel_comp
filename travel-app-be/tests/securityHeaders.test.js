const request = require("supertest");

describe("Security middleware", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("applies security headers on responses", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-xss-protection"]).toBeDefined();
  });

  test("allows requests from whitelisted origins", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("user-agent", "jest")
      .set("origin", "http://localhost:5173")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
  });

  test("blocks requests from non-whitelisted origins", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("user-agent", "jest")
      .set("origin", "http://malicious-site.com")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    expect(res.statusCode).toBe(403);
  });
});
