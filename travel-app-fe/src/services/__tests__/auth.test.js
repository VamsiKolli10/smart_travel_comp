import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loginWithEmail,
  EmailNotVerifiedError,
  handleEmailVerification,
} from "../auth";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  checkActionCode,
  applyActionCode,
} from "firebase/auth";

vi.mock("../../firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock("firebase/auth", () => {
  return {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    sendEmailVerification: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
    checkActionCode: vi.fn(),
    applyActionCode: vi.fn(),
  };
});

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.currentUser = null;
  });

  it("forces unverified users to verify their email", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: {
        email: "user@test.dev",
        emailVerified: false,
        reload: vi.fn(),
      },
    });

    await expect(loginWithEmail("user@test.dev", "secret")).rejects.toBeInstanceOf(
      EmailNotVerifiedError
    );

    expect(sendEmailVerification).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it("handles verification links via Firebase action codes", async () => {
    checkActionCode.mockResolvedValue();
    applyActionCode.mockResolvedValue();
    auth.currentUser = { reload: vi.fn() };

    const result = await handleEmailVerification("abc123");

    expect(result).toBe(true);
    expect(checkActionCode).toHaveBeenCalledWith(auth, "abc123");
    expect(applyActionCode).toHaveBeenCalledWith(auth, "abc123");
    expect(auth.currentUser.reload).toHaveBeenCalled();
  });
});
