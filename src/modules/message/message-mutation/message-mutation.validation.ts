import { z } from "zod";

export const editMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});

export type EditMessageInput = z.infer<
  typeof editMessageSchema
>;