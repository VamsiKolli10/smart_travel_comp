const request = require("supertest");

jest.mock("../src/poi/providers/googlePlacesPoi", () => ({
  searchNearbyPoi: jest.fn(),
  mapPlaceToPoiCard: jest.fn(),
  applySmartFilters: jest.fn(),
}));

jest.mock("../src/stays/providers/googlePlaces", () => ({
  fetchById: jest.fn(async (id) => (id === "p1" ? { id, name: "POI 1" } : null)),
  geocodeCity: jest.fn(async () => ({ display: "Paris", lat: 1, lng: 2 })),
}));

jest.mock("axios", () => ({
  get: jest.fn(async () => ({ data: { extract: "Wiki summary" } })),
}));

describe("POI detail fallback", () => {
  let app;

  beforeAll(() => {
    const { createApp } = require("../src/app");
    app = createApp();
  });

  test("enriches missing description with wiki summary", async () => {
    const res = await request(app)
      .get("/api/poi/p1")
      .set("user-agent", "jest")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe("Wiki summary");
  });
});
