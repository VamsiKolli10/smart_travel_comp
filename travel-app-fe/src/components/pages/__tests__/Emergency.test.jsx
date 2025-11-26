import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the useTravelContext hook
vi.mock("../../../hooks/useTravelContext", () => ({
  default: () => ({
    destination: "",
    destinationDisplayName: "",
    destinationCity: "",
    destinationCountry: "",
    setDestinationContext: vi.fn(),
  }),
}));

vi.mock("../../../services/location", () => ({
  resolveLocation: vi.fn(),
}));

describe("Emergency page", () => {
  it("should render without crashing", async () => {
    const { Emergency } = await import("../Emergency");
    render(<Emergency />);
    expect(screen.getByText("Emergency")).toBeInTheDocument();
  });

  it("should have a country dropdown", async () => {
    const { Emergency } = await import("../Emergency");
    render(<Emergency />);
    expect(screen.getByLabelText(/Or pick a country/i)).toBeInTheDocument();
  });
});
