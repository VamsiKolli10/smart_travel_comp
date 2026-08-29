import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Accommodation from "../Accommodation.jsx";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("Accommodation redirect", () => {
  it("redirects to /stays", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/accommodation"]}>
        <Routes>
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/stays" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByTestId("location").textContent).toBe("/stays");
  });
});
