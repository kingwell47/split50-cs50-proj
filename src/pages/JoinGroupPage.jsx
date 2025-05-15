import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { joinGroup } from "../services/groupService";

const JoinGroupPage = () => {
  const user = useAuthStore((s) => s.user);
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await joinGroup(groupId.trim(), user.uid);
      navigate(`/groups/${groupId.trim()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Join a Group</h2>
      <div>
        <label htmlFor="groupId">Group ID</label>
        <input
          id="groupId"
          type="text"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          required
          className="w-full input input-bordered"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-primary"
      >
        {loading ? "Joining…" : "Join Group"}
      </button>
    </form>
  );
};

export default JoinGroupPage;
