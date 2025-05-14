import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { createGroup } from "../services/groupService";

const CreateGroupPage = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return alert("Group name is required");
    }
    setLoading(true);
    try {
      const newId = await createGroup({
        name,
        description,
        createdBy: user.uid,
      });
      navigate(`/groups/${newId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='max-w-md mx-auto mt-10 space-y-4'>
      <h2 className='text-2xl font-semibold'>Create New Group</h2>
      <div>
        <label htmlFor='name'>Name</label>
        <input
          id='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className='input'
        />
      </div>
      <div>
        <label htmlFor='desc'>Description</label>
        <textarea
          id='desc'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='textarea'
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type='submit' className='btn btn-primary' disabled={loading}>
        {loading ? "Creating…" : "Create Group"}
      </button>
    </form>
  );
};

export default CreateGroupPage;
