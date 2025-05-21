import { useExpenseStore } from "../stores/expenseStore";

const ExpenseList = ({ members, currentUserId }) => {
  const { expenses, removeExpense } = useExpenseStore();

  const getUserName = (uid) => {
    const user = members.find((m) => m.uid === uid);
    return user?.displayName || "Unknown";
  };

  if (!expenses.length) return <p>No expenses yet.</p>;

  return (
    <ul>
      {expenses.map((expense) => (
        <li key={expense.id}>
          <p>
            {expense.description} — {expense.amount}
          </p>
          {/* 🔽 Split breakdown */}
          <ul>
            {expense.split.map((entry, idx) => {
              const isCurrentUser = entry.userId === currentUserId;
              const name = isCurrentUser ? "You" : getUserName(entry.userId);

              return (
                <li key={entry.userId || idx}>
                  <span
                    className={`${isCurrentUser ? "font-bold" : "font-normal"}`}
                  >
                    {name}
                  </span>
                  : <span>{entry.amount.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
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
