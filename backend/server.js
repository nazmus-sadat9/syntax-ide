import { WebSocketServer, WebSocket } from "ws";

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("WebSocket connected");

│   ws.send(JSON.stringify({ message: "Connected to WebSocket" }));

    ws.on("message", (data) => {
      console.log(message);
    });

    ws.on("close", () => {
      console.log("WebSocket close");
    });

    ws.on("error", (err) => {
      console.log(err);
    });

  )
};

return wss;
}


export default initWebSocket;
