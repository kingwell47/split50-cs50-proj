import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function createUserProfile(user) {
  // user: Firebase Auth User object
  return setDoc(doc(db, "users", user.uid), {
    displayName: user.displayName,
    email: user.email,
    createdAt: serverTimestamp(),
  });
}
