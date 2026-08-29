import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
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

function getEmailVerificationSettings(redirectUrl) {
  return {
    url: redirectUrl || `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
}

export async function loginWithEmail(email, password) {
  console.log("loginWithEmail: Starting login for", email);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  console.log("loginWithEmail: signInWithEmailAndPassword successful", {
    uid: credential.user.uid,
    email: credential.user.email,
    emailVerified: credential.user.emailVerified,
  });

  // Ensure the user is fully loaded before returning
  try {
    await credential.user.reload();
    console.log("loginWithEmail: User reloaded", {
      emailVerified: credential.user.emailVerified,
    });
  } catch (error) {
    console.warn("loginWithEmail: Failed to reload user:", error);
  }

  // Check if email is verified after reload
  const isEmailVerified = credential.user.emailVerified;
  console.log("loginWithEmail: Final emailVerified check", isEmailVerified);

  if (!isEmailVerified) {
    console.log(
      "loginWithEmail: Email not verified, signing out and throwing error"
    );
    await signOut(auth);
    const error = new EmailNotVerifiedError(credential.user.email || email);
    console.log("loginWithEmail: Throwing EmailNotVerifiedError", error);
    throw error;
  }

  console.log("loginWithEmail: Email verified, returning credential");
  return credential;
}

export async function registerWithEmail({
  firstName,
  lastName,
  email,
  password,
  verificationRedirectUrl,
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, {
    displayName: `${firstName} ${lastName}`,
  });
  await sendEmailVerification(
    cred.user,
    getEmailVerificationSettings(verificationRedirectUrl)
  );
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

export async function resendEmailVerification({
  user,
  email,
  password,
  verificationRedirectUrl,
} = {}) {
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

    await sendEmailVerification(
      targetUser,
      getEmailVerificationSettings(verificationRedirectUrl)
    );

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
