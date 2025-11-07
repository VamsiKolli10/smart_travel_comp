import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { setUser, clearUser, setLoading } from "../store/slices/authSlice";
import FullScreenLoader from "../components/common/FullScreenLoader.jsx";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [statusMessage, setStatusMessage] = useState("Securing your session…");

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
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
            await signOut(auth);
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
  }, [dispatch]);

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
