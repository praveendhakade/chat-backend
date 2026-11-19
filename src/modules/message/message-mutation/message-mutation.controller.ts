import type { Request, Response, NextFunction } from "express";

import {
  editMessage,
  deleteMessage,
} from ".././message.service.js";
import { z } from "zod";
import { AppError } from "../../../utils/app-error.util.js";

const chatIdSchema = z.uuid();

const messageIdSchema = z.string().min(1);

export async function editUserMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const chatIdResult = chatIdSchema.safeParse(req.params.chatId);
    const messageIdResult = messageIdSchema.safeParse(
      req.params.messageId
    );

    if (!chatIdResult.success || !messageIdResult.success) {
      throw new AppError(400, "Invalid chat or message ID");
    }

    const userId = req.user!.id;
    const { text } = req.body;

    const message = await editMessage(
      chatIdResult.data,
      messageIdResult.data,
      userId,
      text
    );

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const chatIdResult = chatIdSchema.safeParse(req.params.chatId);
    const messageIdResult = messageIdSchema.safeParse(
      req.params.messageId
    );

    if (!chatIdResult.success || !messageIdResult.success) {
      throw new AppError(400, "Invalid chat or message ID");
    }

    const userId = req.user!.id;

    const result = await deleteMessage(
      chatIdResult.data,
      messageIdResult.data,
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}