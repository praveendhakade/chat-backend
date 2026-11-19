import { z } from "zod";

export const sendMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});

export const messageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export type SendMessageInput = z.infer<
  typeof sendMessageSchema
>;

export type MessageQueryInput = z.infer<
  typeof messageQuerySchema
>;