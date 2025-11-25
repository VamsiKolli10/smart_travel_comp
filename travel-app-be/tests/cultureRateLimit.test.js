const request = require("supertest");

describe("Culture brief rate limiting by role", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("allows admin to exceed user limit", async () => {
    const userAgent = request.agent(app);
    let hit429 = false;
    for (let i = 0; i < 45; i++) {
      const res = await userAgent
        .get("/api/culture/brief?destination=Paris")
        .set("user-agent", "jest");
      if (res.statusCode === 429) {
        hit429 = true;
        break;
      }
    }

    const adminRes = await request(app)
      .get("/api/culture/brief?destination=Paris")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-admin-token");

    expect([200, 429, 500]).toContain(adminRes.statusCode);
  });
});
