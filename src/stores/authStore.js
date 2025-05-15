import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config"; // your initialized Firebase app
import { createUserProfile } from "../services/userService";

const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth listener
  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  // Register with email/password
  register: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      // Create account
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set displayName on Auth Profile
      await updateProfile(cred.user, { displayName });
      await createUserProfile(cred.user);
      const updatedUser = auth.currentUser;
      set({ user: updatedUser });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Login with email/password
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      set({ user: cred.user });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      set({ user: result.user });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
