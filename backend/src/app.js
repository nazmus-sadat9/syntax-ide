import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import friendRoutes from "./routes/friend.routes.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
}));

app.use("/api/users", authRoutes);
app.use("/api/friends", friendRoutes);

export default app;
