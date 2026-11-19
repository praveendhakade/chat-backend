
import { generateDirectChatKey } from "../src/utils/chat.utils";

describe("generateDirectChatKey", () => {
  it("should generate the same key regardless of user order", () => {
    const key1 = generateDirectChatKey("userA", "userB");
    const key2 = generateDirectChatKey("userB", "userA");

    expect(key1).toBe(key2);
  });

  it("should generate a sorted key", () => {
    const key = generateDirectChatKey("userB", "userA");

    expect(key).toBe("userA_userB");
  });

  it("should reject a chat with the same user", () => {
    expect(() =>
      generateDirectChatKey("userA", "userA")
    ).toThrow("Users cannot create a chat with themselves");
  });
});
