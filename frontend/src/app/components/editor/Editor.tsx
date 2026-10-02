"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./sidebar/Sidebar";

type ServerMessage = {
  type: "stdout" | "stderr" | "done" | "error";
  data: string;
};

const Editor = () => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const code: string = current ? files[current] ?? "" : "";
  const count: number = code.split("\n").length;
  const numbers: string = Array.from({ length: count }, (_, i) => i + 1).join("\n");

  // load saved files
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

  // auto save
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("files", JSON.stringify(files));
    } catch { }
  }, [files, loaded]);

  // websocket connection
  useEffect(() => {
    const apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const ws = new WebSocket(apiUrl.replace(/^http/, "ws"));
    socketRef.current = ws;

    ws.onopen = (): void => console.log("WebSocket connected");

    ws.onmessage = (event: MessageEvent<string>): void => {
      const msg: ServerMessage = JSON.parse(event.data);
      setOutput((prev: string) => prev + msg.data + (msg.type === "done" || msg.type === "error" ? "\n" : ""));
    };

    ws.onerror = (): void => console.error("WebSocket error: is the backend running?");
    ws.onclose = (): void => console.log("WebSocket disconnected");

    return (): void => ws.close();
  }, []);

  // file ccontrol
  function handleCreate(name: string): void {
    setFiles((prev: Record<string, string>) => ({ ...prev, [name]: "" }));
    setCurrent(name);
  }

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

  function handleRun(): void {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && code.trim()) {
      setOutput("");
      ws.send(code);
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

      <div className="flex-1 w-full flex flex-col">
        <div className="w-full bg-[#121212] flex justify-between items-center p-[2%]">

          <span className="text-zinc-400 text-sm">{current ?? ""}</span>

          <div className="flex items-center gap-3">

            <div className="relative cursor-pointer">

              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-zinc-800 py-1 px-2 text-[#fff] rounded-md"
              >
                options
              </button>

              <div className={`${isOpen ? "block" : "hidden"} absolute top-8 bg-[#121212] border-[0.1em] font-serif border-[#222] z-999 left-0 flex flex-col p-2 text-[#aaa]`}>
                <Link
                  href="/sandbox"
                  onClick={() => setIsOpen(false)}
                  className=""
                >
                  Sandbox
                </Link>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!current}

                  className="disabled:opacity-40"
                >
                  Download
                </button>

              </div>
            </div>

            <div className="">
              <button
                type="button"
                onClick={handleRun}
                disabled={!current}
                className="py-1 px-4 bg-green-600 rounded-md cursor-pointer text-white disabled:opacity-40"
              >
                Run
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 flex min-h-0">
          <div
            ref={lineRef}
            className="w-10 overflow-hidden whitespace-pre font-mono py-2.5 pr-2 text-right select-none text-white"
          >
            {numbers}
          </div>

          <textarea
            autoCapitalize="none"
            spellCheck={false}
            wrap="off"
            disabled={!current}
            placeholder={current ? "" : "Select a file"}
            value={code}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
            onScroll={(e: React.UIEvent<HTMLTextAreaElement>) => {
              if (lineRef.current) lineRef.current.scrollTop = e.currentTarget.scrollTop;
            }}
            className="flex-1 font-mono resize-none overflow-auto whitespace-pre py-2.5 pl-2 text-[#ddd] outline-none"
          />
        </div>

        <div className="w-full h-40 bg-[#121212] text-[#bbb] p-[2%] overflow-auto">
          <pre className="font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default Editor;
