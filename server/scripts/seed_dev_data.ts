import { drizzle } from "drizzle-orm/mysql2";
import { notifications, users, userProfiles } from "../../drizzle/schema";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found");
    return;
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("Seeding dev user and notifications...");

  // 1. Ensure Dev User exists
  await db.insert(users).values({
    id: 1,
    openId: "mock-user-id",
    name: "Dev User",
    email: "dev@example.com",
    username: "devuser",
    loginMethod: "mock",
    role: "user",
  }).onDuplicateKeyUpdate({ set: { name: "Dev User" } });

  // 2. Ensure other users exist for "From" field
  await db.insert(users).values([
    { id: 2, openId: "id-mahmoud", name: "Mahmoud", email: "m@ex.com", username: "mahmoud", loginMethod: "mock", role: "user" },
    { id: 3, openId: "id-ahmed", name: "Ahmed", email: "a@ex.com", username: "ahmed", loginMethod: "mock", role: "user" },
    { id: 4, openId: "id-sara", name: "Sara", email: "s@ex.com", username: "sara", loginMethod: "mock", role: "user" },
  ]).onDuplicateKeyUpdate({ set: { id: 2 } });

  // 3. Clear old notifications for Dev User to avoid clutter
  // await db.delete(notifications).where(eq(notifications.userId, 1));

  // 4. Add mock notifications
  const mockNotifs = [
    {
      userId: 1,
      fromUserId: 2,
      type: "like",
      read: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    },
    {
      userId: 1,
      fromUserId: 3,
      type: "comment",
      read: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      userId: 1,
      fromUserId: 4,
      type: "achievement",
      read: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      userId: 1,
      fromUserId: 2,
      type: "social",
      read: 1, // Read (should be at bottom)
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
     {
      userId: 1,
      fromUserId: 3,
      type: "like",
      read: 1, // Read
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
    },
  ];

  for (const notif of mockNotifs) {
    await db.insert(notifications).values(notif);
  }

  console.log("Seeding complete! Refresh your browser.");
  process.exit(0);
}

seed().catch(console.error);
