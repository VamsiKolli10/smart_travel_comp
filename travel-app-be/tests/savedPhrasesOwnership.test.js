const request = require("supertest");

describe("Saved phrases ownership checks", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("allows admin token to save phrases for own uid", async () => {
    const res = await request(app)
      .post("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-admin-token")
      .send({
        phrase: "Hola",
        meaning: "Hi",
        usageExample: "Hola!",
        targetLang: "es",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
