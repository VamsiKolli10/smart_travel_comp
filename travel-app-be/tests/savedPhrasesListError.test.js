const request = require("supertest");

describe("Saved phrases list error handling", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("returns 401 when listing without auth", async () => {
    const res = await request(app).get("/api/saved-phrases").set("user-agent", "jest");
    expect(res.statusCode).toBe(401);
  });
});
