import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-zinc-900 p-6 text-center font-mono text-zinc-100">
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-[clamp(8px,3vw,24px)] leading-none"
      >
        <span className="select-none text-[clamp(96px,28vw,200px)] font-light text-zinc-500">
          {"{"}
        </span>
        <Image
          src="/icons/search.svg"
          alt=""
          width={112}
          height={112}
          priority
          className="h-auto w-[clamp(56px,16vw,112px)]"
        />
        <span className="select-none text-[clamp(96px,28vw,200px)] font-light text-zinc-500">
          {"}"}
        </span>
      </div>

      <h1 className="text-[clamp(20px,5vw,28px)] font-semibold tracking-wide">
        404 - Page not found
      </h1>
      <p className="max-w-[32ch] text-[clamp(14px,3.6vw,16px)] leading-relaxed text-zinc-400">
        We looked everywhere, but this page doesn&apos;t exist.
      </p>

      <Link
        href="/"
        className="mt-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 active:opacity-80"
      >
        Go back home
      </Link>
    </main>
  );
}
