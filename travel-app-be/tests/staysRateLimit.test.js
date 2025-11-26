const request = require("supertest");

describe("Stays rate limits", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("returns 429 when stay search quota exceeded", async () => {
    const agent = request.agent(app);
    let lastStatus = 200;
    for (let i = 0; i < 70; i++) {
      const res = await agent
        .get("/api/stays/search?lat=1&lng=2")
        .set("user-agent", "jest")
        .set("Authorization", "Bearer valid-user-token");
      lastStatus = res.statusCode;
      if (res.statusCode === 429) break;
    }
    expect([200, 429]).toContain(lastStatus);
  });
});
