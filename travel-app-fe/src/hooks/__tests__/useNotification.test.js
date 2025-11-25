import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useNotification from "../useNotification";

describe("useNotification", () => {
  it("shows and clears notifications", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification("Hello", "success");
    });

    expect(result.current.show).toBe(true);
    expect(result.current.message).toBe("Hello");
    expect(result.current.type).toBe("success");

    act(() => {
      result.current.hideNotification();
    });

    expect(result.current.show).toBe(false);
    vi.useRealTimers();
  });
});
