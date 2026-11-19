import { Router } from "express";

import { createChat } from "./chat.controller.js";

import { createChatSchema } from "./chat.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";

import messageRouter from "../message/message.route.js";
import {
  markAsRead,
  updateUserLastSeen,
} from "../read-receipt/read-receipt.controller.js";
import { lastSeenSchema } from "../read-receipt/read-receipt.validation.js";
import { createGroup } from "./groupChat/group-chat.controller.js";
import { createGroupChatSchema } from "./groupChat/group-chat.validation.js";

const router = Router();

router.post(
  "/create",
  authenticate,
  validateBody(createChatSchema),
  createChat,
);

router.post(
  "/group/create",
  authenticate,
  validateBody(createGroupChatSchema),
  createGroup,
);

router.post("/:chatId/message/:messageId/read", authenticate, markAsRead);
router.post(
  "/:chatId/lastseen",
  authenticate,
  validateBody(lastSeenSchema),
  updateUserLastSeen,
);

router.use("/:chatId/messages", messageRouter);
router.use("/:chatId/message", messageRouter);

export default router;
