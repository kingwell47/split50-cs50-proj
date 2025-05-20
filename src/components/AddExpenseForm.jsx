import { useState } from "react";
import { useExpenseStore } from "../stores/expenseStore";
import { generateExpenseSplit } from "../services/expenseService";

const AddExpenseForm = ({ groupId, currentUserId, members }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const { createExpense } = useExpenseStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userIds = members.map((m) => m.uid);
    const { split, splitUserIds } = generateExpenseSplit(
      "equal",
      userIds,
      Number(amount)
    );

    await createExpense({
      groupId,
      description,
      amount: Number(amount),
      category: "general",
      createdBy: currentUserId,
      split,
      splitUserIds,
    });

    setDescription("");
    setAmount("");
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
      <button className="btn btn-primary" type="submit">
        Add Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;
