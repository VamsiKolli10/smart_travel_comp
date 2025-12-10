import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchStays, getStay } from "../stays";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("stays service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls search endpoint with params", async () => {
    api.get.mockResolvedValue({ data: { items: [] } });

    const params = { dest: "Paris", distance: 3 };
    const result = await searchStays(params);

    expect(api.get).toHaveBeenCalledWith("/stays/search", { params });
    expect(result).toEqual({ items: [] });
  });

  it("requires an id for getStay", async () => {
    await expect(getStay()).rejects.toThrow(/Missing stay id/);
  });

  it("fetches stay details and propagates errors", async () => {
    api.get.mockResolvedValue({ data: { id: "s1" } });

    const result = await getStay("s1", { lang: "fr" });

    expect(api.get).toHaveBeenCalledWith("/stays/s1", {
      params: { lang: "fr" },
    });
    expect(result).toEqual({ id: "s1" });

    const err = new Error("boom");
    api.get.mockRejectedValue(err);
    await expect(getStay("s1")).rejects.toBe(err);
  });

  it("handles 404 errors for missing stays", async () => {
    const error = {
      response: {
        status: 404,
        data: { error: { code: "NOT_FOUND", message: "Stay not found" } },
      },
    };
    api.get.mockRejectedValue(error);

    await expect(getStay("missing-id")).rejects.toEqual(error);
  });

  it("handles network errors during stay search", async () => {
    const networkError = new Error("Network request failed");
    api.get.mockRejectedValue(networkError);

    await expect(searchStays({ dest: "Paris" })).rejects.toEqual(networkError);
  });

  it("handles empty search results", async () => {
    api.get.mockResolvedValue({ data: { items: [], page: 1, total: 0 } });

    const result = await searchStays({ dest: "Paris" });

    expect(result.items).toEqual([]);
    expect(result.page).toBe(1);
  });

  it("includes filter parameters in search", async () => {
    api.get.mockResolvedValue({ data: { items: [] } });

    await searchStays({
      dest: "Paris",
      minPrice: 50,
      maxPrice: 200,
      rating: 4,
      amenities: ["wifi", "pool"],
    });

    expect(api.get).toHaveBeenCalledWith("/stays/search", {
      params: {
        dest: "Paris",
        minPrice: 50,
        maxPrice: 200,
        rating: 4,
        amenities: ["wifi", "pool"],
      },
    });
  });

  it("handles coordinate-based searches", async () => {
    api.get.mockResolvedValue({ data: { items: [] } });

    await searchStays({ lat: 48.8566, lng: 2.3522, distance: 5 });

    expect(api.get).toHaveBeenCalledWith("/stays/search", {
      params: { lat: 48.8566, lng: 2.3522, distance: 5 },
    });
  });
});
