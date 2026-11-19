import { Router } from "express";

import {
  login,
  me,
  register,
} from "./auth.controller.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";

import { validateBody } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  register
);

router.post(
  "/login",
  validateBody(loginSchema),
  login
);

router.get(
  "/me",
  authenticate,
  me
);

export default router;