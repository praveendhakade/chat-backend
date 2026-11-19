
export function generateDirectChatKey(
  userAId: string,
  userBId: string
): string {
  if (userAId === userBId) {
    throw new Error("Users cannot create a chat with themselves");
  }

  return [userAId, userBId]
    .sort()
    .join("_");
}
