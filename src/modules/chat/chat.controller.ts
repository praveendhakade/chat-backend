import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.util.js";
import {
  createOrGetDirectChat,
  getUserChats,
} from "./chat.service.js";

export const createChat: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const result = await createOrGetDirectChat(
      req.user.id,
      req.body
    );

    res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? "Chat created successfully"
        : "Existing chat retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const listUserChats: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const chats = await getUserChats(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        chats,
        count: chats.length,
      },
    });
  } catch (error) {
    next(error);
  }
};