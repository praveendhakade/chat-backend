import {
  FieldPath,
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import { firestore } from "../../config/firebase.js";
import { AppError } from "../../utils/app-error.util.js";
import { assertChatMember } from "../chat/chat.access.js";

import type {
  MessageQueryInput,
  SendMessageInput,
} from "./message.validation.js";
import { prisma } from "../../config/database.js";

const getMessagesCollection = (chatId: string) =>
  firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages");

export const sendMessage = async (
  chatId: string,
  senderId: string,
  input: SendMessageInput
) => {
  await assertChatMember(chatId, senderId);

  const messageRef = getMessagesCollection(chatId).doc();

  const messageData = {
    senderId,
    text: input.text,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await messageRef.set(messageData);
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });


  const savedMessage = await messageRef.get();
  const data = savedMessage.data();

  if (!data) {
    throw new AppError(500, "Unable to retrieve saved message");
  }

  return {
    id: savedMessage.id,
    senderId: data.senderId as string,
    text: data.text as string,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  };
};

export const getChatMessages = async (
  chatId: string,
  userId: string,
  options: MessageQueryInput
) => {
  await assertChatMember(chatId, userId);

  const messagesCollection = getMessagesCollection(chatId);

  let query = messagesCollection
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc")
    .limit(options.limit + 1);

  if (options.cursor) {
    const cursorSnapshot = await messagesCollection
      .doc(options.cursor)
      .get();

    if (!cursorSnapshot.exists) {
      throw new AppError(400, "Invalid message cursor");
    }

    query = query.startAfter(cursorSnapshot);
  }

  const snapshot = await query.get();

  const hasMore = snapshot.docs.length > options.limit;
  const pageDocs = snapshot.docs.slice(0, options.limit);

  const messages = pageDocs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      senderId: data.senderId as string,
      text: data.text as string,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
    };
  });

  const lastDocument = pageDocs.at(-1);

  return {
    messages,
    pagination: {
      limit: options.limit,
      hasMore,
      nextCursor: lastDocument?.id ?? null,
    },
  };
};


export async function editMessage(
  chatId: string,
  messageId: string,
  userId: string,
  text: string
) {
  await assertChatMember(chatId, userId);

  const messageRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc(messageId);

  const messageDoc = await messageRef.get();

  if (!messageDoc.exists) {
    throw new AppError(404, "Message not found");
  }

  const message = messageDoc.data();

  if (!message) {
    throw new AppError(404, "Message not found");
  }

  if (message.senderId !== userId) {
    throw new AppError(
      403,
      "You can only edit your own messages"
    );
  }

  await messageRef.update({
    text,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updatedDoc = await messageRef.get();
  const updatedMessage = updatedDoc.data();

  return {
    id: updatedDoc.id,
    ...updatedMessage,
    createdAt: updatedMessage?.createdAt?.toDate().toISOString(),
    updatedAt: updatedMessage?.updatedAt?.toDate().toISOString(),
  };
}

export async function deleteMessage(
  chatId: string,
  messageId: string,
  userId: string
) {
  await assertChatMember(chatId, userId);

  const messageRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc(messageId);

  const messageDoc = await messageRef.get();

  if (!messageDoc.exists) {
    throw new AppError(404, "Message not found");
  }

  const message = messageDoc.data();

  if (!message) {
    throw new AppError(404, "Message not found");
  }

  if (message.senderId !== userId) {
    throw new AppError(
      403,
      "You can only delete your own messages"
    );
  }

  await messageRef.delete();

  return {
    message: "Message deleted successfully",
    messageId,
  };
}