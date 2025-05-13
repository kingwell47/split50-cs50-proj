import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import GoogleButton from "../components/GoogleButton";

const RegisterPage = () => {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(email, password);
    if (!error) navigate("/"); // redirect on success
  };
  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
      <GoogleButton onSuccess={() => navigate("/")} />
    </div>
  );
};

export default RegisterPage;
