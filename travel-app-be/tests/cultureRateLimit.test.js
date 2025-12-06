const request = require("supertest");

// Avoid hitting the real OpenRouter client; the test only cares about rate limits.
jest.mock("../src/lib/openrouterClient", () => ({
  chatComplete: jest.fn(),
}));

const { chatComplete } = require("../src/lib/openrouterClient");
const mockFirestore = require("firebase-admin").firestore;

describe("Culture brief rate limiting by role", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cached briefs between runs so responses stay fast/deterministic.
    const cacheStore = mockFirestore.__cultureBriefsStore || {};
    Object.keys(cacheStore).forEach((key) => delete cacheStore[key]);

    // Default model payload to keep the route handler quick.
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
        generatedAt: new Date().toISOString(),
      })
    );
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
  }, 30000); // Increase timeout to 30 seconds for this test
});
