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
});
