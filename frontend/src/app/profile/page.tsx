"use client";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { user, loading, logout, updateUser } = useAuth();

  if (loading) return <p className="text-zinc-400 p-4 bg-zinc-950 min-h-screen">Loading...</p>;

  const handleEdit = () => {
    setMsg("");
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setUsername("");
    setBio("");
    setGithub("");
    setMsg("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");

    const changes: { username?: string; bio?: string; github?: string } = {};

    if (username.trim()) changes.username = username.trim();
    if (bio.trim()) changes.bio = bio.trim();
    if (github.trim()) changes.github = github.trim();

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
    <div className="w-screen min-h-screen bg-zinc-950 flex justify-center items-center px-4 text-zinc-200">

      <nav className="w-full border-b border-zinc-800 fixed top-0 left-0 flex justify-between items-center px-[10%] py-4">
        <div>
          <Link className="text-white" href="/">Home</Link>
        </div>

        <div className="flex gap-4">
          <h3 className="font-bold p-2 text-white">{user?.username}</h3>
          <button
            type="submit"
            onClick={logout}
            className="p-2 text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="md:w-[80%] w-[90%] flex flex-col gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-md">
        {/* Header */}
        <div className="w-full flex items-center justify-end">
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

        {/* User Info */}
        <div className="flex flex-col gap-2">

          <div className="w-24 aspect-[1/1] rounded-full bg-zinc-700 flex justify-center items-center text-[clamp(1rem,4vw,2rem)]">
            {user?.username[0]}
          </div>

          <div className="py-2 flex justify-between items-center">

            <div>
              <p className="text-white">{user?.username}</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
              {user?.bio && <p className="text-sm text-zinc-400 mt-1">{user.bio}</p>}
            </div>

            <div className="px-4">
              {user?.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faGithub} className="text-[clamp(1.2rem,4vw,2rem)] text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
            <input
              type="text"
              name="username"
              placeholder="Enter your new username..."
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600"
            />

            <textarea
              placeholder="Write about yourself in 100 character..."
              rows={3}
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600 resize-none"
            ></textarea>

            <input
              type="url"
              name="github"
              placeholder="https://github.com/username..."
              value={github}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithub(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600 resize-none"
            />
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
