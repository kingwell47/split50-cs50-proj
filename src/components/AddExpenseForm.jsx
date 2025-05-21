import { useState, useMemo } from "react";
import { useExpenseStore } from "../stores/expenseStore";
import { generateExpenseSplit } from "../services/expenseService";

const AddExpenseForm = ({ groupId, currentUserId, members }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [splitType, setSplitType] = useState("equal"); // future-proof
  // Placeholder for custom splits
  const [customSplits, setCustomSplits] = useState({});

  const { createExpense } = useExpenseStore();

  const userIds = members.map((m) => m.uid);
  const totalAmount = Number(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { split, splitUserIds } = generateExpenseSplit(
      splitType,
      userIds,
      totalAmount,
      customSplits
    );

    await createExpense({
      groupId,
      description,
      amount: totalAmount,
      category: "general",
      createdBy: currentUserId,
      split,
      splitUserIds,
    });

    setDescription("");
    setAmount("");
  };

  // 🔁 Dynamically compute preview of split
  const splitPreview = useMemo(() => {
    if (!amount || isNaN(totalAmount) || totalAmount <= 0) return [];

    try {
      const { split } = generateExpenseSplit(
        splitType,
        userIds,
        totalAmount,
        customSplits
      );
      return split;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [amount, splitType, customSplits, totalAmount, userIds]);

  const getName = (uid) => {
    const m = members.find((m) => m.uid === uid);
    return m?.displayName || "Unknown";
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="input"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        type="number"
        className="input"
      />

      {/* 🔜 Placeholder for future split logic */}
      <select
        value={splitType}
        onChange={(e) => setSplitType(e.target.value)}
        disabled
      >
        <option value="equal">Split equally (default)</option>
        <option value="unequal">Split unequally (coming soon)</option>
      </select>

      {/* 🔍 Real-time split preview */}
      {splitPreview.length > 0 && (
        <div>
          <p>
            <strong>Split Preview:</strong>
          </p>
          <ul>
            {splitPreview.map((entry) => (
              <li key={entry.userId}>
                {getName(entry.userId)}: {entry.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn btn-primary" type="submit">
        Add Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;
