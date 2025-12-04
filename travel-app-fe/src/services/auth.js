import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  isSignInWithEmailLink,
  checkActionCode,
  applyActionCode,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";

export class EmailNotVerifiedError extends Error {
  constructor(email) {
    super("Email not verified");
    this.name = "EmailNotVerifiedError";
    this.code = "auth/email-not-verified";
    this.email = email;
  }
}

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  // Ensure the user is fully loaded before returning
  await credential.user.reload();

  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new EmailNotVerifiedError(credential.user.email);
  }

  return credential;
}

export async function registerWithEmail({
  firstName,
  lastName,
  email,
  password,
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, {
    displayName: `${firstName} ${lastName}`,
  });
  await sendEmailVerification(cred.user);
  await signOut(auth);
  return cred;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}

export async function handleEmailVerification(actionCode) {
  try {
    await checkActionCode(auth, actionCode);
    await applyActionCode(auth, actionCode);

    // Refresh user data after email verification
    if (auth.currentUser) {
      await auth.currentUser.reload();
    }

    return true;
  } catch (error) {
    console.error("Email verification error:", error);
    return false;
  }
}

export async function resendEmailVerification({ user, email, password } = {}) {
  try {
    let targetUser = user;
    let signedInForResend = false;

    if (!targetUser) {
      if (!email || !password) {
        throw new Error(
          "Email and password are required to resend verification emails"
        );
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      targetUser = credential.user;
      signedInForResend = true;
    }

    await sendEmailVerification(targetUser);

    if (signedInForResend) {
      await signOut(auth);
    }

    return true;
  } catch (error) {
    console.error("Resend email verification error:", error);
    throw error;
  }
}

export async function sendPasswordReset(email, redirectUrl) {
  const actionCodeSettings = {
    url: redirectUrl || `${window.location.origin}/reset-password`,
    handleCodeInApp: true,
  };
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}

export async function verifyPasswordReset(oobCode) {
  return verifyPasswordResetCode(auth, oobCode);
}

export async function confirmPasswordResetWithCode(oobCode, newPassword) {
  return confirmPasswordReset(auth, oobCode, newPassword);
}
