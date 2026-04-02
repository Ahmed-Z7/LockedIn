import { db } from "./db";
import { userProfiles, userChallenges, challenges, userActivities, userBadges } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export function getLevelTitle(level: number): string {
  if (level >= 20) return "Deep Work Master";
  if (level >= 10) return "Discipline Builder";
  if (level >= 5) return "Focused Beginner";
  return "Fresh Initiate";
}

export async function awardXP(userId: number, amount: number, reason: string) {
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
  if (!profile) return;

  let newXP = profile.xp + amount;
  let currentLevel = profile.level;
  
  // XP Required for level N = XP for Level N-1 + (N * 50)
  // 1->2: 100, 2->3: 250, 3->4: 450, 4->5: 700
  const getXPForLevel = (lv: number) => {
    let total = 0;
    for (let i = 2; i <= lv; i++) {
        total += i * 50;
    }
    return total;
  };

  let newLevel = currentLevel;
  while (newXP >= getXPForLevel(newLevel + 1)) {
    newLevel++;
    // Log level up activity
    await db.insert(userActivities).values({
      userId,
      type: "level_up",
      description: `Reached Level ${newLevel}: ${getLevelTitle(newLevel)}!`,
      xpGain: 0,
      createdAt: new Date().toISOString()
    });
  }

  await db.update(userProfiles)
    .set({ xp: newXP, level: newLevel, updatedAt: new Date().toISOString() })
    .where(eq(userProfiles.userId, userId));

  // Log activity
  await db.insert(userActivities).values({
    userId,
    type: "xp_gain",
    description: reason,
    xpGain: amount,
    createdAt: new Date().toISOString()
  });

  return { newXP, newLevel, leveledUp: newLevel > currentLevel };
}

export async function updateStreak(userId: number) {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (!profile) return;

    const now = new Date();
    const lastUpdate = profile.updatedAt ? new Date(profile.updatedAt) : null;
    
    if (!lastUpdate) {
        await db.update(userProfiles).set({ streak: 1, updatedAt: now.toISOString() }).where(eq(userProfiles.userId, userId));
        return 1;
    }

    const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // Increment streak
        const newStreak = (profile.streak || 0) + 1;
        await db.update(userProfiles).set({ streak: newStreak, updatedAt: now.toISOString() }).where(eq(userProfiles.userId, userId));
        
        // Award daily XP
        await awardXP(userId, 10, "Daily Streak Maintained!");

        // Milestone bonuses
        if (newStreak === 7) await awardXP(userId, 100, "7-Day Streak Milestone!");
        if (newStreak === 14) await awardXP(userId, 200, "14-Day Streak Milestone!");
        if (newStreak === 30) await awardXP(userId, 500, "30-Day Streak Milestone!");

        return newStreak;
    } else if (diffDays > 1) {
        // Reset streak
        await db.update(userProfiles).set({ streak: 1, updatedAt: now.toISOString() }).where(eq(userProfiles.userId, userId));
        return 1;
    }

    return profile.streak;
}

export async function updateChallengeProgress(userId: number, category: string, amount: number) {
  // 1. Sync challenges first (ensure user has records for all global challenges)
  const allChallenges = await db.select().from(challenges).where(eq(challenges.category, category as any));
  
  for (const c of allChallenges) {
    const [userChallenge] = await db.select().from(userChallenges)
        .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, c.id)));
    
    if (!userChallenge) {
        // Create initial record
        await db.insert(userChallenges).values({
            userId,
            challengeId: c.id,
            currentProgress: amount,
            completed: amount >= c.targetValue ? 1 : 0,
            completedAt: amount >= c.targetValue ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
        });
        if (amount >= c.targetValue) {
            await awardXP(userId, c.rewardXp, `Completed Challenge: ${c.title}`);
        }
    } else if (userChallenge.completed === 0) {
        const newProgress = userChallenge.currentProgress + amount;
        const isCompleted = newProgress >= c.targetValue ? 1 : 0;
        
        await db.update(userChallenges)
            .set({ 
                currentProgress: newProgress, 
                completed: isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
            })
            .where(eq(userChallenges.id, userChallenge.id));
        
        if (isCompleted) {
            await awardXP(userId, c.rewardXp, `Completed Challenge: ${c.title}`);
            if (c.rewardBadgeName) {
                await db.insert(userBadges).values({
                    userId,
                    badgeName: c.rewardBadgeName,
                    badgeIcon: "🏆", // Default icon
                    description: `Earned for completing: ${c.title}`
                });
            }
        }
    }
  }
}
