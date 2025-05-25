import { db } from "../firebase/config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";

const expensesCol = collection(db, "expenses");

export async function addExpense(data) {
  const newExpense = {
    ...data,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(expensesCol, newExpense);
  return { id: docRef.id, ...newExpense };
}
export async function getExpense(expenseId) {
  const docRef = doc(db, "expenses", expenseId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Expense not found");
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getExpensesByGroup(groupId) {
  const q = query(expensesCol, where("groupId", "==", groupId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateExpense(expenseId, updates) {
  const docRef = doc(db, "expenses", expenseId);
  await updateDoc(docRef, updates);
}

export async function deleteExpense(expenseId) {
  const docRef = doc(db, "expenses", expenseId);
  await deleteDoc(docRef);
}

export async function getFilteredExpenses({
  groupId,
  userId,
  category,
  startDate,
  endDate,
}) {
  let q = query(
    collection(db, "expenses"),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );

  if (category) {
    q = query(q, where("category", "==", category));
  }

  if (startDate) {
    q = query(q, where("createdAt", ">=", startDate));
  }

  if (endDate) {
    q = query(q, where("createdAt", "<=", endDate));
  }

  // Firestore doesn't support `array-contains` with other filters unless indexed
  if (userId) {
    q = query(q, where("splitUserIds", "array-contains", userId));
  }

  // q = query(q, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Generates split and splitUserIds fields based on splitType
 * @param {string} splitType - 'equal' or 'unequal'
 * @param {Array<string>} userIds - array of user IDs involved in the split
 * @param {number} totalAmount - total expense amount
 * @param {Object} [customSplits] - for 'unequal', an object like { userId1: 500, userId2: 700 }
 * @returns {{ split: Array, splitUserIds: Array }}
 */
export function generateExpenseSplit(
  splitMode,
  userIds,
  totalAmount,
  customSplits = {}
) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("User list for split is empty or invalid");
  }

  let split = [];

  if (splitMode === "equal") {
    const perUser = Math.round((totalAmount / userIds.length) * 100) / 100;
    split = userIds.map((uid) => ({ userId: uid, amount: perUser }));
  } else if (splitMode === "amount") {
    const sum = Object.values(customSplits).reduce((a, b) => a + Number(b), 0);
    if (sum !== totalAmount)
      throw new Error("Custom amounts must total to the full amount.");
    split = Object.entries(customSplits).map(([uid, amt]) => ({
      userId: uid,
      amount: Number(amt),
    }));
  } else if (splitMode === "percent") {
    const percentTotal = Object.values(customSplits).reduce(
      (a, b) => a + Number(b),
      0
    );
    if (percentTotal !== 100) throw new Error("Percentages must total 100%.");
    split = Object.entries(customSplits).map(([uid, percent]) => ({
      userId: uid,
      amount: Math.round((Number(percent) / 100) * totalAmount * 100) / 100,
    }));
  } else {
    throw new Error("Invalid split mode.");
  }

  const splitUserIds = split.map((s) => s.userId);
  return { split, splitUserIds };
}

export function calculateSettlements(balances) {
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([uid, amount]) => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded > 0) creditors.push({ uid, amount: rounded });
    else if (rounded < 0) debtors.push({ uid, amount: -rounded }); // store as positive for ease
  });

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const minAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.uid,
      to: creditor.uid,
      amount: minAmount,
    });

    debtor.amount -= minAmount;
    creditor.amount -= minAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
}

export async function recordSettlement({
  groupId,
  fromUid,
  fromName,
  toUid,
  toName,
  amount,
}) {
  return await addExpense({
    groupId,
    description: `Settlement: ${fromName} paid ${toName}`,
    amount,
    category: "settlement",
    createdBy: fromUid,
    split: [{ userId: toUid, amount }],
    splitUserIds: [toUid],
    createdAt: Timestamp.now(),
  });
}
