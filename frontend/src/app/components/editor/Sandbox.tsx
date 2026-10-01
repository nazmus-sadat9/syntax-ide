"use client";
import { useState, useRef, useEffect } from "react";

type Tab = "html" | "css" | "js";

export default function Sandbox() {
  const [tab, setTab] = useState<Tab>("html");
  const [code, setCode] = useState({ html: "", css: "", js: "" });
  const [srcDoc, setSrcDoc] = useState("");
  const lineRef = useRef<HTMLDivElement>(null);

  const count: number = code[tab].split("\n").length;
  const numbers: string = Array.from({ length: count }, (_, i) => i + 1).join("\n");

  // load the previous code
  useEffect(() => {
    const s = localStorage.getItem("sandbox-files");
    if (s) setCode(JSON.parse(s));

  }, []);

  // scroll when increase the line number
  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineRef.current) lineRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  const run = () => {

    // save the code in localStorage
    localStorage.setItem("sandbox-files", JSON.stringify(code));

    // Stop user JS from closing our <script> tag
    const safeJs = code.js.replace(/<\/script/gi, "<\\/script");

    setSrcDoc(`<!DOCTYPE html>
<html>
<head>
  <style>${code.css}</style>
</head>
<body>
  ${code.html}
  <script>${safeJs}<\/script>
</body>
</html>`);
  };

  const tabs: Tab[] = ["html", "css", "js"];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex items-center justify-between gap-2 p-[2%]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 cursor-pointer rounded-md border ${tab === t ? "bg-black text-white" : "bg-white text-black"
              }`}
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

          <textarea
            value={code[tab]}
            autoCapitalize="none"
            wrap="off"
            onScroll={syncScroll}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCode({ ...code, [tab]: e.target.value })}
            spellCheck={false}
            className="flex-1 h-full resize-none outline-none py-2 pl-2 text-[#ddd] font-mono text-sm leading-6 whitespace-pre overflow-auto"
          />
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
