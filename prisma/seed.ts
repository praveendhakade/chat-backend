
import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({
  adapter
});

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(
    "Password@123",
    12
  );

  const users = [
    {
      name: "Praveen",
      email: "praveen@example.com"
    },
    {
      name: "Rahul",
      email: "rahul@example.com"
    },
    {
      name: "Amit",
      email: "amit@example.com"
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email
      },
      update: {
        name: user.name
      },
      create: {
        ...user,
        passwordHash
      }
    });
  }

  console.log("Database seeded successfully");
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
