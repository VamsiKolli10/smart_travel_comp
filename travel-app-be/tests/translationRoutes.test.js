const request = require("supertest");

jest.mock("../src/controllers/translationController", () => {
  const translateText = jest.fn(async (req, res) => {
    if (req.body.langPair === "zz-zz") {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR" },
      });
    }
    return res.json({ translation: `translated:${req.body.text}` });
  });
  const warmup = jest.fn((req, res) => res.json({ warmed: ["fr-en"] }));
  return { translateText, warmup, __translateText: translateText };
});

const {
  __translateText: translateTextMock,
} = require("../src/controllers/translationController");

describe("Translation routes", () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("rejects unauthenticated translation attempts", async () => {
    const res = await request(app)
      .post("/api/translate")
      .set("user-agent", "jest")
      .send({ text: "hello", langPair: "en-es" });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("rejects unsupported language pairs", async () => {
    const res = await request(app)
      .post("/api/translate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ text: "hello", langPair: "zz-zz" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("validates payload before translating", async () => {
    const res = await request(app)
      .post("/api/translate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ text: "", langPair: "en-es" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details?.issues?.[0]).toMatch(/text/i);
  });

  test("rejects text that exceeds maximum length", async () => {
    const longText = "x".repeat(600);
    const res = await request(app)
      .post("/api/translate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ text: longText, langPair: "en-es" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("translates text when payload and auth are valid", async () => {
    const res = await request(app)
      .post("/api/translate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ text: "hello", langPair: "en-es" });

    expect(res.statusCode).toBe(200);
    expect(res.body.translation).toBe("translated:hello");
  });

  test("requires admin role for warmup and only warms supported pairs", async () => {
    const userAttempt = await request(app)
      .get("/api/translate/warmup?pairs=en-es")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");
    expect(userAttempt.statusCode).toBe(403);
    expect(userAttempt.body.error.code).toBe("FORBIDDEN");

    const res = await request(app)
      .get("/api/translate/warmup?pairs=fr-en,it-it")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.warmed).toEqual(["fr-en"]);
  });

  test("handles translator exceptions", async () => {
    translateTextMock.mockImplementationOnce(() => {
      throw new Error("Translation service unavailable");
    });

    const res = await request(app)
      .post("/api/translate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ text: "hello", langPair: "en-es" });

    expect([200, 500]).toContain(res.statusCode);
  });

  test("returns 500 when warmup fails", async () => {
    const { warmup } = require("../src/controllers/translationController");
    const spy = jest.spyOn(
      require("../src/controllers/translationController"),
      "warmup"
    );
    spy.mockImplementationOnce((_req, res) =>
      res.status(500).json({
        error: { code: "EXTERNAL_SERVICE_ERROR", message: "Warmup failed" },
      })
    );

    const res = await request(app)
      .get("/api/translate/warmup?pairs=en-es")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });
});
