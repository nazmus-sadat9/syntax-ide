"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {

  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const { user, loading, updateUser } = useAuth();

  if (loading) return <p>Loading...</p>;

  // Update profile handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setMsg("");

    const changes: { username?: string; bio?: string } = {};

    if (username.trim()) changes.username = username.trim();
    if (bio.trim()) changes.bio = bio.trim();

    if (Object.keys(changes).length === 0) {
      setMsg("Nothing to change.");
      return;
    }

    try {
      setSaving(true);

      await updateUser(changes);
      setMsg("Profile Updated successfully.");
      setUsername("");
      setBio("");

    } catch (err) {
      setMsg((err as Error).message);

    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="font-serif h-screen min-h-screen bg-zinc-900 flex justify-center items-center">

      <div className="text-white flex flex-col gap-3 p-4 bg-zinc-800 justify-center items-center border-[0.1em] border-zinc-500">
        <h1>Profile</h1>
        <p>{user?.username}</p>
        <p>{user?.email}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          className="outline-none"
        />

        <textarea
          placeholder="bio"
          value={bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
          className="outline-none"
        ></textarea>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update"}
        </button>

        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}
