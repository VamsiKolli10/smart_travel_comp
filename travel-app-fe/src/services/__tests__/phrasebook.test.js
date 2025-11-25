import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePhrasebook } from "../phrasebook";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("phrasebook service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts generation request and returns data", async () => {
    const payload = { topic: "Travel", sourceLang: "en", targetLang: "es" };
    api.post.mockResolvedValue({ data: { phrases: [] } });

    const result = await generatePhrasebook(payload);

    expect(api.post).toHaveBeenCalledWith("/phrasebook/generate", {
      ...payload,
      count: 10,
    });
    expect(result).toEqual({ phrases: [] });
  });

  it("propagates errors", async () => {
    const err = new Error("boom");
    api.post.mockRejectedValue(err);

    await expect(
      generatePhrasebook({ topic: "Travel", sourceLang: "en", targetLang: "es" })
    ).rejects.toBe(err);
  });
});
