import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Emergency from "../Emergency.jsx";

vi.mock("../../../hooks/useTravelContext", () => ({
  __esModule: true,
  default: () => ({
    destination: "",
    destinationDisplayName: "",
    destinationCity: "",
    destinationCountry: "",
    setDestinationContext: vi.fn(),
  }),
}));

describe("Emergency page", () => {
  it("searches for a country and shows numbers", () => {
    render(<Emergency />);
    fireEvent.change(screen.getByPlaceholderText(/search a country or city/i), {
      target: { value: "France" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
    expect(screen.getByText(/Police/i)).toBeInTheDocument();
  });

  it("falls back when country not found", () => {
    render(<Emergency />);
    fireEvent.change(screen.getByPlaceholderText(/search a country or city/i), {
      target: { value: "NowhereLand" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
    expect(screen.getByText(/No emergency data found/i)).toBeInTheDocument();
  });
});
