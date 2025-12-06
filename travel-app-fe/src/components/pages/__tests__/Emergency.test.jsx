import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Emergency from "../Emergency.jsx";

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
  resolveLocation: vi.fn().mockResolvedValue({
    country: "United States",
    city: "New York",
    state: "NY",
    display: "New York, NY, USA",
    lat: 40.7128,
    lng: -74.006,
  }),
}));

describe("Emergency page", () => {
  it("should render without crashing", () => {
    render(<Emergency />);
    expect(screen.getByText("Emergency")).toBeInTheDocument();
  });

  it("should have a country dropdown", () => {
    render(<Emergency />);
    expect(screen.getByLabelText(/Or pick a country/i)).toBeInTheDocument();
  });
});
