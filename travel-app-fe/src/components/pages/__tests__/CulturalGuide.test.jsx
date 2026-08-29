import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CulturalGuide from "../CulturalGuide.jsx";

vi.mock("../../../hooks/useTravelContext", () => ({
  __esModule: true,
  default: () => ({
    destination: "",
    culture: "",
    language: "en",
    updateTravelContext: vi.fn(),
    setDestinationContext: vi.fn(),
  }),
}));

describe("CulturalGuide", () => {
  it("sets destination from quick pick", () => {
    render(<CulturalGuide />);
    const quickPick = screen.getByText(/Tokyo/i);
    fireEvent.click(quickPick);
    expect(screen.getByDisplayValue(/Tokyo/i)).toBeInTheDocument();
  });
});
