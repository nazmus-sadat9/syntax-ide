"use client";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
      <p>ID: {user?.id}</p>
    </div>
  );
}
