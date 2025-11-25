import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../ResetPassword.jsx";

describe("ResetPassword page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("validates missing fields", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    expect(
      screen.getByText(/please fill in both password fields/i)
    ).toBeInTheDocument();
  });

  it("submits new password", async () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "Password1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(() =>
      expect(
        screen.getByText(/password reset complete/i)
      ).toBeInTheDocument()
    );
  });
}, 20000);
