"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "ai"; text: string };
type Props = { code: string; filename: string | null; language: string };

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/ai`;

const AiSidebar = ({ code, filename, language }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string): Promise<void> {
    if (!text.trim() || loading) return;

    const history: Msg[] = messages;
    setMessages([...history, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, code, filename, language, history }),
      });

      const data = await res.json();

      setMessages((m) => [
        ...m,
        { role: "ai", text: data.reply ?? data.error ?? data.message ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Could not reach the AI server." }]);
    }

    setLoading(false);
  }

  return (
    <div className="w-80 shrink-0 flex flex-col bg-[#121212] border-l border-zinc-800 min-h-0">
      {/* Header */}
      <div className="p-3 text-zinc-300 text-sm border-b border-zinc-800 flex justify-between items-center">
        <span>AI Assistant</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => send("Find bugs in this file.")}
            disabled={!filename || loading}
            className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2 py-1 rounded disabled:opacity-40"
          >
            Find bugs
          </button>
          <button
            type="button"
            onClick={() => setMessages([])}
            disabled={loading || messages.length === 0}
            className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2 py-1 rounded disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-zinc-500 text-sm">
            Select a file and click "Find bugs", or ask a question about your code.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm whitespace-pre-wrap break-words rounded-md p-2 ${
              m.role === "user" ? "bg-zinc-800 text-white" : "text-zinc-300"
            }`}
          >
            {m.text}
          </div>
        ))}

        {loading && <div className="text-zinc-500 text-sm">Thinking...</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-zinc-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about your code..."
          className="flex-1 min-w-0 bg-zinc-800 text-white text-sm px-2 py-1 rounded outline-none"
        />
        <button
          type="button"
          onClick={() => send(input)}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 rounded disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiSidebar;
