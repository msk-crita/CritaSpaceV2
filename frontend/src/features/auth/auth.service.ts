import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { api } from "../../lib/api";
import type { AuthResponse } from "./auth.types";

export const login = async (
  email: string,
  password: string,
  rememberMe: boolean,
) => {
 await setPersistence(
  auth,
  rememberMe ? browserLocalPersistence : browserSessionPersistence,
);

await signInWithEmailAndPassword(auth, email, password);

  try {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data.data;
  } catch (error) {
    await signOut(auth);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentUser = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  const response = await api.get<AuthResponse>("/auth/me");
  return response.data.data;
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};
