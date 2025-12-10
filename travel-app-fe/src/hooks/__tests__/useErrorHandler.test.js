import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useErrorHandler from "../useErrorHandler";

vi.mock("../useNotification", () => ({
  __esModule: true,
  default: () => ({
    showNotification: vi.fn(),
    hideNotification: vi.fn(),
  }),
  useNotification: () => ({
    showNotification: vi.fn(),
    hideNotification: vi.fn(),
  }),
}));

describe("useErrorHandler", () => {
  it("formats API error messages", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = {
      response: {
        data: { error: { message: "Bad Request" } },
        status: 400,
      },
      message: "fallback",
    };
    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual(error);
  });

  it("handles errors without response object", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Network error");

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual(error);
  });

  it("handles errors with error code", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = {
      response: {
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: { issues: [] },
          },
        },
        status: 400,
      },
    };

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual(error);
  });

  it("handles rate limit errors with resetAt", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = {
      response: {
        data: {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests",
            resetAt: 1234567890,
          },
        },
        status: 429,
      },
    };

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual(error);
  });

  it("clears error when clearError is called", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");

    act(() => {
      result.current.handleError(error);
    });
    expect(result.current.error).toEqual(error);

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
});
