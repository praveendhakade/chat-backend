import { z } from "zod";

export const createGroupChatSchema = z.object({
  name: z.string().trim().min(2).max(100),

  memberIds: z
    .array(z.uuid())
    .min(1, "At least one other participant is required")
    .max(99, "A group can have at most 100 members")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate participant IDs are not allowed"
    ),
});

export type CreateGroupChatInput = z.infer<
  typeof createGroupChatSchema
>;