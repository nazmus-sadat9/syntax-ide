"use client";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import ShowProject from "../sidebar/ShowProject";
import Terminal from "../terminal/MainTerminal";

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");

  return (
    <div className="w-full h-full">
      <div className="w-full h-full grid grid-cols-6 grid-rows-12">
        <div className="w-full col-span-2 row-span-12">
          <ShowProject />
        </div>

        <div className="w-full col-span-2 row-span-1">
          topbar
        </div>

        {/* UPDATED: Adjusted row-span from 10 to 8 to leave room for the terminal */}
        <div className="w-full col-span-3 bg-zinc-500 row-span-8">
          <Editor
            defaultLanguage={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />
        </div>

        {/* UPDATED: Adjusted row-span from 10 to 8 to align with the editor */}
        <div className="w-full col-span-1 row-span-8 bg-red-100">
          chat
        </div>

        {/* UPDATED: Changed row-span from 1 to 3 so the terminal has visible height.
            Added overflow-hidden to prevent layout breaking. */}
        <div className="w-full col-span-4 row-span-3 overflow-hidden">
          <Terminal />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
