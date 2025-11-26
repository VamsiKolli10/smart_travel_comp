import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchStays, getStay } from "../stays";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("accommodation services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches stays with params", async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    await searchStays({ dest: "Paris" });
    expect(api.get).toHaveBeenCalledWith("/stays/search", { params: { dest: "Paris" } });
  });

  it("fetches stay detail", async () => {
    api.get.mockResolvedValue({ data: { id: "s1" } });
    const result = await getStay("s1");
    expect(api.get).toHaveBeenCalledWith("/stays/s1", { params: {} });
    expect(result).toEqual({ id: "s1" });
  });
});
