import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";
import { AuthProvider, useAuth } from "../AuthContext.jsx";
import { auth } from "../../firebase";
import { onAuthStateChanged, isSignInWithEmailLink } from "firebase/auth";

vi.mock("../../firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  isSignInWithEmailLink: vi.fn(() => false),
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.currentUser = null;
    onAuthStateChanged.mockImplementation((authArg, cb) => {
      cb(null);
      return () => {};
    });
  });

  it("provides auth state", async () => {
    const wrapper = ({ children }) => (
      <Provider
        store={configureStore({
          reducer: { auth: authReducer },
        })}
      >
        <AuthProvider>{children}</AuthProvider>
      </Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
