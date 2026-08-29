import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useNotification from "../useNotification";

describe("useNotification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows and clears notifications", () => {
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
  });

  it("supports different notification types", () => {
    const { result } = renderHook(() => useNotification());

    const types = ["success", "error", "warning", "info"];
    types.forEach((type) => {
      act(() => {
        result.current.showNotification(`Message ${type}`, type);
      });

      expect(result.current.type).toBe(type);
      expect(result.current.show).toBe(true);

      act(() => {
        result.current.hideNotification();
      });
    });
  });

  it("handles auto-dismiss after timeout", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification("Auto-dismiss", "info", 5000);
    });

    expect(result.current.show).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.show).toBe(false);
  });

  it("clears previous timeout when showing new notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification("First", "info", 5000);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.showNotification("Second", "info", 5000);
    });

    expect(result.current.message).toBe("Second");
    expect(result.current.show).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.show).toBe(false);
  });

  it("handles multiple rapid notifications", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification("First", "info");
      result.current.showNotification("Second", "success");
      result.current.showNotification("Third", "error");
    });

    expect(result.current.message).toBe("Third");
    expect(result.current.type).toBe("error");
    expect(result.current.show).toBe(true);
  });
});
