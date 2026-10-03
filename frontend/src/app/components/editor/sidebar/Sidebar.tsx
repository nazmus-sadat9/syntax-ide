"use client";
import React, { useState } from "react";
import Image from "next/image";

type SidebarProps = {
  files: Record<string, string>;
  current: string | null;
  onSelect: (name: string) => void;
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
};

const Sidebar = ({ files, current, onSelect, onCreate, onDelete }: SidebarProps) => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");

  function handleCreate(): void {
    const clean: string = name.trim();
    if (!clean) return setError("Enter a file name");
    if (/[\\/]/.test(clean)) return setError("/ ba \\ use kora jabe na");
    if (clean in files) return setError("Already exiest");

    onCreate(clean);
    setName("");
    setError("");
  }

  return (
    <div className="w-36 sm:w-56 h-full flex flex-col bg-[#121212] border-r border-zinc-800 text-[#ddd]">
      <div className="p-2 flex flex-col gap-1">
        <input
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="File name.."
          autoCapitalize="none"
          spellCheck={false}
          className="w-full bg-zinc-800 text-white px-2 py-1 rounded outline-none text-sm"
        />

        <button
          type="button"
          onClick={handleCreate}
          className="w-full py-1 bg-zinc-700 rounded text-sm cursor-pointer"
        >
          New file
        </button>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      <ul className="flex-1 px-2 overflow-auto">
        {Object.keys(files).length === 0 && (
          <li className="px-2 py-1 text-xs text-zinc-500">Empty</li>
        )}
        {Object.keys(files).map((fileName: string) => (

          <li
            key={fileName}
            onClick={() => onSelect(fileName)}
            className={`group flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer ${fileName === current ? "bg-zinc-800 text-white" : "hover:bg-zinc-900"
              }`}
          >

            <span>
              <Image
                src={`icons/${fileName.split(".").pop()}.svg`}
                alt="icon"
                width={16}
                height={16}
              />
            </span>

            <span className="truncate">{fileName}</span>

            <button
              type="button"
              aria-label={`Delete ${fileName}`}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                if (confirm(`Delete ${fileName}? `)) onDelete(fileName);
              }}
              className="ml-2 text-zinc-500 cursor-pointer"
            >
              ×
            </button>

          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
