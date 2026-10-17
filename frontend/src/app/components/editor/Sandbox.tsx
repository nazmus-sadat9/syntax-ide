"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { tokenize } from "@/lib/highlighter/tokenize";
import type { Token } from "@/lib/highlighter/types";
import { tokenStyles } from "@/lib/highlighter/styles";

type Tab = "html" | "css" | "js";

export default function Sandbox() {
  const [tab, setTab] = useState<Tab>("html");
  const [code, setCode] = useState({ html: "", css: "", js: "" });
  const [srcDoc, setSrcDoc] = useState("");
  const lineRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const count: number = code[tab].split("\n").length;
  const numbers: string = Array.from({ length: count }, (_, i) => i + 1).join("\n");

  // tokenize the current tab code (only highlight JS for simplicity)
  const tokens: Token[] = useMemo(() => {
    if (!code[tab]) return [];
    // Use 'js' as language for all tabs; modify if you want more
    return tokenize(code[tab], "js");
  }, [code[tab]]);

  // load the previous code
  useEffect(() => {
    const s = localStorage.getItem("sandbox-files");
    if (s) setCode(JSON.parse(s));
  }, []);

  // sync line numbers and highlight overlay on scroll
  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineRef.current) lineRef.current.scrollTop = scrollTop;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
  };

  const run = () => {
    // save the code in localStorage
    localStorage.setItem("sandbox-files", JSON.stringify(code));

    // Stop user JS from closing our <script> tag
    const safeJs = code.js.replace(/<\/script/gi, "<\\/script");

    setSrcDoc(`<!DOCTYPE html>\n<html>\n<head>\n  <style>${code.css}</style>\n</head>\n<body>\n  ${code.html}\n  <script>${safeJs}\</script>\n</body>\n</html>`);
  };

  const tabs: Tab[] = ["html", "css", "js"];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex items-center justify-between gap-2 p-[2%]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 cursor-pointer rounded-md border ${tab === t ? "bg-black text-white" : "bg-white text-black"}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
        <button
          onClick={run}
          className="ml-auto px-4 py-1 bg-green-600 text-white rounded-md cursor-pointer"
        >
          Run
        </button>
      </div>

      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">

        <div className="w-full h-full flex overflow-hidden">
          <div
            ref={lineRef}
            className="w-10 shrink-0 overflow-hidden whitespace-pre font-serif text-sm leading-6 py-2 pr-2 text-right select-none text-[#fff]"
          >
            {numbers}
          </div>

          <div className="relative flex-1 h-full overflow-hidden">
            {/* Highlight overlay */}
            <pre
              ref={preRef}
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
              value={code[tab]}
              autoCapitalize="none"
              wrap="off"
              onScroll={syncScroll}
              onChange={(e) => setCode({ ...code, [tab]: e.target.value })}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent font-mono resize-none overflow-auto whitespace-pre py-2.5 pl-2 text-[#ddd] caret-white leading-normal outline-none"
            />
          </div>
        </div>

        {/* allow-scripts only */}
        <iframe
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          title="preview"
          className="w-full h-full bg-white"
        />
      </div>
    </div>
  );
}
