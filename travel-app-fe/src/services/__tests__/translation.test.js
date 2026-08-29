import { describe, it, expect, vi, beforeEach } from "vitest";
import { translateText } from "../translation";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("translation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts the text and langPair to the backend", async () => {
    api.post.mockResolvedValue({ data: { translation: "hola" } });

    const result = await translateText("hello", "en-es");

    expect(api.post).toHaveBeenCalledWith("/translate", {
      text: "hello",
      langPair: "en-es",
    });
    expect(result).toEqual({ translation: "hola" });
  });

  it("surfaces API errors to the caller", async () => {
    const error = new Error("Network down");
    api.post.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(translateText("hello", "en-es")).rejects.toBe(error);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles API error responses with error codes", async () => {
    const error = {
      response: {
        status: 400,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid language pair",
            details: { issues: [{ path: ["langPair"] }] },
          },
        },
      },
    };
    api.post.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(translateText("hello", "invalid-pair")).rejects.toEqual(error);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles rate limit errors", async () => {
    const rateLimitError = {
      response: {
        status: 429,
        data: {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests",
            resetAt: 1234567890,
          },
        },
      },
    };
    api.post.mockRejectedValue(rateLimitError);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(translateText("hello", "en-es")).rejects.toEqual(
      rateLimitError
    );
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles network errors", async () => {
    const networkError = new Error("Network request failed");
    networkError.code = "NETWORK_ERROR";
    api.post.mockRejectedValue(networkError);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(translateText("hello", "en-es")).rejects.toEqual(networkError);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("validates language pair format", async () => {
    api.post.mockResolvedValue({ data: { translation: "hola" } });

    await translateText("hello", "en-es");

    expect(api.post).toHaveBeenCalledWith("/translate", {
      text: "hello",
      langPair: "en-es",
    });
  });
});
