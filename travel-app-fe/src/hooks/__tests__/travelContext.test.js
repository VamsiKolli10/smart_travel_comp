import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import travelContextReducer from "../../store/slices/travelContextSlice";
import useTravelContext from "../useTravelContext";

function createWrapper() {
  const store = configureStore({
    reducer: {
      travelContext: travelContextReducer,
    },
  });
  return ({ children }) =>
    React.createElement(Provider, { store }, children);
}

describe("useTravelContext", () => {
  it("updates language pair", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTravelContext(), { wrapper });

    act(() => {
      result.current.setLanguagePair(
        { sourceLanguageCode: "fr", targetLanguageCode: "de" },
        { source: "test" }
      );
    });

    expect(result.current.sourceLanguageCode).toBe("fr");
    expect(result.current.targetLanguageCode).toBe("de");
  });
});
