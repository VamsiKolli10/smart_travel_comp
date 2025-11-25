import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCultureBrief,
  askCultureQuestion,
  getContextualCultureTips,
  getCulturalEtiquette,
} from "../culturalEtiquette";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("cultural etiquette services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches culture brief with params", async () => {
    api.get.mockResolvedValue({ data: { destination: "Paris" } });

    const result = await getCultureBrief({
      destination: "Paris",
      culture: "French",
      language: "fr",
      refresh: true,
    });

    expect(api.get).toHaveBeenCalledWith("/culture/brief", {
      params: { destination: "Paris", culture: "French", language: "fr", refresh: "1" },
    });
    expect(result).toEqual({ destination: "Paris" });
  });

  it("asks a culture question", async () => {
    api.post.mockResolvedValue({ data: { answer: "Oui" } });

    const result = await askCultureQuestion({
      destination: "Paris",
      question: "How to greet?",
    });

    expect(api.post).toHaveBeenCalledWith("/culture/qa", {
      destination: "Paris",
      question: "How to greet?",
    });
    expect(result).toEqual({ answer: "Oui" });
  });

  it("gets contextual tips", async () => {
    api.post.mockResolvedValue({ data: { tips: ["Be polite"] } });

    const result = await getContextualCultureTips({
      contextType: "translation",
      text: "Hello",
    });

    expect(api.post).toHaveBeenCalledWith("/culture/contextual", {
      contextType: "translation",
      text: "Hello",
    });
    expect(result).toEqual({ tips: ["Be polite"] });
  });

  it("legacy getCulturalEtiquette delegates to brief", async () => {
    api.get.mockResolvedValue({ data: { categories: { greetings: [] } } });
    const result = await getCulturalEtiquette("Paris");
    expect(api.get).toHaveBeenCalled();
    expect(result).toEqual({ greetings: [] });
  });
});
