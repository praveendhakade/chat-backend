import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import { firestore } from "../../config/firebase.js";
import { AppError } from "../../utils/app-error.util.js";
import { assertChatMember } from "../chat/chat.access.js";

const getChatRef = (chatId: string) =>
  firestore.collection("chats").doc(chatId);

const getMessageRef = (
  chatId: string,
  messageId: string
) =>
  getChatRef(chatId)
    .collection("messages")
    .doc(messageId);

const getReadReceiptRef = (
  chatId: string,
  messageId: string,
  userId: string
) =>
  getChatRef(chatId)
    .collection("readReceipts")
    .doc(`${messageId}_${userId}`);

const getUserStateRef = (
  chatId: string,
  userId: string
) =>
  getChatRef(chatId)
    .collection("userStates")
    .doc(userId);

export const markMessageAsRead = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  await assertChatMember(chatId, userId);

  const messageRef = getMessageRef(chatId, messageId);
  const receiptRef = getReadReceiptRef(
    chatId,
    messageId,
    userId
  );

  await firestore.runTransaction(async (transaction) => {
    const messageSnapshot = await transaction.get(messageRef);

    if (!messageSnapshot.exists) {
      throw new AppError(404, "Message not found");
    }

    const receiptSnapshot = await transaction.get(receiptRef);

    if (receiptSnapshot.exists) {
      return;
    }

    transaction.create(receiptRef, {
      messageId,
      userId,
      readAt: FieldValue.serverTimestamp(),
    });
  });

  const receiptSnapshot = await receiptRef.get();
  const receipt = receiptSnapshot.data();

  if (!receipt) {
    throw new AppError(500, "Unable to retrieve read receipt");
  }

  return {
    messageId: receipt.messageId as string,
    userId: receipt.userId as string,
    readAt: (receipt.readAt as Timestamp).toDate().toISOString(),
  };
};

export const updateLastSeen = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  await assertChatMember(chatId, userId);

  const messageRef = getMessageRef(chatId, messageId);
  const stateRef = getUserStateRef(chatId, userId);

  await firestore.runTransaction(async (transaction) => {
    const messageSnapshot = await transaction.get(messageRef);

    if (!messageSnapshot.exists) {
      throw new AppError(404, "Message not found");
    }

    const targetMessage = messageSnapshot.data();

    if (
      !targetMessage ||
      !(targetMessage.createdAt instanceof Timestamp)
    ) {
      throw new AppError(400, "Message has an invalid timestamp");
    }

    const stateSnapshot = await transaction.get(stateRef);
    const currentState = stateSnapshot.data();

    if (currentState?.lastSeenMessageId) {
      const previousMessageRef = getMessageRef(
        chatId,
        currentState.lastSeenMessageId as string
      );

      const previousMessageSnapshot =
        await transaction.get(previousMessageRef);

      if (previousMessageSnapshot.exists) {
        const previousMessage = previousMessageSnapshot.data();

        if (
          previousMessage?.createdAt instanceof Timestamp
        ) {
          const previousTime =
            previousMessage.createdAt.toMillis();

          const targetTime =
            targetMessage.createdAt.toMillis();

          const movesBackwards =
            targetTime < previousTime ||
            (
              targetTime === previousTime &&
              messageId <=
                (currentState.lastSeenMessageId as string)
            );

          if (movesBackwards) {
            throw new AppError(
              400,
              "Last seen cannot move backwards"
            );
          }
        }
      }
    }

    transaction.set(
      stateRef,
      {
        lastSeenMessageId: messageId,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  const stateSnapshot = await stateRef.get();
  const state = stateSnapshot.data();

  if (!state) {
    throw new AppError(500, "Unable to retrieve last-seen state");
  }

  return {
    userId,
    lastSeenMessageId: state.lastSeenMessageId as string,
    lastSeenAt: (state.lastSeenAt as Timestamp).toDate().toISOString(),
  };
};