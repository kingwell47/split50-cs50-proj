import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuthStore } from "../stores/authStore";

const UserProfilePage = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Get the user reference
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  if (loading) {
    return <p>Loading profile…</p>;
  }

  if (error) {
    return <p className='text-error'>Error: {error}</p>;
  }

  if (!profile) {
    return <p>No profile data available.</p>;
  }

  const { displayName, email, createdAt } = profile;
  const memberSince = createdAt?.toDate().toLocaleDateString();

  return (
    <div className='max-w-md mx-auto mt-10 space-y-4'>
      <h2 className='text-2xl font-semibold'>Your Profile</h2>
      <p>
        <strong>Display Name:</strong> {displayName}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Member Since:</strong> {memberSince}
      </p>
    </div>
  );
};

export default UserProfilePage;
