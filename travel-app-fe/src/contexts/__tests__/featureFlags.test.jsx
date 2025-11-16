import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeatureFlagsProvider, useFeatureFlags } from "../FeatureFlagsContext.jsx";

function TestHarness() {
  const { isEnabled, updateFlags, flags } = useFeatureFlags();
  return (
    <div>
      <span data-testid="translation-flag">
        {isEnabled("translationModule") ? "on" : "off"}
      </span>
      <button onClick={() => updateFlags({ translationModule: !flags.translationModule })}>
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
});
