
import request from "supertest";
import app from "../src/app.js";

describe("Health API", () => {
  it("should return 200 when server is running", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Chat backend is running"
    });

    expect(response.body.timestamp).toBeDefined();
  });
});
