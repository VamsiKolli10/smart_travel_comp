const request = require("supertest");

jest.mock("../src/utils/quota", () => {
  const mockEnforceQuota = jest.fn(() => ({
    allowed: true,
    resetAt: Date.now() + 1000,
  }));
  return { enforceQuota: mockEnforceQuota, __mockEnforceQuota: mockEnforceQuota };
});

jest.mock("../src/lib/openrouterClient", () => {
  const mockChatComplete = jest.fn(async () =>
    JSON.stringify({
      topic: "Travel",
      sourceLang: "en",
      targetLang: "es",
      phrases: [
        {
          targetPhrase: "Hola",
          transliteration: "",
          sourceTranslation: "Hello",
          usageExample: "Hola, ¿cómo estás?",
        },
      ],
    })
  );
  return { chatComplete: mockChatComplete, __mockChatComplete: mockChatComplete };
});

const { __mockEnforceQuota: enforceQuota } = require("../src/utils/quota");
const { __mockChatComplete: chatComplete } = require("../src/lib/openrouterClient");

jest.mock("../src/utils/monitoring", () => ({
  trackExternalCall: jest.fn(),
}));

describe("Phrasebook routes", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects unauthenticated requests", async () => {
    const res = await request(app)
      .post("/api/phrasebook/generate")
      .set("user-agent", "jest")
      .send({ topic: "Travel", sourceLang: "en", targetLang: "es" });

    expect(res.statusCode).toBe(401);
  });

  test("rejects same source/target language", async () => {
    const res = await request(app)
      .post("/api/phrasebook/generate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ topic: "Travel", sourceLang: "en", targetLang: "en" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("returns 429 when phrasebook quota is exceeded", async () => {
    enforceQuota.mockReturnValueOnce({ allowed: false, resetAt: 123 });

    const res = await request(app)
      .post("/api/phrasebook/generate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ topic: "Travel", sourceLang: "en", targetLang: "es" });

    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBeDefined();
  });

  test("returns 502 when upstream response is malformed", async () => {
    chatComplete.mockResolvedValueOnce("nonsense");

    const res = await request(app)
      .post("/api/phrasebook/generate")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token")
      .send({ topic: "Travel", sourceLang: "en", targetLang: "es" });

    expect(res.statusCode).toBe(502);
    expect(res.body.error.code).toBe("EXTERNAL_SERVICE_ERROR");
  });
});
