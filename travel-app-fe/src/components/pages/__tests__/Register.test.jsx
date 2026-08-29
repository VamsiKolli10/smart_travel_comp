import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../Register.jsx";
import { registerWithEmail } from "../../../services/auth";

vi.mock("../../../services/auth", () => ({
  registerWithEmail: vi.fn(),
}));

vi.mock("../../../hooks/useNotification", () => ({
  __esModule: true,
  default: () => ({
    showNotification: vi.fn(),
  }),
}));

describe("Register page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates required fields", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
  });

  it("submits registration when valid", async () => {
    registerWithEmail.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@test.dev" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /i agree/i }));

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(registerWithEmail).toHaveBeenCalled());
  });
});
