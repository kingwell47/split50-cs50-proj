import { useExpenseStore } from "../stores/expenseStore";

const BalanceSummary = ({ members }) => {
  const { getBalances } = useExpenseStore();

  const balances = getBalances();

  return (
    <div>
      <h3>Balance Summary</h3>
      <ul>
        {members.map((m) => (
          <li key={m.uid}>
            {m.displayName}: {balances[m.uid]?.toFixed(2) ?? "0.00"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BalanceSummary;
