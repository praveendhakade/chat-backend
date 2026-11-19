# Chat Backend

A Node.js and TypeScript chat API using PostgreSQL, Prisma, and Firebase.

## Run locally

You’ll need Node.js (LTS), npm, PostgreSQL, and a Firebase service account.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a PostgreSQL database named `chat_backend`, then copy `.env.example` to `.env` and fill in the values. Set `DATABASE_URL` to your local database, `JWT_SECRET` to a value of at least 32 characters, and provide your Firebase project ID and service-account file path.

   Keep the service-account JSON in `secrets/`; don’t commit it.

3. Generate the Prisma client and apply the existing migrations:

   ```sh
   npx prisma generate --config prisma7.config.ts
   npx prisma migrate dev --config prisma7.config.ts
   ```

   To load the optional development seed data:

   ```sh
   npx prisma db seed --config prisma7.config.ts
   ```

4. Start the server:

   ```sh
   npm run dev
   ```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/health` to confirm it’s responding.
