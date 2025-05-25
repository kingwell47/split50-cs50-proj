import { useState, useMemo, useEffect } from "react";
import { useExpenseStore } from "../stores/expenseStore";
import { generateExpenseSplit } from "../services/expenseService";

const AddExpenseForm = ({ groupId, currentUserId, members }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [splitMode, setSplitMode] = useState("equal"); // 'equal' | 'amount' | 'percent'
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
      splitMode,
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
    setSplitMode("equal");
  };

  // 🔁 Dynamically compute preview of split
  const splitPreview = useMemo(() => {
    if (!amount || isNaN(totalAmount) || totalAmount <= 0) return [];

    try {
      const { split } = generateExpenseSplit(
        splitMode,
        selectedUids,
        totalAmount,
        customSplits
      );
      return split;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [amount, splitMode, customSplits, selectedUids, totalAmount]);

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
    if (splitMode === "equal") {
      setSplitError(null);
      return;
    }

    const values = selectedUids.map((uid) => Number(customSplits[uid]));
    const anyEmpty = selectedUids.some(
      (uid) => customSplits[uid] === "" || customSplits[uid] == null
    );
    const anyNegative = values.some((val) => val < 0);

    if (anyEmpty) return setSplitError("All selected users must have a value.");
    if (anyNegative) return setSplitError("Values cannot be negative.");

    if (splitMode === "amount") {
      const sum = values.reduce((a, b) => a + b, 0);
      if (sum !== Number(amount))
        return setSplitError("Amounts must total to full expense.");
    }

    if (splitMode === "percent") {
      const percentSum = values.reduce((a, b) => a + b, 0);
      if (percentSum !== 100)
        return setSplitError("Percentages must total 100%.");
    }

    setSplitError(null);
  }, [splitMode, selectedUids, customSplits, amount]);

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
      <select value={splitMode} onChange={(e) => setSplitMode(e.target.value)}>
        <option value="equal">Split equally</option>
        <option value="amount">Split by amount</option>
        <option value="percent">Split by percentage</option>
      </select>

      {splitMode !== "equal" && (
        <ul>
          {selectedUids.map((uid) => {
            const member = members.find((m) => m.uid === uid);
            const label = splitMode === "amount" ? "₱" : "%";

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
                    placeholder={`Enter ${label}`}
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
