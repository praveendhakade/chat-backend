import { generateAccessToken, verifyAccessToken } from "../src/utils/jwt.util";


describe("JWT utilities", () => {
  it("should generate a valid access token", () => {
    const userId = "test-user-id";

    const token = generateAccessToken(userId);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should extract the correct user ID", () => {
    const userId = "test-user-id";

    const token = generateAccessToken(userId);
    const decodedUserId = verifyAccessToken(token);

    expect(decodedUserId).toBe(userId);
  });

  it("should reject an invalid token", () => {
    expect(() => {
      verifyAccessToken("invalid-token");
    }).toThrow();
  });
});