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
    useAnalytics.mockReturnValue({
      trackModuleView: vi.fn(),
      trackEvent: vi.fn(),
    });
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

  it("handles translation errors gracefully", async () => {
    translateText.mockRejectedValue({
      response: {
        status: 400,
        data: { error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
      },
    });
    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /translate/i }));

    await waitFor(() => {
      // Component sets a generic error message string in the target field
      const errorMessage = screen.getByDisplayValue(
        /error contacting translation server/i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("handles rate limit errors", async () => {
    translateText.mockRejectedValue({
      response: {
        status: 429,
        data: {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests",
            resetAt: Date.now() + 60000,
          },
        },
      },
    });
    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /translate/i }));

    await waitFor(() => {
      // Component sets a generic error message string
      const errorMessage = screen.getByDisplayValue(
        /error contacting translation server/i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("handles network errors", async () => {
    translateText.mockRejectedValue(new Error("Network request failed"));
    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /translate/i }));

    await waitFor(() => {
      // Component sets a generic error message string
      const errorMessage = screen.getByDisplayValue(
        /error contacting translation server/i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("validates empty input before translating", async () => {
    render(<Translation />);

    const translateButton = screen.getByRole("button", { name: /translate/i });
    fireEvent.click(translateButton);

    // Should either show validation error or not call translateText
    await waitFor(() => {
      const validationError = screen.queryByText(/required|empty|fill/i);
      expect(validationError || !translateText.mock.calls.length).toBeTruthy();
    });
  });

  it("handles save phrase errors", async () => {
    translateText.mockResolvedValue({ translation: "hola" });
    addSavedPhrase.mockRejectedValue({
      response: {
        status: 400,
        data: {
          error: { code: "VALIDATION_ERROR", message: "Invalid phrase data" },
        },
      },
    });
    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /translate/i }));
    await waitFor(() => screen.getByDisplayValue("hola"));

    const saveBtn = screen.getByRole("button", { name: /save to phrasebook/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      // Component shows error in a Snackbar/Alert, check for the error message
      const errorMessage = screen.getByText(/Invalid phrase data/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("disables translate button while translating", async () => {
    let resolveTranslation;
    const translationPromise = new Promise((resolve) => {
      resolveTranslation = resolve;
    });
    translateText.mockReturnValue(translationPromise);

    render(<Translation />);

    const input = screen.getByPlaceholderText(/type text to translate/i);
    fireEvent.change(input, {
      target: { value: "hello" },
    });

    const translateButton = screen.getByRole("button", { name: /translate/i });
    fireEvent.click(translateButton);

    // Button should be disabled during translation
    await waitFor(() => {
      expect(translateButton).toBeDisabled();
    });

    resolveTranslation({ translation: "hola" });
    await waitFor(() => {
      expect(translateButton).not.toBeDisabled();
    });
  });
});
