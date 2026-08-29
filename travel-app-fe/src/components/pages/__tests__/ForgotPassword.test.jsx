import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../ForgotPassword.jsx";
import { sendPasswordReset } from "../../../services/auth";

vi.mock("../../../services/auth", () => ({
  sendPasswordReset: vi.fn(),
}));

vi.mock("../../../hooks/useNotification", () => ({
  default: () => ({
    showNotification: vi.fn(),
  }),
}));

describe("ForgotPassword page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendPasswordReset.mockResolvedValue();
  });

  it("validates missing email", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /send reset email/i }));
    expect(
      screen.getByText(/please enter your email address/i)
    ).toBeInTheDocument();
  });

  it("sends reset email", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@test.dev" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset email/i }));

    await waitFor(
      () => expect(screen.getByText(/Check your email/i)).toBeInTheDocument(),
      { timeout: 5000 }
    );

    // sendPasswordReset is called with email (redirectUrl is optional)
    expect(sendPasswordReset).toHaveBeenCalledWith("user@test.dev");
  });
}, 20000);
