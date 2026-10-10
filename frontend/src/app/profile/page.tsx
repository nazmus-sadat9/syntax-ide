"use client";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="font-serif h-screen min-h-screen bg-zinc-900 flex justify-center items-center">

      <div className="text-white flex flex-col gap-3 p-4 bg-zinc-800 justify-center items-center border-[0.1em] border-zinc-500">
        <h1>Profile</h1>
        <p>{user?.username}</p>
        <p>{user?.email}</p>
      </div>

    </div>
  );
}
