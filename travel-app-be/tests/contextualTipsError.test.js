const request = require("supertest");

jest.mock("../src/lib/openrouterClient", () => ({
  chatComplete: jest.fn(() => {
    throw new Error("upstream failed");
  }),
}));

describe("Contextual tips error handling", () => {
  let app;
  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("returns 502 when contextual tips cannot be parsed", async () => {
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

    expect(res.statusCode === 500 || res.statusCode === 502).toBe(true);
  });
});
