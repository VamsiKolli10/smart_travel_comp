import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Translation from "../Translation.jsx";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useAnalytics } from "../../../contexts/AnalyticsContext.jsx";
import { translateText } from "../../../services/translation";
import { addSavedPhrase } from "../../../services/savedPhrases";

vi.mock("../../../contexts/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../contexts/AnalyticsContext.jsx", () => ({
  useAnalytics: vi.fn(),
}));

vi.mock("../../../services/translation", () => ({
  translateText: vi.fn(),
}));

vi.mock("../../../services/savedPhrases", () => ({
  addSavedPhrase: vi.fn(),
}));

vi.mock("../../../hooks/useTravelContext", () => ({
  __esModule: true,
  default: () => ({
    sourceLanguageCode: "en",
    targetLanguageCode: "es",
    setLanguagePair: vi.fn(),
  }),
}));

describe("Translation page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { uid: "u1" } });
    useAnalytics.mockReturnValue({ trackModuleView: vi.fn(), trackEvent: vi.fn() });
    global.navigator.clipboard = { writeText: vi.fn() };
    global.SpeechSynthesisUtterance = function () {};
    global.window.speechSynthesis = {
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      onvoiceschanged: null,
    };
  });

  it("translates input text and shows result", async () => {
    translateText.mockResolvedValue({ translation: "hola" });
    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });
    
    const translateButton = screen.getByRole("button", { name: /translate/i });
    fireEvent.click(translateButton);

    // Wait for the translation to complete and appear in the output field
    await waitFor(
      () => {
        expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(translateText).toHaveBeenCalledWith("hello", "en-es");
  });

  it("saves a translation to phrasebook", async () => {
    translateText.mockResolvedValue({ translation: "hola" });
    addSavedPhrase.mockResolvedValue("saved-1");
    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /translate/i }));
    await waitFor(() => screen.getByDisplayValue("hola"));

    const saveBtn = screen.getByRole("button", { name: /save to phrasebook/i });
    fireEvent.click(saveBtn);
    await waitFor(() => expect(addSavedPhrase).toHaveBeenCalled());
  });
});
