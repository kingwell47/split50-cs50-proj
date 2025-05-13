import React from "react";
import { useAuthStore } from "../stores/authStore";

/**
 * Reusable Google auth button.
 *
 * Props:
 * - onSuccess: callback invoked after successful login
 */

const GoogleButton = ({ onSuccess }) => {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const handleClick = async () => {
    await loginWithGoogle();
    if (!error && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full btn btn-outline"
        disabled={loading}
      >
        {loading ? "Please wait…" : "Continue with Google"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default GoogleButton;
