import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FeatureFlagsProvider,
  useFeatureFlags,
} from "../FeatureFlagsContext.jsx";

function TestHarness() {
  const { isEnabled, updateFlags, flags } = useFeatureFlags();
  return (
    <div>
      <span data-testid="translation-flag">
        {isEnabled("translationModule") ? "on" : "off"}
      </span>
      <button
        onClick={() =>
          updateFlags({ translationModule: !flags.translationModule })
        }
      >
        toggle
      </button>
    </div>
  );
}

describe("FeatureFlagsProvider", () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    vi.spyOn(Storage.prototype, "setItem").mockClear();
  });

  it("persists flag changes to localStorage", () => {
    render(
      <FeatureFlagsProvider>
        <TestHarness />
      </FeatureFlagsProvider>
    );

    expect(screen.getByTestId("translation-flag").textContent).toBe("on");
    fireEvent.click(screen.getByText(/toggle/i));
    expect(screen.getByTestId("translation-flag").textContent).toBe("off");
    expect(Storage.prototype.setItem).toHaveBeenCalled();
  });

  it("restores flags from localStorage on mount", () => {
    const storedFlags = JSON.stringify({ translationModule: false });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(storedFlags);

    render(
      <FeatureFlagsProvider>
        <TestHarness />
      </FeatureFlagsProvider>
    );

    expect(screen.getByTestId("translation-flag").textContent).toBe("off");
  });

  it("handles invalid localStorage data gracefully", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("invalid-json");

    render(
      <FeatureFlagsProvider>
        <TestHarness />
      </FeatureFlagsProvider>
    );

    // Should use default flags when localStorage data is invalid
    expect(screen.getByTestId("translation-flag").textContent).toBe("on");
  });

  it("handles localStorage errors gracefully", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    render(
      <FeatureFlagsProvider>
        <TestHarness />
      </FeatureFlagsProvider>
    );

    // Should still allow toggling even if localStorage fails
    fireEvent.click(screen.getByText(/toggle/i));
    expect(screen.getByTestId("translation-flag").textContent).toBe("off");
  });

  it("provides all flags through context", () => {
    function FullHarness() {
      const { flags } = useFeatureFlags();
      return <div data-testid="flags">{JSON.stringify(flags)}</div>;
    }

    render(
      <FeatureFlagsProvider>
        <FullHarness />
      </FeatureFlagsProvider>
    );

    const flagsText = screen.getByTestId("flags").textContent;
    const flags = JSON.parse(flagsText);
    expect(flags).toBeDefined();
    expect(typeof flags).toBe("object");
  });
});
