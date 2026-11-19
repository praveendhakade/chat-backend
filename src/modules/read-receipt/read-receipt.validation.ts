import { z } from "zod";

export const lastSeenSchema = z.object({
  messageId: z.string().min(1).max(1500).refine((id) => !id.includes("/"), "Invalid message ID"),
});

export type LastSeenInput = z.infer<typeof lastSeenSchema>;