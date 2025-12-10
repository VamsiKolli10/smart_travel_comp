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
      generatePhrasebook({
        topic: "Travel",
        sourceLang: "en",
        targetLang: "es",
      })
    ).rejects.toBe(err);
  });

  it("handles API error responses with error codes", async () => {
    const error = {
      response: {
        status: 429,
        data: {
          error: {
            code: "QUOTA_EXCEEDED",
            message: "Rate limit exceeded",
            resetAt: 1234567890,
          },
        },
      },
    };
    api.post.mockRejectedValue(error);

    await expect(
      generatePhrasebook({
        topic: "Travel",
        sourceLang: "en",
        targetLang: "es",
      })
    ).rejects.toEqual(error);
  });

  it("handles network errors", async () => {
    const networkError = new Error("Network request failed");
    networkError.code = "NETWORK_ERROR";
    api.post.mockRejectedValue(networkError);

    await expect(
      generatePhrasebook({
        topic: "Travel",
        sourceLang: "en",
        targetLang: "es",
      })
    ).rejects.toEqual(networkError);
  });

  it("defaults count to 10 when not provided", async () => {
    api.post.mockResolvedValue({ data: { phrases: [] } });

    await generatePhrasebook({
      topic: "Travel",
      sourceLang: "en",
      targetLang: "es",
    });

    expect(api.post).toHaveBeenCalledWith("/phrasebook/generate", {
      topic: "Travel",
      sourceLang: "en",
      targetLang: "es",
      count: 10,
    });
  });

  it("allows custom count parameter", async () => {
    api.post.mockResolvedValue({ data: { phrases: [] } });

    await generatePhrasebook({
      topic: "Travel",
      sourceLang: "en",
      targetLang: "es",
      count: 20,
    });

    expect(api.post).toHaveBeenCalledWith("/phrasebook/generate", {
      topic: "Travel",
      sourceLang: "en",
      targetLang: "es",
      count: 20,
    });
  });
});
