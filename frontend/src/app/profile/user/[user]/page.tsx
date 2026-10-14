"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserProfilePage() {

  const { user } = useParams<{ user: string }>();
  const username = decodeURIComponent(user);

  // TODO: fetch this user's data with `username` from your API

  return (
    <div className="w-screen min-h-screen bg-zinc-950 flex justify-center items-start pt-24 px-4 text-zinc-200">
      <div className="md:w-[80%] w-[90%] max-w-2xl flex flex-col gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <Link href="/profile" className="text-xs text-zinc-400 hover:text-white">
          &larr; Back
        </Link>
        <p className="text-lg font-semibold text-white">{username}</p>
      </div>
    </div>
  );
}
