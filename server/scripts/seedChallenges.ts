import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { challenges } from "../../drizzle/schema";

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env");
    process.exit(1);
}

const db = drizzle(process.env.DATABASE_URL);

// Valid categories from schema: study_time | streak | focus | group | ai_usage | consistency
const challengeData = [
    // ───── STUDY TIME ─────
    { title: "Study Starter", description: "Study for a total of 1 hour.", category: "study_time", targetValue: 60, difficulty: "easy", rewardXp: 100 },
    { title: "Dedicated Learner", description: "Study for a total of 10 hours.", category: "study_time", targetValue: 600, difficulty: "medium", rewardXp: 500 },
    { title: "Academic Weapon", description: "Study for a total of 50 hours.", category: "study_time", targetValue: 3000, difficulty: "hard", rewardXp: 1500 },
    { title: "Knowledge Sponge", description: "Study for a total of 100 hours.", category: "study_time", targetValue: 6000, difficulty: "hard", rewardXp: 3000 },
    { title: "Study Machine", description: "Study for a total of 250 hours.", category: "study_time", targetValue: 15000, difficulty: "hard", rewardXp: 5000, rewardBadgeName: "Study Monk" },
    { title: "50 Sessions Grind", description: "Complete 50 study sessions.", category: "study_time", targetValue: 50, difficulty: "hard", rewardXp: 1000, rewardBadgeName: "Knowledge Sponge" },

    // ───── STREAKS ─────
    { title: "Consistent King", description: "Maintain a 30-day study streak.", category: "streak", targetValue: 30, difficulty: "hard", rewardXp: 2000, rewardBadgeName: "Consistency King" },
    { title: "Unstoppable", description: "Maintain a 60-day study streak.", category: "streak", targetValue: 60, difficulty: "hard", rewardXp: 5000, rewardBadgeName: "Habit Former" },

    // ───── FOCUS ─────
    { title: "Deep Work Master", description: "Complete 25 sessions in Focus Lock mode.", category: "focus", targetValue: 25, difficulty: "hard", rewardXp: 1000, rewardBadgeName: "Focus Legend" },
    { title: "Laser Vision", description: "Complete 10 sessions with 0 distractions.", category: "focus", targetValue: 10, difficulty: "hard", rewardXp: 800, rewardBadgeName: "Neural Link" },

    // ───── CONSISTENCY ─────
    { title: "Productivity God", description: "Complete all scheduled sessions in a week.", category: "consistency", targetValue: 7, difficulty: "medium", rewardXp: 1000, rewardBadgeName: "Plan Follower" },
    { title: "Deck Master", description: "Create 20 different flashcard decks.", category: "consistency", targetValue: 20, difficulty: "hard", rewardXp: 800, rewardBadgeName: "Deck Master" },

    // ───── AI USAGE ─────
    { title: "Digital Mentor", description: "Ask the AI Coach 100 questions.", category: "ai_usage", targetValue: 100, difficulty: "hard", rewardXp: 1000, rewardBadgeName: "AI Collaborator" },
    { title: "Quiz Legend", description: "Complete 50 AI-generated quizzes.", category: "ai_usage", targetValue: 50, difficulty: "hard", rewardXp: 1500, rewardBadgeName: "Neural Link" },

    // ───── GROUP STUDY ─────
    { title: "Group Legend", description: "Complete 20 group study sessions.", category: "group", targetValue: 20, difficulty: "hard", rewardXp: 1200, rewardBadgeName: "Social Learner" },
    { title: "Community Leader", description: "Make 25 community posts.", category: "group", targetValue: 25, difficulty: "hard", rewardXp: 600, rewardBadgeName: "The Helper" },
];


export async function seed() {
    console.log(`🌱 Seeding ${challengeData.length} challenges...`);
    let count = 0;
    for (const challenge of challengeData) {
        await db.insert(challenges).values(challenge as any).onDuplicateKeyUpdate({
            set: { description: (challenge as any).description }
        });
        count++;
    }
    console.log(`✅ Done! Seeded ${count} challenges.`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seedChallenges.ts')) {
    seed().catch(err => {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    });
}
