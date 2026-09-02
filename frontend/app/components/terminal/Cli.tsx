"use client";
import { useState, useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";

const Cli = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const webContainerRef = useRef<WebContainer | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(()=>{
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !terminalRef.current) {
      return;
    }

    let term: Terminal;
    let fitAddon: FitAddon;

    // initial terminal
    async function init() {
      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#1e1e1e",
          foreground: "#ffffff"
        }
      });
      
      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (terminalRef.current) {
        term.open(terminalRef.current);
      }

      fitAddon.fit();

      try {

        if (!webContainerRef.current) {     
          webContainerRef.current = await WebContainer.boot();
        }

        const shellProcess = await webContainerRef.current.spawn('jsh');

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            },
          })
        );

        const input = shellProcess.input.getWriter();
        term.onData((data: string)=>{
          input.write(data);
        });

        term.write("$ ");

      } catch (err: any) {
        term.write(`Error: ${err.message} \r\n`);
      }

    }

    init();
  
    return () => {
      term?.dispose();
    }
  }, []);
  
  return (
    <div ref={terminalRef} className="w-full h-full bg-[#1e1e1e] p-2">
      
    </div>
  )
}

export default Cli;
