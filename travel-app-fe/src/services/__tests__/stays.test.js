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

    expect(api.get).toHaveBeenCalledWith("/stays/s1", { params: { lang: "fr" } });
    expect(result).toEqual({ id: "s1" });

    const err = new Error("boom");
    api.get.mockRejectedValue(err);
    await expect(getStay("s1")).rejects.toBe(err);
  });
});
