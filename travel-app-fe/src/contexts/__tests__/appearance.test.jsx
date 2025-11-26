import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppearanceProvider, useAppearance } from "../AppearanceContext.jsx";

function Harness() {
  const { mode, toggleMode } = useAppearance();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button onClick={toggleMode}>toggle</button>
    </div>
  );
}

describe("AppearanceProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock matchMedia and localStorage
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
  });

  it("defaults to light mode and toggles to dark", () => {
    render(
      <AppearanceProvider>
        <Harness />
      </AppearanceProvider>
    );

    expect(screen.getByTestId("mode").textContent).toBe("light");
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("mode").textContent).toBe("dark");
    expect(Storage.prototype.setItem).toHaveBeenCalledWith("stc:appearance", "dark");
  });
});
