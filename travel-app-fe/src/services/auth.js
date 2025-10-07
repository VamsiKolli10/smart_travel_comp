import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export async function loginWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
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
  return cred;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}
