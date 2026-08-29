import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import StayDetailsPage from "../StayDetailsPage.jsx";
import { getStay } from "../../../services/stays";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../../services/stays", () => ({
  getStay: vi.fn(),
}));

vi.mock("../../../contexts/AnalyticsContext.jsx", () => ({
  useAnalytics: () => ({ trackModuleView: vi.fn(), trackEvent: vi.fn() }),
}));

describe("StayDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows stay details", async () => {
    getStay.mockResolvedValue({ id: "s1", name: "Hotel One", location: {} });

    render(
      <MemoryRouter initialEntries={["/stays/s1"]}>
        <Routes>
          <Route path="/stays/:id" element={<StayDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hotel One/i)).toBeInTheDocument();
    });
  });

  it("shows error state", async () => {
    getStay.mockRejectedValue(new Error("boom"));

    render(
      <MemoryRouter initialEntries={["/stays/s1"]}>
        <Routes>
          <Route path="/stays/:id" element={<StayDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/boom/i)).toBeInTheDocument());
  });
});
