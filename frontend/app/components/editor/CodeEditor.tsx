"use client";
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
  return (
    <div className="w-full">
      <Editor 
        height="100vh"
        defaultLanguage="javascript"
        theme="vs-dark"
      />
    </div>
  )
}

export default CodeEditor;
