import type { RequestHandler } from "express";
import { z } from "zod";

import { AppError } from "../../utils/app-error.util.js";
import {
  getChatMessages,
  sendMessage,
} from "./message.service.js";

import {
  messageQuerySchema,
} from "./message.validation.js";

const chatIdSchema = z.uuid();

export const createMessage: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const chatIdResult = chatIdSchema.safeParse(req.params.chatId);

    if (!chatIdResult.success) {
      throw new AppError(400, "Invalid chat ID");
    }

    const message = await sendMessage(
      chatIdResult.data,
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const listMessages: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const chatIdResult = chatIdSchema.safeParse(req.params.chatId);

    if (!chatIdResult.success) {
      throw new AppError(400, "Invalid chat ID");
    }

    const queryResult = messageQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      throw new AppError(400, "Invalid pagination parameters");
    }

    const result = await getChatMessages(
      chatIdResult.data,
      req.user.id,
      queryResult.data
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};