import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchGroupDetails, fetchGroupMembers } from "../services/groupService";

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const grp = await fetchGroupDetails(groupId);
        if (!grp) throw new Error("Group not found");
        setGroup(grp);

        const mems = await fetchGroupMembers(groupId);
        setMembers(mems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

  if (loading) return <p>Loading group…</p>;
  if (error) return <p className='text-error'>{error}</p>;

  return (
    <div className='p-4'>
      <h2 className='text-2xl font-semibold'>{group.name}</h2>
      <p className='mb-4 text-gray-600'>{group.description}</p>

      <h3 className='text-xl font-medium'>Members</h3>
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
    </div>
  );
};

export default GroupDetailPage;
