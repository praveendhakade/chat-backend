import type { RequestHandler } from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
} from "./auth.service.js";
import { AppError } from "../../utils/app-error.util.js";

export const register: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const user = await getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};