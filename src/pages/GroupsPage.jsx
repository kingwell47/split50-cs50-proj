import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { fetchUserGroups } from "../services/groupService";

const GroupsPage = () => {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await fetchUserGroups(user.uid);
        setGroups(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div>Loading groups…</div>;
  if (error) return <div className='text-error'>Error: {error}</div>;

  return (
    <div className='p-4'>
      <h2 className='text-2xl font-semibold mb-4'>Your Groups</h2>

      {groups.length === 0 ? (
        <p>You’re not in any groups yet.</p>
      ) : (
        <ul className='space-y-2'>
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                to={`/groups/${group.id}`}
                className='text-blue-600 hover:underline'>
                {group.name}
              </Link>
              <p className='text-sm text-gray-500'>{group.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupsPage;
