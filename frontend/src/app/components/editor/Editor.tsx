"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Sidebar from "./sidebar/Sidebar";
import { tokenize } from "@/lib/highlighter/tokenize";
import type { Token } from "@/lib/highlighter/types";
import { tokenStyles } from "@/lib/highlighter/styles";

// language types 
type Language = "js" | "cpp" | "c";

// server message tyoes 
type ServerMessage = {
  type: "stdout" | "stderr" | "done" | "error";
  data: string;
};

const Editor = () => {

  // states
  const [files, setFiles] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>("js");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // references
  const lineRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const code: string = current ? files[current] ?? "" : "";

  const tokens: Token[] = useMemo(() => {
    if (!code) return [];

    return tokenize(code, language);

  }, [code, language]);

  // editor line number s
  const count: number = code.split("\n").length;
  const numbers: string = Array.from({ length: count }, (_, i) => i + 1).join("\n");

  // Load saved files
  useEffect(() => {
    try {
      const saved: string | null = localStorage.getItem("files");
      if (saved) {
        const parsed: Record<string, string> = JSON.parse(saved);
        setFiles(parsed);
        const first: string | undefined = Object.keys(parsed)[0];
        if (first) setCurrent(first);
      }
    } catch { }
    setLoaded(true);
  }, []);

  // Auto save
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("files", JSON.stringify(files));
    } catch { }
  }, [files, loaded]);

  // auto detect language 
  useEffect(() => {
    if (!current) return;
    if (current.endsWith(".cpp")) setLanguage("cpp");
    else if (current.endsWith(".c")) setLanguage("c");
    else if (current.endsWith(".js") || current.endsWith(".ts")) setLanguage("js");
  }, [current]);

  // websocket for js, c, cpp 
  useEffect(() => {

    const apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const ws = new WebSocket(apiUrl.replace(/^http/, "ws"));
    socketRef.current = ws;

    ws.onopen = (): void => console.log("WebSocket connected");

    ws.onmessage = (event: MessageEvent<string>): void => {
      const msg: ServerMessage = JSON.parse(event.data);
      setOutput((prev: string) => prev + msg.data + (msg.type === "done" || msg.type === "error" ? "\n" : ""));
      if (msg.type === "done" || msg.type === "error") {
        setIsRunning(false);
      }
    };

    ws.onerror = (): void => console.error("WebSocket error: is the backend running?");
    ws.onclose = (): void => console.log("WebSocket disconnected");

    return (): void => ws.close();
  }, []);

  // create file
  function handleCreate(name: string): void {
    setFiles((prev: Record<string, string>) => ({ ...prev, [name]: "" }));
    setCurrent(name);
  }

  // delete file 
  function handleDelete(name: string): void {
    const rest: Record<string, string> = { ...files };
    delete rest[name];
    setFiles(rest);
    if (current === name) setCurrent(Object.keys(rest)[0] ?? null);
  }

  function handleChange(value: string): void {
    if (!current) return;
    setFiles((prev: Record<string, string>) => ({ ...prev, [current]: value }));
  }

  // handle download
  function handleDownload(): void {
    if (!current) return;
    const blob = new Blob([code], { type: "text/plain" });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = current;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Unified WebSocket 
  function handleRun(): void {
    if (!code.trim() || isRunning) return;

    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      setOutput("");
      setIsRunning(true);
      // send json with code and language 
      ws.send(JSON.stringify({ language, code }));
    } else {
      setOutput("WebSocket is not connected.");
    }
  }

  return (
    <div className="w-full h-full flex bg-zinc-900">

      <Sidebar
        files={files}
        current={current}
        onSelect={setCurrent}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />

      <div className="flex-1 w-full flex flex-col min-w-0">
        <div className="w-full bg-[#121212] flex justify-between items-center p-[2%]">
          <span className="text-zinc-400 text-sm">{current ?? ""}</span>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-zinc-800 text-white text-sm py-1 px-2 rounded-md outline-none border border-zinc-700 cursor-pointer"
            >
              <option value="js">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>

            {/* Options Dropdown */}
            <div className="relative cursor-pointer">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-zinc-800 py-1 px-2 text-[#fff] rounded-md text-sm"
              >
                Options
              </button>

              <div
                className={`${isOpen ? "block" : "hidden"
                  } absolute top-8 bg-[#121212] border-[0.1em] border-[#222] z-50 left-0 flex flex-col p-2 text-[#aaa] min-w-[100px]`}
              >
                <Link
                  href="/sandbox"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-white py-1"
                >
                  Sandbox
                </Link>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!current}
                  className="text-left disabled:opacity-40 hover:text-white py-1"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Run Button */}
            <div>
              <button
                type="button"
                onClick={handleRun}
                disabled={!current || isRunning}
                className="py-1 px-4 bg-green-600 hover:bg-green-500 rounded-md cursor-pointer text-white disabled:opacity-40 text-sm transition-colors"
              >
                {isRunning ? "Running..." : "Run"}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 flex min-h-0">
          <div
            ref={lineRef}
            className="w-10 overflow-hidden whitespace-pre font-mono py-2.5 pr-2 text-right select-none text-zinc-500 bg-[#121212]"
          >
            {numbers}
          </div>

          {/* Editor container */}
          <div className="relative flex-1 h-full overflow-hidden">

            {/* Display hightlighting */}
            <pre
              aria-hidden="true"
              className="absolute inset-0 m-0 p-0 py-2.5 pl-2 font-mono whitespace-pre overflow-hidden pointer-events-none text-transparent leading-normal"
            >
              {tokens.map((token, index) => (
                <span
                  key={index}
                  className={tokenStyles[token.type] || tokenStyles.word}
                >
                  {token.value}
                </span>
              ))}
            </pre>

            {/* Input area */}
            <textarea
              autoCapitalize="none"
              spellCheck={false}
              wrap="off"
              disabled={!current}
              placeholder={current ? "" : "Select or create a file"}
              value={code}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
              onScroll={(e: React.UIEvent<HTMLTextAreaElement>) => {
                if (lineRef.current) lineRef.current.scrollTop = e.currentTarget.scrollTop;
              }}
              className="absolute inset-0 w-full h-full bg-transparent font-mono resize-none overflow-auto whitespace-pre py-2.5 pl-2 text-transparent caret-white leading-normal outline-none"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-full h-40 bg-[#121212] text-[#bbb] p-[2%] overflow-auto border-t border-zinc-800">
          <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default Editor;
