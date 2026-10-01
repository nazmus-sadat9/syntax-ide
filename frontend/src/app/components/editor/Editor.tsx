"use client";
import React, { useState, useRef, useEffect } from "react";

type ServerMessage = {
  type: "stdout" | "stderr" | "done" | "error";
  data: string;
};

const Editor = () => {
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const lineRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const count: number = code.split("\n").length;
  const numbers: string = Array.from({ length: count }, (_, i) => i + 1).join("\n");

  // load saved code
  useEffect(() => {
    const prevCode: string | null = localStorage.getItem("code");
    if (prevCode) setCode(prevCode);
  }, []);

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

  function handleRun(): void {
    localStorage.setItem("code", code);

    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && code.trim()) {
      setOutput("");
      ws.send(code);
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900">
      <div className="w-full bg-[#121212] flex justify-between p-[2%]">
        <select className="bg-zinc-800 text-[#fff] px-[1%] outline-none cursor-pointer">
          <option value="node">Node</option>
        </select>

        <button
          type="button"
          onClick={handleRun}
          className="py-1 px-4 bg-green-600 rounded-md cursor-pointer text-white"
        >
          Run
        </button>
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
          value={code}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCode(e.target.value)}
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
  );
};

export default Editor;
