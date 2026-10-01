import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";

const app = express();
app.get("/", (req, res) => res.send("Server is running"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function send(ws, type, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  let child = null;

  ws.on("message", (message) => {
    const code = message.toString();

    if (child) child.kill("SIGKILL"); // stop previous run

    child = spawn(process.execPath, ["-e", code]);

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      send(ws, "error", "Timed out after 5 seconds");
    }, 5000);

    child.stdout.on("data", (d) => send(ws, "stdout", d.toString()));
    child.stderr.on("data", (d) => send(ws, "stderr", d.toString()));

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      send(ws, "done", `\n[exited with code ${exitCode}]`);
    });
  });

  ws.on("close", () => {
    if (child) child.kill("SIGKILL");
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
