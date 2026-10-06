import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
}));
app.use("/api/users", authRoutes);

export default app;
