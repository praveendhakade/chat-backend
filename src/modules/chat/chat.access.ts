import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.util.js";

export const assertChatMember = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new AppError(403, "You are not a member of this chat");
  }
};