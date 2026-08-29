import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchPOIs, getPOIDetails } from "../poi";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("poi service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches POIs with params", async () => {
    api.get.mockResolvedValue({ data: { items: [], page: 1 } });

    const params = { dest: "Paris", page: 2 };
    const result = await searchPOIs(params);

    expect(api.get).toHaveBeenCalledWith("/poi/search", { params });
    expect(result).toEqual({ items: [], page: 1 });
  });

  it("fetches POI details with language", async () => {
    api.get.mockResolvedValue({ data: { id: "p1" } });

    const result = await getPOIDetails("p1", "fr");

    expect(api.get).toHaveBeenCalledWith("/poi/p1", { params: { lang: "fr" } });
    expect(result).toEqual({ id: "p1" });
  });

  it("handles missing POI ID gracefully", async () => {
    const error = {
      response: {
        status: 404,
        data: { error: { code: "NOT_FOUND", message: "POI not found" } },
      },
    };
    api.get.mockRejectedValue(error);

    await expect(getPOIDetails("missing-id")).rejects.toEqual(error);
  });

  it("handles network errors during POI search", async () => {
    const networkError = new Error("Network request failed");
    api.get.mockRejectedValue(networkError);

    await expect(searchPOIs({ dest: "Paris" })).rejects.toEqual(networkError);
  });

  it("handles empty search results", async () => {
    api.get.mockResolvedValue({ data: { items: [], page: 1, total: 0 } });

    const result = await searchPOIs({ dest: "Paris" });

    expect(result.items).toEqual([]);
    expect(result.page).toBe(1);
    expect(result.total).toBe(0);
  });

  it("includes pagination parameters when provided", async () => {
    api.get.mockResolvedValue({ data: { items: [], page: 2 } });

    await searchPOIs({ dest: "Paris", page: 2, limit: 20 });

    expect(api.get).toHaveBeenCalledWith("/poi/search", {
      params: { dest: "Paris", page: 2, limit: 20 },
    });
  });

  it("handles coordinate-based searches", async () => {
    api.get.mockResolvedValue({ data: { items: [], page: 1 } });

    await searchPOIs({ lat: 48.8566, lng: 2.3522 });

    expect(api.get).toHaveBeenCalledWith("/poi/search", {
      params: { lat: 48.8566, lng: 2.3522 },
    });
  });

  it("handles filter parameters in search", async () => {
    api.get.mockResolvedValue({ data: { items: [], page: 1 } });

    await searchPOIs({
      dest: "Paris",
      types: ["restaurant", "cafe"],
      distance: 5,
    });

    expect(api.get).toHaveBeenCalledWith("/poi/search", {
      params: {
        dest: "Paris",
        types: ["restaurant", "cafe"],
        distance: 5,
      },
    });
  });
});
