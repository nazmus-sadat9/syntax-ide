"use client";
import { useState, useRef } from "react";

const Editor = () => {

  const [code, setCode] = useState<string>("");
  const lineRef = useRef<HTMLDivElement>(null);

  const count = code.split("\n").length;
  const numbers = Array.from({ length: count }, (_, i: number): number => i + 1).join("\n");

  return (
    <div className="w-full h-full bg-zinc-900">
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
          className="flex-1 resize-none overflow-auto whitespace-pre py-2.5 pl-2 text-[#fff] outline-none"
        ></textarea>
      </div>
    </div >
  );
}

export default Editor;
