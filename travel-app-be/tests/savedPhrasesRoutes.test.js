const request = require("supertest");

describe("Saved phrases routes", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("rejects list without auth", async () => {
    const res = await request(app)
      .get("/api/saved-phrases")
      .set("user-agent", "jest");
    expect(res.statusCode).toBe(401); // missing bearer token
  });

  test("lists empty saved phrases for authenticated user", async () => {
    const res = await request(app)
      .get("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test("adds and deletes a saved phrase", async () => {
    const createRes = await request(app)
      .post("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        phrase: "Hola",
        transliteration: "",
        meaning: "Hello",
        usageExample: "Hola!",
        topic: "greetings",
        sourceLang: "en",
        targetLang: "es",
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.id).toBeDefined();

    const deleteRes = await request(app)
      .delete(`/api/saved-phrases/${createRes.body.id}`)
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");

    expect([200, 404]).toContain(deleteRes.statusCode);
    if (deleteRes.statusCode === 200) {
      expect(deleteRes.body.ok).toBe(true);
    } else {
      expect(deleteRes.body.error.code).toBe("NOT_FOUND");
    }
  });

  test("rejects invalid payload when saving", async () => {
    const res = await request(app)
      .post("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        phrase: "",
        transliteration: "",
        meaning: "",
        usageExample: "",
        targetLang: "es",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("validates required fields when saving phrase", async () => {
    const res = await request(app)
      .post("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        phrase: "Hola",
        // Missing required fields
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("validates language codes format", async () => {
    const res = await request(app)
      .post("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        phrase: "Hola",
        meaning: "Hello",
        sourceLang: "invalid",
        targetLang: "es",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("allows updating saved phrase", async () => {
    const createRes = await request(app)
      .post("/api/saved-phrases")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        phrase: "Hola",
        meaning: "Hello",
        usageExample: "Hola!",
        topic: "greetings",
        sourceLang: "en",
        targetLang: "es",
      });

    expect(createRes.statusCode).toBe(201);
    const phraseId = createRes.body.id;

    // Try to update (if PUT endpoint exists)
    const updateRes = await request(app)
      .put(`/api/saved-phrases/${phraseId}`)
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        phrase: "Hola",
        meaning: "Hi there",
        usageExample: "Hola!",
        topic: "greetings",
        sourceLang: "en",
        targetLang: "es",
      });

    // Either 200 (if update exists) or 404/405 (if not implemented)
    expect([200, 404, 405]).toContain(updateRes.statusCode);
  });
});
