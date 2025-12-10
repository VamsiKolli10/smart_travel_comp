import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { setUser, clearUser, setLoading } from "../store/slices/authSlice";
import FullScreenLoader from "../components/common/FullScreenLoader.jsx";
import { handleEmailVerification } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [statusMessage, setStatusMessage] = useState("Securing your session…");
  const [isEmailVerificationInProgress, setIsEmailVerificationInProgress] =
    useState(false);
  const [firebaseUser, firebaseLoading, firebaseError] = useAuthState(auth);

  useEffect(() => {
    dispatch(setLoading(true));
  }, [dispatch]);

  useEffect(() => {
    const maybeHandleEmailVerificationLink = async () => {
      const url = new URL(window.location.href);
      const mode = url.searchParams.get("mode");
      const oobCode = url.searchParams.get("oobCode");
      const linkApiKey = url.searchParams.get("apiKey");
      const clientApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

      // Some environments send mode=action; treat that as verify email too.
      if (!oobCode) return;
      const isVerifyEmailMode =
        !mode || mode === "verifyEmail" || mode === "action";
      if (!isVerifyEmailMode) return;

      setIsEmailVerificationInProgress(true);
      setStatusMessage("Verifying your email…");

      if (linkApiKey && clientApiKey && linkApiKey !== clientApiKey) {
        setStatusMessage(
          "This verification link belongs to a different environment. Open it from the same app that sent it."
        );
        setIsEmailVerificationInProgress(false);
        return;
      }

      const ok = await handleEmailVerification(oobCode);
      if (ok) {
        setStatusMessage("Email verified! Redirecting…");
        // Prevent re-processing on reload
        window.history.replaceState({}, document.title, url.pathname);
      } else {
        setStatusMessage(
          "Verification link is invalid or has expired. Request a new one from Login."
        );
      }

      setIsEmailVerificationInProgress(false);
      dispatch(setLoading(false));
    };

    maybeHandleEmailVerificationLink();
  }, [dispatch, isEmailVerificationInProgress]);

  useEffect(() => {
    const syncUser = async () => {
      if (isEmailVerificationInProgress) return;

      if (firebaseLoading) {
        dispatch(setLoading(true));
        return;
      }

      dispatch(setLoading(true));
      try {
        if (firebaseError) {
          console.error("Auth subscription error", firebaseError);
          dispatch(clearUser());
          return;
        }

        if (firebaseUser) {
          await firebaseUser.reload();
          try {
            // Force-refresh token to detect revocation (e.g., password reset elsewhere)
            await firebaseUser.getIdToken(true);
          } catch (tokenError) {
            console.warn("Token refresh failed, forcing logout", tokenError);
            await signOut(auth);
            dispatch(clearUser());
            setStatusMessage("Session expired. Please sign in again.");
            return;
          }

          if (firebaseUser.emailVerified) {
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                emailVerified: firebaseUser.emailVerified,
              })
            );
          } else {
            setStatusMessage("Waiting for email verification…");
            dispatch(clearUser());
          }
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        console.error("Auth sync error", error);
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    };

    syncUser();
  }, [
    dispatch,
    firebaseError,
    firebaseLoading,
    firebaseUser,
    isEmailVerificationInProgress,
  ]);

  const contextValue = useMemo(
    () => ({
      ...authState,
    }),
    [authState]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {authState.loading ? (
        <FullScreenLoader message={statusMessage} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
