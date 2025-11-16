const request = require("supertest");

jest.mock("../src/stays/providers/googlePlaces", () => {
  const toResultItem = jest.fn((place) => ({
    id: place.id || "stay-1",
    name: "Mock Stay",
    location: { distanceKm: 1 },
    rating: 4.5,
    amenities: ["wifi"],
    type: "hotel",
  }));

  return {
    geocodeCity: jest.fn(async (dest) => ({
      display: dest,
      lat: 1,
      lng: 2,
      address: "123 Test St",
      city: "Test City",
      state: "Test State",
      country: "Test Country",
    })),
    nearbyLodging: jest.fn(async () => [
      { id: "stay-1" },
      { id: "stay-2" },
      { id: "stay-3" },
    ]),
    toResultItem,
    fetchById: jest.fn(async (id) =>
      id === "stay-1" ? { id, name: "Mock Stay", location: {} } : null
    ),
    ensureKey: jest.fn(),
    GOOGLE_API_KEY: "test-key",
    PLACES_BASE_URL: "https://example.com",
  };
});

const { createApp } = require("../src/app");

let app;

beforeAll(() => {
  app = createApp();
});

describe("Security and validation guardrails", () => {
  test("rejects unsigned stay search requests", async () => {
    const res = await request(app).get("/api/stays/search?lat=1&lng=2");
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("allows authenticated stay searches", async () => {
    const res = await request(app)
      .get("/api/stays/search?lat=1&lng=2")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  test("enforces schema when creating users", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", "Bearer valid-admin-token")
      .send({ name: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("blocks itinerary generation without auth", async () => {
    const res = await request(app).get("/api/itinerary/generate?dest=Paris");
    expect(res.statusCode).toBe(401);
  });

  test("returns itinerary sample when authenticated", async () => {
    const res = await request(app)
      .get("/api/itinerary/generate?dest=Paris")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.destination).toBeDefined();
    expect(Array.isArray(res.body.days)).toBe(true);
  });
});
