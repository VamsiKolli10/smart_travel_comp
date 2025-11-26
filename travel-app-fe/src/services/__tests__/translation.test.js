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
});
