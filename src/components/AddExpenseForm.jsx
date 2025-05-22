import { useState, useMemo, useEffect } from "react";
import { useExpenseStore } from "../stores/expenseStore";
import { generateExpenseSplit } from "../services/expenseService";

const AddExpenseForm = ({ groupId, currentUserId, members }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState({});

  const [selectedUids, setSelectedUids] = useState(() =>
    members.filter((m) => m.uid === currentUserId).map((m) => m.uid)
  );

  const [splitError, setSplitError] = useState(null);

  const { createExpense } = useExpenseStore();

  const totalAmount = Number(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (splitError) return;

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
    setCustomSplits({});
    setSplitError(null);
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

  const handleCustomSplitChange = (uid, value) => {
    setCustomSplits((prev) => ({
      ...prev,
      [uid]: value === "" ? "" : Number(value),
    }));
  };

  useEffect(() => {
    if (splitType !== "unequal") {
      setSplitError(null);
      return;
    }

    const values = selectedUids.map((uid) => Number(customSplits[uid]));
    const sum = values.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);

    const anyEmpty = selectedUids.some(
      (uid) => customSplits[uid] === "" || customSplits[uid] == null
    );
    const anyNegative = values.some((val) => val < 0);
    const total = Number(amount);

    if (anyEmpty) {
      setSplitError("All selected users must have an amount.");
    } else if (anyNegative) {
      setSplitError("Split amounts cannot be negative.");
    } else if (sum !== total) {
      setSplitError(
        `Total split (${sum}) must equal the expense amount (${total}).`
      );
    } else {
      setSplitError(null);
    }
  }, [splitType, selectedUids, customSplits, amount]);

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
      <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
        <option value="equal">Split equally</option>
        <option value="unequal">Split by amount</option>
      </select>

      {splitType === "unequal" && (
        <ul>
          {selectedUids.map((uid) => {
            const member = members.find((m) => m.uid === uid);
            return (
              <li key={uid}>
                <label>
                  {member?.displayName || uid}
                  <input
                    type="number"
                    min="0"
                    value={customSplits[uid] ?? ""}
                    onChange={(e) =>
                      handleCustomSplitChange(uid, e.target.value)
                    }
                    placeholder="Enter amount"
                    required
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}

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

      {splitError && (
        <p style={{ color: "red", fontWeight: "bold" }}>{splitError}</p>
      )}
      <button className="btn btn-primary" type="submit" disabled={splitError}>
        Add Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;
