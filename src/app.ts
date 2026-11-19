
import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import { errorHandler } from "./modules/middlewares/error.middleware.js";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat backend is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);

app.use(errorHandler);

export default app;
