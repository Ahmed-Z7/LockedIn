import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  users, userProfiles, userBadges, userChallenges, challenges,
  friends, communityPosts, userActivities, studySchedules, flashCardDecks, flashCards
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import { scryptSync, randomBytes } from "crypto";

dotenv.config();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashed}`;
}

// Demo account credentials
const DEMO_EMAIL = "demo@lockedin.eg";
const DEMO_PASSWORD = "Demo@123456";
const DEMO_USERNAME = "ahmed_lockedin";
const DEMO_NAME = "Ahmed LockedIn";

async function seedDemoAccount() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  const sqlConnection = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlConnection);

  console.log("\n🚀 Seeding realistic demo account...\n");

  // ─── 1. Delete old demo account if exists ────────────────────────────────
  const [existing] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
  if (existing) {
    console.log("⚠️  Demo account exists — skipping creation (already seeded).");
    console.log(`\n✅ DEMO ACCOUNT CREDENTIALS:`);
    console.log(`   📧 Email:    ${DEMO_EMAIL}`);
    console.log(`   🔑 Password: ${DEMO_PASSWORD}`);
    console.log(`   👤 Username: ${DEMO_USERNAME}`);
    process.exit(0);
  }

  // ─── 2. Create demo user ──────────────────────────────────────────────────
  const [demoUser] = await db.insert(users).values({
    name: DEMO_NAME,
    username: DEMO_USERNAME,
    email: DEMO_EMAIL,
    openId: randomUUID(),
    password: hashPassword(DEMO_PASSWORD),
    loginMethod: "email",
    role: "user",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  }).returning();

  console.log(`✅ User created: ${demoUser.name} (ID: ${demoUser.id})`);

  // ─── 3. Create realistic profile ─────────────────────────────────────────
  const XP = 14500; // Level ~14-15 range (1000 XP per level)
  const LEVEL = Math.floor(XP / 1000) + 1;

  await db.insert(userProfiles).values({
    userId: demoUser.id,
    xp: XP,
    level: LEVEL,
    streak: 47,
    streakLongest: 62,
    totalStudyTime: 9200, // ~153 hours
    bio: "Computer Science student | Pomodoro devotee | Building the Pomodoro habit for 6 months straight. ZED keeps me honest. 🔒",
    status: "Deep in data structures. Send help (or flashcards).",
    rank: "Neural Architect",
    lastStudyDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log(`✅ Profile created: Level ${LEVEL}, XP ${XP}, Streak 47`);

  // ─── 4. Add badges ────────────────────────────────────────────────────────
  const badges = [
    { badgeName: "First Lock-In", badgeIcon: "🔒", rarity: "common" as const, description: "Completed your first study session." },
    { badgeName: "Streak Starter", badgeIcon: "🔥", rarity: "common" as const, description: "Maintained a 7-day streak." },
    { badgeName: "Focus Elite", badgeIcon: "⚡", rarity: "rare" as const, description: "Completed 50 sessions with zero distractions." },
    { badgeName: "Neural Architect", badgeIcon: "🧠", rarity: "epic" as const, description: "Reached Level 10 on the platform." },
    { badgeName: "Pomodoro Master", badgeIcon: "🍅", rarity: "rare" as const, description: "Completed 100 Pomodoro sessions." },
    { badgeName: "Community Pillar", badgeIcon: "🌟", rarity: "rare" as const, description: "Received 200 likes on community posts." },
    { badgeName: "60-Day Streak", badgeIcon: "🏆", rarity: "legendary" as const, description: "Maintained a 60-day consecutive study streak." },
    { badgeName: "ZED Disciple", badgeIcon: "🤖", rarity: "epic" as const, description: "Used ZED AI Coach for 30+ days." },
  ];

  for (const badge of badges) {
    await db.insert(userBadges).values({
      userId: demoUser.id,
      ...badge,
      earnedAt: new Date(Date.now() - Math.floor(Math.random() * 150) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  console.log(`✅ Badges: ${badges.length} badges awarded`);

  // ─── 5. Progress on challenges ────────────────────────────────────────────
  const allChallenges = await db.select().from(challenges);
  if (allChallenges.length > 0) {
    for (let i = 0; i < allChallenges.length; i++) {
      const ch = allChallenges[i];
      const isCompleted = i < Math.floor(allChallenges.length * 0.75); // 75% completed
      const progress = isCompleted ? ch.targetValue : Math.floor(Math.random() * ch.targetValue * 0.7);

      await db.insert(userChallenges).values({
        userId: demoUser.id,
        challengeId: ch.id,
        currentProgress: progress,
        completed: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date(Date.now() - Math.floor(Math.random() * 120) * 24 * 60 * 60 * 1000).toISOString() : null,
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ Challenges: ${Math.floor(allChallenges.length * 0.75)}/${allChallenges.length} completed`);
  } else {
    console.log("ℹ️  No challenges found in DB — skipping challenge progress.");
  }

  // ─── 6. Add activity history ──────────────────────────────────────────────
  const activities = [
    { type: "xp_gain", description: "Completed Data Structures session with 0 distractions (+80 XP)", xpGain: 80 },
    { type: "xp_gain", description: "Reached Level 14 — Neural Architect unlocked (+500 XP bonus)", xpGain: 500 },
    { type: "badge", description: "Earned badge: 60-Day Streak 🏆", xpGain: 0 },
    { type: "session", description: "Completed 2-hour Algorithms deep dive session", xpGain: 120 },
    { type: "xp_gain", description: "ZED AI Coach session: Algorithm optimization (+50 XP)", xpGain: 50 },
    { type: "session", description: "Reviewed Operating Systems notes — Feynman Method", xpGain: 60 },
    { type: "badge", description: "Earned badge: Pomodoro Master 🍅", xpGain: 0 },
    { type: "session", description: "Completed 52/17 session: Computer Networks", xpGain: 90 },
    { type: "xp_gain", description: "Community post received 50 likes (+100 XP)", xpGain: 100 },
  ];

  for (const act of activities) {
    await db.insert(userActivities).values({
      userId: demoUser.id,
      ...act,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  console.log(`✅ Activities: ${activities.length} activity entries`);

  // ─── 7. Study schedule (recent sessions) ─────────────────────────────────
  const subjects = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Systems", "Software Engineering"];
  for (let i = 0; i < 12; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    await db.insert(studySchedules).values({
      userId: demoUser.id,
      subject: subjects[i % subjects.length],
      scheduledTime: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      duration: [45, 52, 60, 90, 120][Math.floor(Math.random() * 5)],
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
      difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as any,
      sessionType: "study",
      completed: i < 9 ? 1 : 0, // 9 out of 12 completed
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  console.log(`✅ Schedule: 12 sessions (9 completed)`);

  // ─── 8. Flash card deck ───────────────────────────────────────────────────
  const [deck] = await db.insert(flashCardDecks).values({
    userId: demoUser.id,
    title: "Data Structures Mastery",
    description: "Core DS concepts for exam prep",
    category: "Computer Science",
    cardCount: 4,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }).returning();

  const flashCardData = [
    { question: "What is the time complexity of quicksort in the average case?", answer: "O(n log n)" },
    { question: "What data structure uses LIFO (Last In, First Out)?", answer: "Stack" },
    { question: "What is a Binary Search Tree property?", answer: "Left subtree < root < right subtree" },
    { question: "What is the difference between BFS and DFS?", answer: "BFS uses a queue and explores level by level; DFS uses a stack and goes deep first." },
  ];

  for (const card of flashCardData) {
    await db.insert(flashCards).values({ deckId: deck.id, ...card });
  }
  console.log(`✅ Flash cards: 1 deck, ${flashCardData.length} cards`);

  // ─── 9. Community posts ───────────────────────────────────────────────────
  const posts = [
    { title: "How I reached a 60-day streak 🔥", content: "For everyone struggling with consistency — I was exactly where you are 2 months ago. Here's what worked for me:\n\n1. Lock in EVERY day, even for 25 min. Consistency > volume.\n2. Use ZED AI to plan not just study — let it adjust when life hits.\n3. Treat your streak like a game, not a chore.\n\nToday I hit 60 days. If I can do it, you can too. 💪", category: "motivation", likes: 87 },
    { title: "Best algorithm resources for CS students", content: "After 6 months of grinding algorithms on this platform, here's my curated list:\n\n- Abdul Bari on YouTube (free, amazing)\n- Elements of Programming Interviews (book)\n- LeetCode Top 150 for patterns\n- ZED AI for concept clarification\n\nFocus on patterns, not memorization.", category: "resources", likes: 64 },
    { title: "Why Feynman Technique changed my exam results", content: "I failed my OS midterm badly. Then I started using the Feynman session type on LOCKEDIN and my grade jumped from 58% to 87% in the final.\n\nThe key: after every topic, explain it like you're teaching a 10-year-old. ZED grades your clarity. It's painful but it works.", category: "study_tips", likes: 112 },
  ];

  for (const post of posts) {
    await db.insert(communityPosts).values({
      userId: demoUser.id,
      ...post,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log(`✅ Community: ${posts.length} posts created`);

  // ─── 10. Add friendships with existing test users ─────────────────────────
  const testUsernames = ["mahmoud_emad", "ahmed_zidan", "yasmine_yasser", "ali_hassan", "sara_kamel", "omar_sherif", "nourhan_adel", "khaled_gamal", "mona_zakaria", "tarek_sameh"];
  let friendCount = 0;

  for (const uname of testUsernames) {
    const [friend] = await db.select().from(users).where(eq(users.username, uname));
    if (friend) {
      // Check if friendship exists
      const existing = await db.select().from(friends).where(
        and(eq(friends.userId, demoUser.id), eq(friends.friendId, friend.id))
      );
      if (existing.length === 0) {
        await db.insert(friends).values({
          userId: demoUser.id,
          friendId: friend.id,
          status: "accepted",
          isFavorite: friendCount < 3 ? 1 : 0, // first 3 are favorites
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 150) * 24 * 60 * 60 * 1000).toISOString(),
        });
        await db.insert(friends).values({
          userId: friend.id,
          friendId: demoUser.id,
          status: "accepted",
          isFavorite: 0,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 150) * 24 * 60 * 60 * 1000).toISOString(),
        });
        friendCount++;
      }
    }
  }
  console.log(`✅ Friends: ${friendCount} accepted friendships`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log("✅  DEMO ACCOUNT SEEDED SUCCESSFULLY");
  console.log("═══════════════════════════════════════════");
  console.log(`📧  Email:    ${DEMO_EMAIL}`);
  console.log(`🔑  Password: ${DEMO_PASSWORD}`);
  console.log(`👤  Username: ${DEMO_USERNAME}`);
  console.log(`🏆  Level:    ${LEVEL} (${XP} XP)`);
  console.log(`🔥  Streak:   47 days`);
  console.log(`👫  Friends:  ${friendCount}`);
  console.log(`🎯  Badges:   ${badges.length}`);
  console.log("═══════════════════════════════════════════\n");

  process.exit(0);
}

seedDemoAccount().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
