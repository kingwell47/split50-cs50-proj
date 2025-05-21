import { useState, useMemo } from "react";
import { useExpenseStore } from "../stores/expenseStore";
import { generateExpenseSplit } from "../services/expenseService";

const AddExpenseForm = ({ groupId, currentUserId, members }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [splitType, setSplitType] = useState("equal"); // future-proof
  // Placeholder for custom splits
  const [customSplits, setCustomSplits] = useState({});

  const [selectedUids, setSelectedUids] = useState(() =>
    members.filter((m) => m.uid === currentUserId).map((m) => m.uid)
  );

  const { createExpense } = useExpenseStore();

  const totalAmount = Number(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { split, splitUserIds } = generateExpenseSplit(
      splitType,
      selectedUids,
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
        selectedUids,
        totalAmount,
        customSplits
      );
      return split;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [amount, splitType, customSplits, selectedUids, totalAmount]);

  const getName = (uid) => {
    const m = members.find((m) => m.uid === uid);
    return m?.displayName || "Unknown";
  };

  const toggleUserSelection = (uid) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
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

      <p>
        <strong>Split With:</strong>
      </p>
      <ul>
        {members.map((m) => (
          <li key={m.uid}>
            <label>
              <input
                type="checkbox"
                checked={selectedUids.includes(m.uid)}
                onChange={() => toggleUserSelection(m.uid)}
              />
              {m.displayName}
            </label>
          </li>
        ))}
      </ul>

      {/* 🔍 Real-time split preview */}
      {splitPreview.length > 0 && (
        <div>
          <p>
            <p>
              <strong>Split between {splitPreview.length} member(s):</strong>
            </p>
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
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          const allUids = members.map((m) => m.uid);
          setSelectedUids((prev) =>
            prev.length === members.length ? [] : allUids
          );
        }}
      >
        {selectedUids.length === members.length
          ? "Clear All"
          : "Split with All"}
      </button>

      <button className="btn btn-primary" type="submit">
        Add Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;
