import {
  collection,
  collectionGroup,
  query,
  where,
  doc,
  writeBatch,
  serverTimestamp,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Fetch groups the user has created
export async function fetchUserGroups(userId) {
  // 1. groups user created
  const createdSnap = await getDocs(
    query(collection(db, "groups"), where("createdBy", "==", userId))
  );
  const created = createdSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 2. groups user joined
  const memberSnap = await getDocs(
    query(collectionGroup(db, "members"), where("userId", "==", userId))
  );
  const memberGroupIds = memberSnap.docs.map((m) => m.ref.parent.parent.id);

  // 3. fetch those group docs
  const joined = (
    await Promise.all(
      memberGroupIds.map(async (gid) => {
        const g = await getDoc(doc(db, "groups", gid));
        return g.exists() ? { id: g.id, ...g.data() } : null;
      })
    )
  ).filter(Boolean);

  // 4. merge & dedupe
  const map = {};
  [...created, ...joined].forEach((g) => (map[g.id] = g));
  return Object.values(map);
}

// Create a group + add creator as admin member
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
    userId: createdBy,
  });

  await batch.commit();
  return groupRef.id;
}

// Fetch single group metadata
export async function fetchGroupDetails(groupId) {
  const snap = await getDoc(doc(db, "groups", groupId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Fetch and enrich members list
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

/**
 * Adds the current user as a member of the group and updates the parent group document.
 * @param {string} groupId
 * @param {string} userId
 */
export async function joinGroup(groupId, userId) {
  // 1. Check group exists
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) {
    throw new Error("Group not found");
  }

  // 2. Add user to members subcollection
  const memberRef = doc(db, "groups", groupId, "members", userId);
  await setDoc(memberRef, {
    role: "member",
    joinedAt: serverTimestamp(),
    invitedBy: userId, // self-join
    userId,
  });

  // 3. Add userId to group.members array
  await updateDoc(groupRef, {
    members: arrayUnion(userId),
  });
}
