import {
  collection,
  collectionGroup,
  deleteDoc,
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

/**
 * Remove the current user from a group’s members.
 * @param {string} groupId
 * @param {string} userId
 */
export async function leaveGroup(groupId, userId) {
  // 1. Fetch the group to check creator
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) {
    throw new Error("Group not found");
  }
  const { createdBy } = groupSnap.data();
  // 2. Prevent the creator from leaving
  if (createdBy === userId) {
    throw new Error("Group creator cannot leave the group");
  }
  // 3. Proceed to delete the member doc
  const memberRef = doc(db, "groups", groupId, "members", userId);
  await deleteDoc(memberRef);
}

/**
 * Delete a group and its subcollections (members & expenses).
 * Only the creator may perform this; throws otherwise.
 * @param {string} groupId
 * @param {string} userId
 */
export async function deleteGroup(groupId, userId) {
  // 1. Verify group and ownership
  const groupRef = doc(db, "groups", groupId);
  const snap = await getDoc(groupRef);

  if (!snap.exists()) {
    throw new Error("Group not found");
  }
  const { createdBy } = snap.data();

  if (createdBy !== userId) {
    throw new Error("Only the group owner can delete the group");
  }

  // 2. Batch-delete members & expenses
  const batch = writeBatch(db);

  const membersSnap = await getDocs(
    collection(db, "groups", groupId, "members")
  );
  membersSnap.forEach((m) => batch.delete(m.ref));

  const expensesSnap = await getDocs(
    collection(db, "groups", groupId, "expenses")
  );
  expensesSnap.forEach((e) => batch.delete(e.ref));

  // 3. Delete the group document
  batch.delete(groupRef);

  // 4. Commit
  await batch.commit();
}
