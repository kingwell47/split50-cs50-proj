import { useExpenseStore } from "../stores/expenseStore";

const ExpenseList = () => {
  const { expenses, removeExpense } = useExpenseStore();

  if (!expenses.length) return <p>No expenses yet.</p>;
  return (
    <ul>
      {expenses.map((expense) => (
        <li key={expense.id}>
          <p>
            {expense.description} — {expense.amount}
          </p>
          <button
            className="btn btn-error"
            onClick={() => removeExpense(expense.id, expense.groupId)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;
