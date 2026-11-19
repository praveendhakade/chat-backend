import { comparePassword, hashPassword } from "../src/utils/password.util";


describe("Password utilities", () => {
  it("should hash a password", async () => {
    const password = "Password@123";

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).not.toBe("");
  });

  it("should verify the correct password", async () => {
    const password = "Password@123";
    const hash = await hashPassword(password);

    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await hashPassword("Password@123");

    const result = await comparePassword("WrongPassword", hash);

    expect(result).toBe(false);
  });
});