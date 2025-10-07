import { createContext, useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { setUser, clearUser, setLoading } from "../store/slices/authSlice";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u)
        dispatch(
          setUser({ uid: u.uid, email: u.email, displayName: u.displayName })
        );
      else dispatch(clearUser());
    });
    return unsubscribe;
  }, [dispatch]);

  if (loading) return null; // or spinner

  return <AuthContext.Provider>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useSelector((state) => state.auth);
}
