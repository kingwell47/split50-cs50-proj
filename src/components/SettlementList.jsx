import { useState } from "react";
import {
  calculateSettlements,
  recordSettlement,
} from "../services/expenseService";
import { useExpenseStore } from "../stores/expenseStore";

const SettlementList = ({ members, groupId, currentUserId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { getBalances, fetchExpenses } = useExpenseStore();
  const settlements = calculateSettlements(getBalances());

  const getName = (uid) =>
    members.find((m) => m.uid === uid)?.displayName || uid;

  const handleSettle = async (from, to, amount) => {
    const fromName = getName(from);
    const toName = getName(to);

    setLoading(true);
    setMessage(null);

    try {
      await recordSettlement({
        groupId,
        fromUid: from,
        toUid: to,
        amount,
        fromName,
        toName,
      });
      await fetchExpenses({ groupId }); // refresh after settlement
      setMessage(`Successfully recorded: ${fromName} paid ${toName}`);
    } catch (error) {
      console.log(error);
      setMessage("Error settling up. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!settlements.length) return <p>Everyone is settled up!</p>;

  return (
    <div>
      {message && <p className="text-error">{message}</p>}
      {loading && <p>Processing settlement...</p>}
      <h3>Settle Up Suggestions</h3>
      <ul>
        {settlements.map((s, idx) => (
          <li key={idx}>
            <span>
              <strong>{getName(s.from)}</strong> pays{" "}
              <strong>{getName(s.to)}</strong> ₱{s.amount.toFixed(2)}
            </span>
            {currentUserId === s.from && (
              <button
                className="btn btn-secondary"
                onClick={() => handleSettle(s.from, s.to, s.amount)}
                disabled={loading}
              >
                {loading ? "Settling Up..." : "Settle Up"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SettlementList;
