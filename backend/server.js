import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.get("/", (req, res) => res.send("Server is running"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// temporary dir
const TEMP_DIR = path.join(process.cwd(), "temp_exec");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function send(ws, type, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

function cleanupFiles(files) {
  files.forEach((file) => {
    if (file && fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        console.error(`Failed to delete temp file ${file}:`, err);
      }
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  let activeChild = null;

  ws.on("message", (rawMessage) => {
    // 1. Kill any previously running process
    if (activeChild) {
      activeChild.kill("SIGKILL");
      activeChild = null;
    }

    let payload;
    try {
      payload = JSON.parse(rawMessage.toString());
    } catch {
      payload = { language: "js", code: rawMessage.toString() };
    }

    const { language = "js", code = "" } = payload;
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // javaScript execution
    if (language === "js") {
      const child = spawn(process.execPath, ["-e", code]);
      activeChild = child;

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        send(ws, "error", "Timed out after 5 seconds");
      }, 5000);

      child.stdout.on("data", (d) => send(ws, "stdout", d.toString()));
      child.stderr.on("data", (d) => send(ws, "stderr", d.toString()));

      child.on("close", (exitCode) => {
        clearTimeout(timer);
        send(ws, "done", `\n[exited with code ${exitCode}]`);
        activeChild = null;
      });
      return;
    }

    // C / C++ Compilation & Execution -
    if (language === "cpp" || language === "c") {
      const isCpp = language === "cpp";
      const ext = isCpp ? "cpp" : "c";
      const compiler = isCpp ? "g++" : "gcc";

      const sourceFile = path.join(TEMP_DIR, `${fileId}.${ext}`);
      const binaryFile = path.join(TEMP_DIR, `${fileId}.out`);

      // write a temporary filee
      fs.writeFileSync(sourceFile, code);

      // Compile command.
      const compileCmd = `${compiler} -O2 "${sourceFile}" -o "${binaryFile}"`;

      exec(compileCmd, { timeout: 10000 }, (compileErr, stdout, stderr) => {
        // Report compilation errors if any
        if (stderr) {
          send(ws, "stderr", stderr);
        }

        if (compileErr) {
          cleanupFiles([sourceFile, binaryFile]);
          send(ws, "error", "\n[Compilation Failed]");
          return;
        }

        // Run the compiled binary
        const child = spawn(binaryFile);
        activeChild = child;

        const timer = setTimeout(() => {
          child.kill("SIGKILL");
          send(ws, "error", "Timed out after 5 seconds");
        }, 5000);

        child.stdout.on("data", (d) => send(ws, "stdout", d.toString()));
        child.stderr.on("data", (d) => send(ws, "stderr", d.toString()));

        child.on("close", (exitCode) => {
          clearTimeout(timer);
          send(ws, "done", `\n[exited with code ${exitCode}]`);
          cleanupFiles([sourceFile, binaryFile]);
          activeChild = null;
        });
      });
      return;
    }

    send(ws, "error", `Unsupported language: ${language}`);
  });

  ws.on("close", () => {
    if (activeChild) activeChild.kill("SIGKILL");
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})
