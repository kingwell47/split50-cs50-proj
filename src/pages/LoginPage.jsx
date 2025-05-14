import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import GoogleButton from "../components/GoogleButton";

const LoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    if (!useAuthStore.getState().error) navigate("/");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='input'
          />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='input'
          />
        </div>

        {error && <p className='text-error'>{error}</p>}

        <button type='submit' disabled={loading} className='btn btn-primary'>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
      <div className='text-center'>
        <p className='text-base-content/60'>
          Don&apos;t have an account?{" "}
          <Link to='/register' className='link link-primary'>
            Create account
          </Link>
        </p>
      </div>
      <div className='divider'>OR</div>
      <GoogleButton onSuccess={() => navigate("/")} />
    </div>
  );
};

export default LoginPage;
