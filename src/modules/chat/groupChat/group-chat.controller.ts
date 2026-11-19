import type { RequestHandler } from "express";
import { AppError } from "../../../utils/app-error.util";
import { createGroupChat } from "../chat.service";

export const createGroup: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const group = await createGroupChat(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Group chat created successfully",
      data: {
        chat: group,
      },
    });
  } catch (error) {
    next(error);
  }
};