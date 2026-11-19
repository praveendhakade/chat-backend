import { Router } from "express";
import { listUserChats } from "../chat/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/chats", authenticate, listUserChats);

export default router;