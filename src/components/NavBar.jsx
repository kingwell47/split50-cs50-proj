import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const NavBar = () => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const name = user?.displayName || "Guest";

  return (
    <nav className="navbar bg-base-100 shadow-md">
      <div className="flex-1 px-4">
        <a className="btn btn-ghost normal-case text-xl">ExpenseSplit</a>
      </div>
      <span className="font-medium">Hello, {name}</span>
      {user && (
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
