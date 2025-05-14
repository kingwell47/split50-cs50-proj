import {
  collection,
  query,
  where,
  doc,
  writeBatch,
  serverTimestamp,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Fetch groups the user has created (you can extend this to check membership)
export async function fetchUserGroups(userId) {
  const q = query(collection(db, "groups"), where("createdBy", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// 1a. Create a group + add creator as admin member
export async function createGroup({ name, description, createdBy }) {
  const groupRef = doc(collection(db, "groups"));
  const batch = writeBatch(db);

  batch.set(groupRef, {
    name,
    description,
    createdBy,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "groups", groupRef.id, "members", createdBy), {
    role: "admin",
    joinedAt: serverTimestamp(),
    invitedBy: createdBy,
  });

  await batch.commit();
  return groupRef.id;
}

// 1b. Fetch single group metadata
export async function fetchGroupDetails(groupId) {
  const snap = await getDoc(doc(db, "groups", groupId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 1c. Fetch and enrich members list
export async function fetchGroupMembers(groupId) {
  const memberSnap = await getDocs(
    collection(db, "groups", groupId, "members")
  );
  const members = await Promise.all(
    memberSnap.docs.map(async (m) => {
      const userSnap = await getDoc(doc(db, "users", m.id));
      return {
        uid: m.id,
        role: m.data().role,
        displayName: userSnap.data()?.displayName,
        email: userSnap.data()?.email,
      };
    })
  );
  return members;
}
