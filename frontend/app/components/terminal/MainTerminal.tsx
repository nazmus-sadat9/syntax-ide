"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const TerminalComponent = dynamic(() => import("./Cli"), {
  ssr: false,
  loading: () => <div className="text-gray-500">Loading...</div>,
});

export default function MainTerminal() {
  return <TerminalComponent />;
}
