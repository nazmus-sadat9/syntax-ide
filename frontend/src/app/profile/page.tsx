"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { user, loading, updateUser } = useAuth();

  if (loading) return <p className="text-zinc-400 p-4 bg-zinc-950 min-h-screen">Loading...</p>;

  const handleEdit = () => {
    setMsg("");
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setUsername("");
    setBio("");
    setMsg("");
  };

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
      setUsername("");
      setBio("");
      setIsEditing(false);
      setMsg("Profile updated successfully.");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center items-center p-4 text-zinc-200">
      <div className="w-full max-w-sm flex flex-col gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-sm text-zinc-400">Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Close
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <p className="text-white">{user?.username}</p>
          <p className="text-xs text-zinc-500">{user?.email}</p>
          {user?.bio && <p className="text-sm text-zinc-400 mt-1">{user.bio}</p>}
        </div>

        {/* Edit form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
            <input
              type="text"
              name="username"
              placeholder="username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600"
            />

            <textarea
              placeholder="bio"
              rows={3}
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600 resize-none"
            ></textarea>

            <button
              type="submit"
              disabled={saving}
              className="text-sm py-2 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Update"}
            </button>
          </form>
        )}

        {msg && <p className="text-xs text-zinc-400">{msg}</p>}
      </div>
    </div>
  );
}
