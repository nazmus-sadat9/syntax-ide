import http from "http";
import app from "./src/app.js";
import { initWebSocket } from "./src/webSockets/socket.js";

const server = http.createServer(app);
initWebSocket(server);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
