import { Router } from "express";



import { sendMessageSchema } from "./message.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";

import {
  createMessage,
  listMessages,
} from "./message.controllers";
import { editMessageSchema } from "./message-mutation/message-mutation.validation.js";
import { deleteUserMessage, editUserMessage } from "./message-mutation/message-mutation.controller.js";

const router = Router({ mergeParams: true });

router.post(
  "/send",
  authenticate,
  validateBody(sendMessageSchema),
  createMessage
);

router.get(
  "/",
  authenticate,
  listMessages
);

router.put(
  "/:messageId/edit",
  authenticate,
  validateBody(editMessageSchema),
  editUserMessage
);

router.delete(
  "/:messageId/delete",
  authenticate,
  deleteUserMessage
);

export default router;