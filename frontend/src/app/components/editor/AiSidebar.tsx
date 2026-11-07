"use client";
import { useState } from "react";

type Msg = { role: "user" | "ai"; text: string };
type Props = { code: string; filename: string | null; language: string };

const AiSidebar = ({ code, filename, language }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const history = messages;
    setMessages([...history, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:5000";
      const res = await fetch(`${base}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // or add your auth token header
        body: JSON.stringify({ message: text, code, filename, language, history }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply ?? data.error ?? "Error" }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Could not reach the AI server." }]);
    }
    setLoading(false);
  }

  return (
    <div className="w-80 flex flex-col bg-[#121212] border-l border-zinc-800 min-h-0">
      <div className="p-3 text-zinc-300 text-sm border-b border-zinc-800 flex justify-between items-center">
        AI Assistant
        <button
          onClick={() => send("Find bugs in this file.")}
          disabled={!filename || loading}
          className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2 py-1 rounded disabled:opacity-40"
        >
          Find bugs
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm whitespace-pre-wrap rounded-md p-2 ${
              m.role === "user" ? "bg-zinc-800 text-white" : "text-zinc-300"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-zinc-500 text-sm">Thinking...</div>}
      </div>

      <div className="p-2 border-t border-zinc-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about your code..."
          className="flex-1 bg-zinc-800 text-white text-sm px-2 py-1 rounded outline-none"
        />
        <button onClick={() => send(input)} className="bg-green-600 text-white text-sm px-3 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default AiSidebar;
