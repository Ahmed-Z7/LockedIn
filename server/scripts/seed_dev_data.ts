import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { notifications, users, userProfiles } from "../../drizzle/schema";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found");
    return;
  }

  const sqlConnection = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlConnection);
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
    password: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  }).onConflictDoUpdate({ target: users.id, set: { name: "Dev User" } });

  // 2. Ensure other users exist for "From" field
  const otherUsers = [
    { id: 2, openId: "id-mahmoud", name: "Mahmoud", email: "m@ex.com", username: "mahmoud", loginMethod: "mock", role: "user", password: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString() },
    { id: 3, openId: "id-ahmed", name: "Ahmed", email: "a@ex.com", username: "ahmed", loginMethod: "mock", role: "user", password: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString() },
    { id: 4, openId: "id-sara", name: "Sara", email: "s@ex.com", username: "sara", loginMethod: "mock", role: "user", password: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString() },
  ];
  
  for (const u of otherUsers) {
    await db.insert(users).values(u as any).onConflictDoUpdate({ target: users.id, set: { name: u.name } });
  }

  // 4. Add mock notifications
  const mockNotifs = [
    { userId: 1, fromUserId: 2, type: "like" as const, read: 0, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { userId: 1, fromUserId: 3, type: "comment" as const, read: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { userId: 1, fromUserId: 4, type: "badge" as const, read: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { userId: 1, fromUserId: 2, type: "follow" as const, read: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { userId: 1, fromUserId: 3, type: "like" as const, read: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
  ];

  for (const notif of mockNotifs) {
    await db.insert(notifications).values(notif);
  }

  console.log("Seeding complete! Refresh your browser.");
  process.exit(0);
}

seed().catch(console.error);
