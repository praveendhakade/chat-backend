import { z } from "zod";

export const createChatSchema = z.object({
  userBId: z.string().uuid(),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;