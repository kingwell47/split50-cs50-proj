import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import GoogleButton from "../components/GoogleButton";

const RegisterPage = () => {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check display name
    if (!displayName.trim()) {
      return alert("Display name is required");
    }

    await register(email, password, displayName);

    if (!error) navigate("/"); // redirect on success
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='displayName'>Display Name</label>
          <input
            id='displayName'
            type='text'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className='input'
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='input'
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='input'
          />
        </div>
        {error && <p className='text-red-500'>{error}</p>}
        <button type='submit' disabled={loading} className='btn btn-primary'>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div className='text-center'>
        <p className='text-base-content/60'>
          Already have an account?{" "}
          <Link to='/login' className='link link-primary'>
            Create account
          </Link>
        </p>
      </div>
      <div className='divider'>OR</div>
      <GoogleButton onSuccess={() => navigate("/")} />
    </div>
  );
};

export default RegisterPage;
