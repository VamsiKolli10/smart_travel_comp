import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../ForgotPassword.jsx";

describe("ForgotPassword page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => expect(screen.getByText(/check your email/i)).toBeInTheDocument(),
      { timeout: 15000 }
    );
  });
}, 20000);
