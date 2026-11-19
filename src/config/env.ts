
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),

  FIREBASE_PROJECT_ID: z.string().min(1),

  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  
  JWT_EXPIRES_IN: z.string().default("15m"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error("Environment configuration failed");
}

export const env = parsedEnv.data;
