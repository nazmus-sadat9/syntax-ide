"use client";
import { log } from "node:console";
import React, { useState, useRef, useEffect } from "react";

const Editor = () => {

  const [code, setCode] = useState<string>("");
  const lineRef = useRef<HTMLDivElement>(null);

  const [output, setOutput] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const count = code.split("\n").length;
  const numbers = Array.from({ length: count }, (_, i: number): number => i + 1).join("\n");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const wsUrl = apiUrl.replace(/^http/, "ws");

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = (): void => {
      console.log("WebSocket is connected");
    }

    ws.onmessage = (event: MessageEvent) => {
      setOutput((prev: string[]): string[] => [...prev, event.data]);
    }

    ws.onerror = (error: Event): void => {
      console.error(error);
    }

    ws.onclose = (): void => {
      console.log("WebSocket disconnect");
    }

    return (): void => {
      ws.close();
    };
  }, []);

  // send the code for execute
  async function handleSubmit(e: React.FormEvent) {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && code.trim()) {
      socketRef.current.send(code);
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900">

      <div className="w-full bg-[#121212] flex justify-end p-[2%]">
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="py-[3%] px-[1rem] border-[0.1em] bg-green-600 rounded-md cursor-pointer"
          >
            Run
          </button>
        </form>
      </div>

      <div className="w-full h-full flex">
        <div ref={lineRef} className="w-10 overflow-hidden whitespace-pre py-2.5 pr-2 text-right select~none text-[#fff]">
          {numbers}
        </div>

        <textarea
          autoCapitalize="none"
          wrap="off"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCode(e.target.value)}
          onScroll={(e: React.UIEvent<HTMLTextAreaElement>) => {
            if (lineRef.current) {
              lineRef.current.scrollTop = e.currentTarget.scrollTop;
            }
          }}
          className="flex-1 font-mono resize-none overflow-auto whitespace-pre py-2.5 pl-2 text-[#ddd] outline-none"
        ></textarea>
      </div>

      <div className="w-full h-45 bg-[#121212] text-[#bbb] p-[2%]">
        <div className="w-full h-full">
          <pre className="w-full h-full">{output}</pre>
        </div>
      </div>

    </div>
  );
}

export default Editor;
