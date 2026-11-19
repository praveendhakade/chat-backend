
import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";


import "./config/firebase.js";

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    const server = app.listen(env.PORT, () => {
      console.log(
        `Server running at http://localhost:${env.PORT}`
      );
    });

    const shutdown = async (): Promise<void> => {
      console.log("Shutting down server...");

      server.close(async () => {
        await prisma.$disconnect();
        console.log("Database disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Application startup failed:", error);

    await prisma.$disconnect();
    process.exit(1);
  }
}

void startServer();
