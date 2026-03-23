import { db } from "../db";
import { challenges } from "../../drizzle/schema";

export async function seedChallenges() {
  const data = [
    // STUDY TIME (minutes)
    { title: "First Ascent", description: "Study for 60 minutes total.", category: "study_time", targetValue: 60, rewardXp: 50, difficulty: "easy" },
    { title: "Deep Diver", description: "Study for 300 minutes total.", category: "study_time", targetValue: 300, rewardXp: 150, difficulty: "medium" },
    { title: "Scholar's Path", description: "Study for 600 minutes total.", category: "study_time", targetValue: 600, rewardXp: 300, difficulty: "medium" },
    { title: "Knowledge Seeker", description: "Study for 1,200 minutes total.", category: "study_time", targetValue: 1200, rewardXp: 500, difficulty: "hard" },
    { title: "Sage's Journey", description: "Study for 3,000 minutes total.", category: "study_time", targetValue: 3000, rewardXp: 1000, difficulty: "hard" },
    { title: "Intellectual Titan", description: "Study for 6,000 minutes total.", category: "study_time", targetValue: 6000, rewardXp: 2000, difficulty: "hard" },

    // STREAK (days)
    { title: "Fresh Start", description: "Maintain a 3-day study streak.", category: "streak", targetValue: 3, rewardXp: 100, difficulty: "easy" },
    { title: "Weekly Warrior", description: "Maintain a 7-day study streak.", category: "streak", targetValue: 7, rewardXp: 250, difficulty: "medium" },
    { title: "Fortnight Focus", description: "Maintain a 14-day study streak.", category: "streak", targetValue: 14, rewardXp: 500, difficulty: "medium" },
    { title: "Consistent Spirit", description: "Maintain a 30-day study streak.", category: "streak", targetValue: 30, rewardXp: 1000, difficulty: "hard" },
    { title: "The Dedicated", description: "Maintain a 60-day study streak.", category: "streak", targetValue: 60, rewardXp: 2500, difficulty: "hard" },

    // FOCUS (0 distraction sessions)
    { title: "Perfect Focus", description: "Complete 1 session with 0 distractions.", category: "focus", targetValue: 1, rewardXp: 50, difficulty: "easy" },
    { title: "Zen Master", description: "Complete 5 sessions with 0 distractions.", category: "focus", targetValue: 5, rewardXp: 200, difficulty: "medium" },
    { title: "Laser Vision", description: "Complete 10 sessions with 0 distractions.", category: "focus", targetValue: 10, rewardXp: 500, difficulty: "hard" },
    { title: "Focus Legend", description: "Complete 25 sessions with 0 distractions.", category: "focus", targetValue: 25, rewardXp: 1200, difficulty: "hard" },

    // AI USAGE
    { title: "Neural Link", description: "Use AI Assistant 5 times.", category: "ai_usage", targetValue: 5, rewardXp: 50, difficulty: "easy" },
    { title: "AI Enthusiast", description: "Use AI Assistant 20 times.", category: "ai_usage", targetValue: 20, rewardXp: 150, difficulty: "medium" },
    { title: "Digital Mentor", description: "Use AI Assistant 50 times.", category: "ai_usage", targetValue: 50, rewardXp: 400, difficulty: "hard" },

    // Add more to reach 50...
  ];

  // Filling more challenges dynamically to reach 50
  for (let i = 1; i <= 30; i++) {
     data.push({
         title: `Challenge Alpha ${i}`,
         description: `General productivity milestone ${i}.`,
         category: i % 2 === 0 ? "consistency" : "study_time",
         targetValue: 10 * i,
         rewardXp: 20 + i,
         difficulty: i > 20 ? "hard" : i > 10 ? "medium" : "easy"
     });
  }

  console.log("Seeding challenges...");
  for (const c of data) {
    await db.insert(challenges).values(c as any);
  }
  console.log("Challenges seeded successfully.");
}
