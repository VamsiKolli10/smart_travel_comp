const request = require("supertest");

jest.mock("../src/poi/providers/googlePlacesPoi", () => ({
  searchNearbyPoi: jest.fn(async () => [
    { id: "p1", name: "POI 1", location: { lat: 1, lng: 2 } },
  ]),
  mapPlaceToPoiCard: jest.fn((p) => ({ id: p.id, name: p.name, location: p.location })),
  applySmartFilters: jest.fn((items) => items),
  fetchById: jest.fn(async (id) =>
    id === "p1" ? { id, name: "POI 1", location: {} } : null
  ),
}));

jest.mock("../src/stays/providers/googlePlaces", () => ({
  geocodeCity: jest.fn(async (dest) => ({
    display: dest,
    lat: 1,
    lng: 2,
    address: "",
    city: "",
    state: "",
    country: "",
  })),
  fetchById: jest.fn(async () => null),
}));

describe("POI routes", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("requires auth for search", async () => {
    const res = await request(app)
      .get("/api/poi/search?lat=1&lng=2")
      .set("user-agent", "jest");
    expect(res.statusCode).toBe(401);
  });

  test("validates missing coordinates/destination", async () => {
    const res = await request(app)
      .get("/api/poi/search")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.statusCode).toBe(400);
  });

  test("returns search results when authed", async () => {
    const res = await request(app)
      .get("/api/poi/search?lat=1&lng=2")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test("returns 404 for missing POI detail", async () => {
    const res = await request(app)
      .get("/api/poi/missing")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");
    expect(res.statusCode).toBe(404);
  });
});
