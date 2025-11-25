const request = require("supertest");

jest.mock("../src/lib/openrouterClient", () => ({
  chatComplete: jest.fn(),
}));

const { chatComplete } = require("../src/lib/openrouterClient");

describe("Culture intelligence routes", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default model response
    chatComplete.mockResolvedValue(
      JSON.stringify({
        destination: "Paris",
        culture: "French",
        language: "en",
        categories: {
          greetings: ["Hi", "Hello", "Good day"],
          dining: ["tip", "reserve", "be polite"],
          dress_code: ["smart casual", "clean shoes", "modest"],
          gestures: ["handshake", "eye contact", "no pointing"],
          taboos: ["loud voices", "cutting lines", "politics"],
          safety_basics: ["watch bags"],
        },
      })
    );
  });

  test("requires destination for culture brief", async () => {
    const res = await request(app)
      .get("/api/culture/brief")
      .set("user-agent", "jest");
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("returns culture brief when destination provided", async () => {
    const res = await request(app)
      .get("/api/culture/brief?destination=Paris")
      .set("user-agent", "jest");

    expect(res.statusCode).toBe(200);
    expect(res.body.destination).toBe("Paris");
    expect(Array.isArray(res.body.categories?.greetings)).toBe(true);
  });

  test("returns 502 when model response is malformed", async () => {
    chatComplete.mockResolvedValueOnce("nonsense");

    const res = await request(app)
      .get("/api/culture/brief?destination=Paris")
      .set("user-agent", "jest");

    expect(res.statusCode).toBe(502);
    expect(res.body.error.code).toBe("EXTERNAL_SERVICE_ERROR");
  });

  test("cultural etiquette legacy endpoint proxies brief", async () => {
    const res = await request(app)
      .get("/api/cultural-etiquette?destination=Paris")
      .set("user-agent", "jest");

    expect(res.statusCode).toBe(200);
    expect(res.body.destination).toBe("Paris");
  });

  test("culturalEtiquetteController handles getBrief error", async () => {
    jest.resetModules();
    jest.doMock("../src/controllers/culturalEtiquetteController", () => ({
      generateCulturalEtiquette: jest
        .fn()
        .mockImplementation((_req, res) =>
          res
            .status(500)
            .json({
              error: { code: "INTERNAL_ERROR", message: "forced failure" },
            })
        ),
    }));

    const { createApp } = require("../src/app");
    const appWithMock = createApp();

    const res = await request(appWithMock)
      .get("/api/cultural-etiquette?destination=Paris")
      .set("user-agent", "jest");

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    jest.resetModules();
  });

  test("validates culture Q&A payload", async () => {
    const res = await request(app)
      .post("/api/culture/qa")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ destination: "", question: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("returns culture Q&A answer for valid payload", async () => {
    chatComplete.mockResolvedValueOnce(
      JSON.stringify({ answer: "Bonjour", highlights: ["Be polite"] })
    );

    const res = await request(app)
      .post("/api/culture/qa")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ destination: "Paris", question: "How to greet?" });

    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBeDefined();
    expect(Array.isArray(res.body.highlights)).toBe(true);
  });

  test("returns contextual tips for valid payload", async () => {
    chatComplete.mockResolvedValueOnce(
      JSON.stringify({ tips: ["Be polite"], severity: "info" })
    );

    const res = await request(app)
      .post("/api/culture/contextual")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({
        contextType: "translation",
        destination: "Paris",
        text: "Hello",
        sourceLang: "en",
        targetLang: "fr",
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tips)).toBe(true);
  });

  test("rejects invalid contextType", async () => {
    const res = await request(app)
      .post("/api/culture/contextual")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ contextType: "unknown" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
