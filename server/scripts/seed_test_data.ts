import { drizzle } from "drizzle-orm/mysql2";
import { users, userProfiles, studyGroups, studyGroupMembers, challenges, userChallenges } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function seedTestData() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    return;
  }
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log("Seeding test users and groups...");

  // 1. Users
  const testUsers = [
    { name: "Mahmoud Emad", username: "mahmoud_emad", email: "mahmoud@lockedin.com" },
    { name: "Ahmed Zidan", username: "ahmed_zidan", email: "ahmed@lockedin.com" },
    { name: "Yasmine Yasser", username: "yasmine_yasser", email: "yasmine@lockedin.com" },
    { name: "Ali Hassan", username: "ali_hassan", email: "ali@lockedin.com" },
    { name: "Sara Kamel", username: "sara_kamel", email: "sara@lockedin.com" },
    { name: "Omar Sherif", username: "omar_sherif", email: "omar@lockedin.com" },
    { name: "Nourhan Adel", username: "nourhan_adel", email: "nourhan@lockedin.com" },
    { name: "Khaled Gamal", username: "khaled_gamal", email: "khaled@lockedin.com" },
    { name: "Mona Zakaria", username: "mona_zakaria", email: "mona@lockedin.com" },
    { name: "Tarek Sameh", username: "tarek_sameh", email: "tarek@lockedin.com" },
  ];

  const userIds: number[] = [];

  for (const tu of testUsers) {
    let existing = await db.select().from(users).where(eq(users.username, tu.username));
    let userId;
    if (existing.length === 0) {
      const [{ insertId }] = await db.insert(users).values({
        name: tu.name,
        username: tu.username,
        email: tu.email,
        openId: "test_openid_" + Math.random().toString(36).substring(7),
      });
      userId = insertId;
      
      await db.insert(userProfiles).values({
        userId,
        // Start all on level 1, xp scattered so leaderboard looks good
        level: 1,
        xp: Math.floor(Math.random() * 800) + 100,
        streak: Math.floor(Math.random() * 15),
      });
    } else {
      userId = existing[0].id;
    }
    userIds.push(userId);
  }

  // 2. Groups
  const groupNames = ["Neural Architects", "Focus Elite Hive", "Midnight Coders Global"];
  for (let i = 0; i < groupNames.length; i++) {
    const creatorId = userIds[i]; // make first 3 creators
    let existing = await db.select().from(studyGroups).where(eq(studyGroups.name, groupNames[i]));
    
    if (existing.length === 0) {
      const [{ insertId: groupId }] = await db.insert(studyGroups).values({
        name: groupNames[i],
        description: "Official test group for " + groupNames[i],
        creatorId: creatorId,
        isPrivate: 0,
      });

      // Add a few members to each group
      const membersToADD = userIds.slice(i, i + 4);
      for (const mId of membersToADD) {
        await db.insert(studyGroupMembers).values({
          groupId,
          userId: mId,
          role: mId === creatorId ? "admin" : "member",
          status: "approved",
        });
      }
    }
  }

  console.log("✅ Seeded 10 Users and 3 Groups.");

  // Test the challenges query
  console.log("Running getChallenges test test inside DB...");
  try {
     const list = await db.select({
      id: challenges.id,
      title: challenges.title,
      description: challenges.description,
      category: challenges.category,
      targetValue: challenges.targetValue,
      currentProgress: userChallenges.currentProgress,
      completed: userChallenges.completed,
      difficulty: challenges.difficulty,
      rewardXp: challenges.rewardXp,
     })
     .from(challenges)
     .leftJoin(userChallenges, and(eq(userChallenges.challengeId, challenges.id), eq(userChallenges.userId, 1)));
     
     console.log(`✅ Fetched ${list.length} challenges successfully. First Challenge:`, list[0]?.title);
  } catch (err: any) {
     console.error("❌ SQL ERROR IN GET CHALLENGES:");
     console.error(err);
  }

  process.exit(0);
}

seedTestData().catch(console.error);
