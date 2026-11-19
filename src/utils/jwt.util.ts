import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { sub: userId },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    }
  );
};

export const verifyAccessToken = (token: string): string => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    typeof decoded.sub !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return decoded.sub;
};