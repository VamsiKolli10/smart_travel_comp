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
});
