"use client";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import SearchOverlay from "../components/SearchOverlay";

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const { user, loading, logout, updateUser, searchUsers } = useAuth();

  // skeleton while loading
  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-zinc-950 flex justify-center items-start pt-24 px-4">
        <nav className="w-full border-b border-zinc-800 fixed top-0 left-0 flex justify-between items-center px-[10%] py-4">
          <div className="h-4 w-12 rounded bg-zinc-800 animate-pulse" />
          <div className="flex gap-4 items-center">
            <div className="h-4 w-20 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-14 rounded bg-zinc-800 animate-pulse" />
          </div>
        </nav>

        <div className="md:w-[80%] w-[90%] max-w-2xl flex flex-col gap-5 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex justify-end">
            <div className="h-7 w-16 rounded-md bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 aspect-square rounded-full bg-zinc-800 animate-pulse" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-1/2 rounded bg-zinc-800 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-zinc-800 animate-pulse" />
              <div className="h-3 w-full rounded bg-zinc-800 animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // open the edit options
  const handleEdit = () => {
    setMsg("");
    setIsEditing(true);
  };

  // close the edit options
  const handleClose = () => {
    setIsEditing(false);
    setUsername("");
    setBio("");
    setGithub("");
    setMsg("");
  };

  // handle the submit
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
      setGithub("");
      setIsEditing(false);
      setMsg("Profile updated successfully.");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-zinc-950 flex justify-center items-start pt-24 px-4 text-zinc-200">

      {/* Navbar */}
      <nav className="w-full border-b border-zinc-800 fixed top-0 left-0 flex justify-between items-center px-[10%] py-4">
        <div>
          <Link className="text-white" href="/">Home</Link>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 p-2 text-white hover:text-zinc-300 transition"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />

            <span>Search</span>
          </button>
          <button type="button" onClick={logout} className="p-2 text-white">
            Logout
          </button>
        </div>
      </nav>

      {/* user Search overlay */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={searchUsers}
      />

      <div className="md:w-[80%] w-[90%] max-w-2xl flex flex-col gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg shadow-black/30">
        {/* Header */}
        <div className="w-full flex items-center justify-end">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition text-zinc-200"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition text-zinc-200"
            >
              Close
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-24 aspect-square shrink-0 rounded-full p-[3px] bg-gradient-to-br from-green-400 via-emerald-500 to-sky-500">
            <div className="w-full h-full rounded-full bg-zinc-800 flex justify-center items-center font-semibold uppercase text-white text-[clamp(1.5rem,6vw,2.25rem)]">
              {user?.username?.[0]}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-white truncate">{user?.username}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            {user?.bio && (
              <p className="text-sm text-zinc-400 mt-2 break-words">{user.bio}</p>
            )}
          </div>

          {user?.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="shrink-0 w-11 h-11 flex justify-center items-center rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
            >
              <FontAwesomeIcon icon={faGithub} className="text-xl text-white" />
            </a>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
            <input
              type="text"
              name="username"
              placeholder="Enter your new username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600"
            />

            <textarea
              placeholder="Write about yourself in 100 character"
              rows={3}
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600 resize-none"
            ></textarea>

            <input
              type="url"
              name="github"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithub(e.target.value)}
              className="outline-none text-sm bg-zinc-800 text-zinc-200 placeholder-zinc-500 px-3 py-2 rounded border border-transparent focus:border-zinc-600"
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
