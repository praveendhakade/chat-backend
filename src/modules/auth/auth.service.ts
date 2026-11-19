import { AppError } from "../../utils/app-error.util.js";
import {
  comparePassword,
  hashPassword,
} from "../../utils/password.util.js";
import { generateAccessToken } from "../../utils/jwt.util.js";
import type {
  LoginInput,
  RegisterInput,
} from "./auth.validation.js";
import { prisma } from "../../config/database.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export const registerUser = async (input: RegisterInput) => {
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: publicUserSelect,
    });

    const accessToken = generateAccessToken(user.id);

    return { user, accessToken };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "Email is already registered");
    }

    throw error;
  }
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};