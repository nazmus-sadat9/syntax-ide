"use client";
import React, { useEffect, useRef, useState } from "react";
import { useFriend } from "../hooks/useFriend";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type SearchUser = { username: string; email?: string; bio?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchUser[]>;
};

export default function SearchOverlay({ open, onClose, onSearch }: Props) {
  const { sendRequest } = useFriend();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(0);

  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Focus to input and stop the scrolling
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Debounced search logic
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      latest.current++;
      setResults([]);
      setSearching(false);
      setError("");
      return;
    }

    const id = ++latest.current;
    setSearching(true);
    setError("");

    const t = setTimeout(async () => {
      try {
        const users = await onSearch(q);
        if (id === latest.current) setResults(users ?? []);
      } catch (err) {
        if (id === latest.current) setError((err as Error).message || "Something went wrong. Try again.");
      } finally {
        if (id === latest.current) setSearching(false);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [query]);

  // redirect to dynamic page
  const goToProfile = (username: string) => {
    router.push(`/profile/user/${encodeURIComponent(username)}`);
    onClose();
  };

  const q = query.trim();

  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-950 overflow-y-auto transition-all duration-300 ${open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        }`}
    >
      <div className="w-[90%] max-w-xl mx-auto pt-6 pb-10 flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 rounded-xl px-3 transition">

            <FontAwesomeIcon icon={faMagnifyingGlass} />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Search username..."
              className="flex-1 min-w-0 bg-transparent outline-none text-zinc-200 placeholder-zinc-500 py-3 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm leading-none"
              >
                &times;
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>

        {/* Skeleton loading while searching */}
        {searching && (
          <ul className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-1/3 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-zinc-800 animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Error */}
        {!searching && error && <p className="text-sm text-red-400 text-center mt-6">{error}</p>}

        {/* Results of the user */}
        {!searching && !error && results.length > 0 && (
          <ul className="flex flex-col gap-2">
            {results.map((u) => (
              <li key={u.username}>
                <button
                  type="button"
                  onClick={() => goToProfile(u.username)}
                  className="w-full text-left flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-zinc-800 rounded-xl transition"
                >
                  <div className="w-12 h-12 shrink-0 rounded-full p-[2px] bg-gradient-to-br from-green-400 via-emerald-500 to-sky-500">
                    <div className="w-full h-full rounded-full bg-zinc-800 flex justify-center items-center font-semibold uppercase text-white">
                      {u.username[0]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{u.username}</p>
                    {u.email && <p className="text-xs text-zinc-500 truncate">{u.email}</p>}
                    {u.bio && <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{u.bio}</p>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* No results for user */}
        {!searching && !error && q && results.length === 0 && (
          <p className="text-sm text-zinc-500 text-center mt-10">No accounts found for &quot;{q}&quot;</p>
        )}

        {/* Idle */}
        {!q && (
          <div className="text-center text-zinc-600 text-sm mt-16">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-2xl text-zinc-500">
              ?
            </div>
            Start typing to search for accounts
          </div>
        )}
      </div>
    </div>
  );
}
