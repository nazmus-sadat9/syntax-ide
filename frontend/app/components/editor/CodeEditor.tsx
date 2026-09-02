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

        <div className="w-full col-span-3 bg-zinc-500 row-span-10">
          <Editor 
            defaultLanguage={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />

        </div>

        <div className="w-full col-span-1 row-span-10 bg-red-100">
          chat
        </div>

        <div className="w-full col-span-4 row-span-1 resize-y overflow-auto">
          <Terminal />
        </div>

      </div>
    </div>
  )
}

export default CodeEditor;
