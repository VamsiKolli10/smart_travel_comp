const request = require("supertest");

jest.mock("../src/lib/openrouterClient", () => ({
  chatComplete: jest.fn(async () =>
    JSON.stringify({ tips: ["Be polite", "Avoid loud tones"], severity: "info" })
  ),
}));

describe("Contextual tips success path", () => {
  let app;
  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("returns tips payload", async () => {
    const res = await request(app)
      .post("/api/culture/contextual")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        contextType: "translation",
        text: "hello",
        sourceLang: "en",
        targetLang: "fr",
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tips)).toBe(true);
  });
});
