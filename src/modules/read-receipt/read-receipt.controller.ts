import type { RequestHandler } from "express";
import { z } from "zod";

import { AppError } from "../../utils/app-error.util.js";

import {
  markMessageAsRead,
  updateLastSeen,
} from "./read-receipt.service.js";

import { lastSeenSchema } from "./read-receipt.validation.js";

const chatIdSchema = z.uuid();

const messageIdSchema = z.string().min(1);

export const markAsRead: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const chatIdResult = chatIdSchema.safeParse(req.params.chatId);
    const messageIdResult = messageIdSchema.safeParse(
      req.params.messageId
    );

    if (!chatIdResult.success || !messageIdResult.success) {
      throw new AppError(400, "Invalid chat or message ID");
    }

    const receipt = await markMessageAsRead(
      chatIdResult.data,
      messageIdResult.data,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: { receipt },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserLastSeen: RequestHandler = async (
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

    const bodyResult = lastSeenSchema.safeParse(req.body);

    if (!bodyResult.success) {
      throw new AppError(400, "Invalid last-seen request");
    }

    const state = await updateLastSeen(
      chatIdResult.data,
      bodyResult.data.messageId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Last seen updated successfully",
      data: { state },
    });
  } catch (error) {
    next(error);
  }
};