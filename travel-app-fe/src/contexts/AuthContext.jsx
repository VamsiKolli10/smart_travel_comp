import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, isSignInWithEmailLink } from "firebase/auth";
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

  useEffect(() => {
    dispatch(setLoading(true));

    // Check if this is a password reset or email verification link
    const checkEmailVerification = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsEmailVerificationInProgress(true);
        setStatusMessage("Verifying your email…");

        // Get the email from local storage if it was stored
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          // Get the email from query parameters
          email = window.prompt("Please provide your email for confirmation");
        }

        if (email) {
          // Complete the sign-in process
          try {
            // The link automatically signed in the user
            if (auth.currentUser) {
              await auth.currentUser.reload();
              if (auth.currentUser.emailVerified) {
                dispatch(
                  setUser({
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    displayName: auth.currentUser.displayName,
                    emailVerified: auth.currentUser.emailVerified,
                  })
                );
                setStatusMessage("Email verified! Redirecting…");
              } else {
                setStatusMessage(
                  "Email verification pending. Please check your email."
                );
              }
            }
          } catch (error) {
            console.error("Email verification error:", error);
            setStatusMessage("Email verification failed. Please try again.");
          } finally {
            setIsEmailVerificationInProgress(false);
            dispatch(setLoading(false));
          }
        } else {
          setIsEmailVerificationInProgress(false);
          dispatch(setLoading(false));
        }
      }
    };

    checkEmailVerification();

    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (isEmailVerificationInProgress) {
          return; // Skip auth state change while email verification is in progress
        }

        if (firebaseUser) {
          // Ensure user data is fully loaded
          await firebaseUser.reload();

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
        console.error("Auth subscription error", error);
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    });

    return unsubscribe;
  }, [dispatch, isEmailVerificationInProgress]);

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
