import "dotenv/config";
import mongoose from "mongoose";
import http from "http";
import app from "./src/app.js";
import { initWebSocket } from "./src/webSockets/socket.js";

const PORT = process.env.PORT || 8080;

try {
  mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

} catch (err) {
  console.log("MongoDB connection failed", err);
}

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
