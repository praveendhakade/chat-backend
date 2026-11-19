import { prisma } from "../../config/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../utils/app-error.util.js";
import { generateDirectChatKey } from "../../utils/chat.utils.js";
import type { CreateChatInput } from "./chat.validation.js";
import type { CreateGroupChatInput } from "./groupChat/group-chat.validation.js";

const chatResponseInclude = {
  members: {
    select: {
      userId: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.ChatInclude;

export const createOrGetDirectChat = async (
  currentUserId: string,
  input: CreateChatInput,
) => {
  const otherUserId = input.userBId;

  if (currentUserId === otherUserId) {
    throw new AppError(400, "You cannot create a chat with yourself");
  }

  const directKey = generateDirectChatKey(currentUserId, otherUserId);

  // Check whether the other user exists.
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true },
  });

  if (!otherUser) {
    throw new AppError(404, "User not found");
  }

  // Return an existing direct chat if one already exists.
  const existingChat = await prisma.chat.findUnique({
    where: { directKey },
    include: chatResponseInclude,
  });

  if (existingChat) {
    return {
      chat: existingChat,
      created: false,
    };
  }

  try {
    // Create the chat and both memberships atomically.
    const chat = await prisma.chat.create({
      data: {
        type: "DIRECT",
        directKey,
        members: {
          create: [{ userId: currentUserId }, { userId: otherUserId }],
        },
      },
      include: chatResponseInclude,
    });

    return {
      chat,
      created: true,
    };
  } catch (error: unknown) {
    // Another request may have created the same direct chat
    // after our initial lookup.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const chat = await prisma.chat.findUnique({
        where: { directKey },
        include: chatResponseInclude,
      });

      if (chat) {
        return {
          chat,
          created: false,
        };
      }
    }

    throw error;
  }
};

export const getUserChats = async (userId: string) => {
  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: chatResponseInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });

  return chats;
};

const groupChatInclude = {
  members: {
    select: {
      userId: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
};

export const createGroupChat = async (
  creatorId: string,
  input: CreateGroupChatInput,
) => {
  if (input.memberIds.includes(creatorId)) {
    throw new AppError(
      400,
      "Do not include yourself in memberIds; you are added automatically",
    );
  }

  const allMemberIds = [creatorId, ...input.memberIds];

  const existingUsers = await prisma.user.findMany({
    where: {
      id: {
        in: allMemberIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUsers.length !== allMemberIds.length) {
    throw new AppError(404, "One or more participants do not exist");
  }

  const groupChat = await prisma.chat.create({
    data: {
      type: "GROUP",
      name: input.name,
      members: {
        create: allMemberIds.map((userId) => ({
          userId,
        })),
      },
    },
    include: groupChatInclude,
  });

  return groupChat;
};
