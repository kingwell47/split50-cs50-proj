import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  fetchGroupDetails,
  fetchGroupMembers,
  leaveGroup,
  deleteGroup,
} from "../services/groupService";
import { useAuthStore } from "../stores/authStore";
import AddExpenseForm from "../components/AddExpenseForm";
import BalanceSummary from "../components/BalanceSummary";
import ExpenseList from "../components/ExpenseList";
import { useExpenseStore } from "../stores/expenseStore";
import SettlementList from "../components/SettlementList";

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { fetchExpenses } = useExpenseStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const grp = await fetchGroupDetails(groupId);
        if (!grp) throw new Error("Group not found");
        setGroup(grp);

        const mems = await fetchGroupMembers(groupId);
        setMembers(mems);
        if (groupId) {
          fetchExpenses({ groupId });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId, fetchExpenses]);

  const handleLeave = async () => {
    setError("");
    try {
      await leaveGroup(groupId, user.uid);
      navigate("/groups");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await deleteGroup(groupId, user.uid);
      navigate("/groups");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading group…</p>;
  if (error) return <p className="text-error">{error}</p>;

  const isMember = members.some((m) => m.uid === user.uid);
  const isCreator = group.createdBy === user.uid;

  return (
    <>
      <div className="p-4">
        <Link to="/groups/" className="btn btn-sm btn-secondary">
          Groups
        </Link>
        <h2 className="text-2xl font-semibold">{group.name}</h2>
        <p className="mb-4 text-gray-600">{group.description}</p>

        <h3 className="text-xl font-medium">Members</h3>
        {members.length === 0 ? (
          <p>No members yet.</p>
        ) : (
          <ul>
            {members.map((m) => (
              <li key={m.uid}>
                {m.displayName || m.email} <em>({m.role})</em>
              </li>
            ))}
          </ul>
        )}

        {isMember && !isCreator && (
          <button onClick={handleLeave} className="btn btn-error">
            Leave Group
          </button>
        )}
        {isCreator && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-error"
          >
            {loading ? "Deleting…" : "Delete Group"}
          </button>
        )}
      </div>
      <div>
        <ExpenseList members={members} currentUserId={user.uid} />
        <AddExpenseForm
          groupId={groupId}
          currentUserId={user.uid}
          members={members}
        />
        <BalanceSummary members={members} />
        <SettlementList
          members={members}
          groupId={groupId}
          currentUserId={user.uid}
        />
      </div>
    </>
  );
};

export default GroupDetailPage;
