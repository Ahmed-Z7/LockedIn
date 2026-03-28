import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { challenges } from "../../drizzle/schema";
import * as dotenv from "dotenv";

dotenv.config();

const ALL_CHALLENGES = [
  // ── Study Time (10) ─────────────────────────────────────────────────────────
  { title: "First Hour", description: "Log 60 minutes of total study time.", category: "study_time" as const, targetValue: 60, rewardXp: 100, rewardBadgeName: "First Hour", difficulty: "easy" as const },
  { title: "Half Day Grind", description: "Log 3 hours of total study time.", category: "study_time" as const, targetValue: 180, rewardXp: 200, rewardBadgeName: "Grinder", difficulty: "easy" as const },
  { title: "Full Day Scholar", description: "Log 8 hours of total study time.", category: "study_time" as const, targetValue: 480, rewardXp: 400, rewardBadgeName: "Scholar", difficulty: "medium" as const },
  { title: "Marathon Learner", description: "Log 20 hours of total study time.", category: "study_time" as const, targetValue: 1200, rewardXp: 700, rewardBadgeName: "Marathon", difficulty: "medium" as const },
  { title: "Dedicated Student", description: "Log 50 hours of total study time.", category: "study_time" as const, targetValue: 3000, rewardXp: 1000, rewardBadgeName: "Dedicated", difficulty: "medium" as const },
  { title: "Century Club", description: "Log 100 hours of total study time.", category: "study_time" as const, targetValue: 6000, rewardXp: 1500, rewardBadgeName: "Century", difficulty: "hard" as const },
  { title: "Double Century", description: "Log 200 hours of total study time.", category: "study_time" as const, targetValue: 12000, rewardXp: 2500, rewardBadgeName: "Double Century", difficulty: "hard" as const },
  { title: "Hyper Focus", description: "Log 300 hours of total study time.", category: "study_time" as const, targetValue: 18000, rewardXp: 3500, rewardBadgeName: "Hyper Focus", difficulty: "hard" as const },
  { title: "Master Learner", description: "Log 400 hours of total study time.", category: "study_time" as const, targetValue: 24000, rewardXp: 4500, rewardBadgeName: "Master Learner", difficulty: "hard" as const },
  { title: "Neural Titan", description: "Log 500 hours of total study time.", category: "study_time" as const, targetValue: 30000, rewardXp: 5000, rewardBadgeName: "Titan", difficulty: "hard" as const },

  // ── Streak (11) ─────────────────────────────────────────────────────────────
  { title: "3-Day Fire", description: "Maintain a 3-day study streak.", category: "streak" as const, targetValue: 3, rewardXp: 150, rewardBadgeName: "Fire Starter", difficulty: "easy" as const },
  { title: "One Week Warrior", description: "Maintain a 7-day study streak.", category: "streak" as const, targetValue: 7, rewardXp: 300, rewardBadgeName: "Weekly Warrior", difficulty: "easy" as const },
  { title: "Two Week Champion", description: "Maintain a 14-day study streak.", category: "streak" as const, targetValue: 14, rewardXp: 600, rewardBadgeName: "Champion", difficulty: "medium" as const },
  { title: "21-Day Habit", description: "Maintain a 21-day study streak.", category: "streak" as const, targetValue: 21, rewardXp: 900, rewardBadgeName: "Habit Forged", difficulty: "medium" as const },
  { title: "Month Lock", description: "Maintain a 30-day study streak.", category: "streak" as const, targetValue: 30, rewardXp: 1500, rewardBadgeName: "Month Lock", difficulty: "hard" as const },
  { title: "Persistent Fire", description: "Maintain a 45-day study streak.", category: "streak" as const, targetValue: 45, rewardXp: 2000, rewardBadgeName: "Persistent", difficulty: "hard" as const },
  { title: "Legendary Streak", description: "Maintain a 60-day study streak.", category: "streak" as const, targetValue: 60, rewardXp: 3000, rewardBadgeName: "Legendary", difficulty: "hard" as const },
  { title: "Quarter Year Focus", description: "Maintain a 90-day study streak.", category: "streak" as const, targetValue: 90, rewardXp: 4000, rewardBadgeName: "Quarter Year", difficulty: "hard" as const },
  { title: "Unstoppable", description: "Maintain a 120-day study streak.", category: "streak" as const, targetValue: 120, rewardXp: 5000, rewardBadgeName: "Unstoppable", difficulty: "hard" as const },
  { title: "Half Year God", description: "Maintain a 180-day study streak.", category: "streak" as const, targetValue: 180, rewardXp: 7000, rewardBadgeName: "Half Year God", difficulty: "hard" as const },
  { title: "Solar Orbit", description: "Maintain a 365-day study streak.", category: "streak" as const, targetValue: 365, rewardXp: 10000, rewardBadgeName: "Solar Orbit", difficulty: "hard" as const },

  // ── Focus (11) ──────────────────────────────────────────────────────────────
  { title: "Focus Initiator", description: "Complete 1 locked focus session.", category: "focus" as const, targetValue: 1, rewardXp: 100, rewardBadgeName: "Initiate", difficulty: "easy" as const },
  { title: "Deep Work Starter", description: "Complete 5 locked focus sessions.", category: "focus" as const, targetValue: 5, rewardXp: 250, rewardBadgeName: "Deep Worker", difficulty: "easy" as const },
  { title: "Flow State", description: "Complete 15 locked focus sessions.", category: "focus" as const, targetValue: 15, rewardXp: 500, rewardBadgeName: "Flow State", difficulty: "medium" as const },
  { title: "Distraction Slayer", description: "Complete 30 locked focus sessions.", category: "focus" as const, targetValue: 30, rewardXp: 900, rewardBadgeName: "Slayer", difficulty: "medium" as const },
  { title: "Locked In", description: "Complete 50 locked focus sessions.", category: "focus" as const, targetValue: 50, rewardXp: 1400, rewardBadgeName: "Locked In", difficulty: "medium" as const },
  { title: "Iron Mind", description: "Complete 75 locked focus sessions.", category: "focus" as const, targetValue: 75, rewardXp: 2000, rewardBadgeName: "Iron Mind", difficulty: "hard" as const },
  { title: "Century Focus", description: "Complete 100 locked focus sessions.", category: "focus" as const, targetValue: 100, rewardXp: 3000, rewardBadgeName: "Century Focus", difficulty: "hard" as const },
  { title: "Zero Distractions", description: "Complete 150 locked sessions.", category: "focus" as const, targetValue: 150, rewardXp: 4000, rewardBadgeName: "Zero Distractions", difficulty: "hard" as const },
  { title: "Absolute Zen", description: "Complete 200 locked sessions.", category: "focus" as const, targetValue: 200, rewardXp: 5000, rewardBadgeName: "Absolute Zen", difficulty: "hard" as const },
  { title: "Monk Mode", description: "Complete 300 locked sessions.", category: "focus" as const, targetValue: 300, rewardXp: 7000, rewardBadgeName: "Monk Mode", difficulty: "hard" as const },
  { title: "Transcendence", description: "Complete 500 locked sessions.", category: "focus" as const, targetValue: 500, rewardXp: 10000, rewardBadgeName: "Transcendence", difficulty: "hard" as const },

  // ── Consistency (11) ────────────────────────────────────────────────────────
  { title: "First Steps", description: "Complete 3 study sessions.", category: "consistency" as const, targetValue: 3, rewardXp: 100, rewardBadgeName: "First Steps", difficulty: "easy" as const },
  { title: "Routine Builder", description: "Complete 10 study sessions.", category: "consistency" as const, targetValue: 10, rewardXp: 250, rewardBadgeName: "Routine Builder", difficulty: "easy" as const },
  { title: "Committed Learner", description: "Complete 25 study sessions.", category: "consistency" as const, targetValue: 25, rewardXp: 500, rewardBadgeName: "Committed", difficulty: "medium" as const },
  { title: "Disciplined Scholar", description: "Complete 50 study sessions.", category: "consistency" as const, targetValue: 50, rewardXp: 1000, rewardBadgeName: "Disciplined", difficulty: "medium" as const },
  { title: "Routine Master", description: "Complete 75 study sessions.", category: "consistency" as const, targetValue: 75, rewardXp: 1500, rewardBadgeName: "Routine Master", difficulty: "hard" as const },
  { title: "System Machine", description: "Complete 100 study sessions.", category: "consistency" as const, targetValue: 100, rewardXp: 2000, rewardBadgeName: "Machine", difficulty: "hard" as const },
  { title: "Study Engine", description: "Complete 150 study sessions.", category: "consistency" as const, targetValue: 150, rewardXp: 3000, rewardBadgeName: "Study Engine", difficulty: "hard" as const },
  { title: "Consistency God", description: "Complete 250 study sessions.", category: "consistency" as const, targetValue: 250, rewardXp: 5000, rewardBadgeName: "Consistency God", difficulty: "hard" as const },
  { title: "Ceaseless Learner", description: "Complete 350 study sessions.", category: "consistency" as const, targetValue: 350, rewardXp: 7000, rewardBadgeName: "Ceaseless Learner", difficulty: "hard" as const },
  { title: "Indefatigable", description: "Complete 500 study sessions.", category: "consistency" as const, targetValue: 500, rewardXp: 10000, rewardBadgeName: "Indefatigable", difficulty: "hard" as const },
  { title: "Apotheosis", description: "Complete 1000 study sessions.", category: "consistency" as const, targetValue: 1000, rewardXp: 20000, rewardBadgeName: "Apotheosis", difficulty: "hard" as const },

  // ── AI Usage (10) ───────────────────────────────────────────────────────────
  { title: "AI First Timer", description: "Send your first AI coach message.", category: "ai_usage" as const, targetValue: 1, rewardXp: 75, rewardBadgeName: "AI Pioneer", difficulty: "easy" as const },
  { title: "Neural Connector", description: "Send 10 AI coach messages.", category: "ai_usage" as const, targetValue: 10, rewardXp: 200, rewardBadgeName: "Neural Link", difficulty: "easy" as const },
  { title: "AI Collaborator", description: "Send 30 AI coach messages.", category: "ai_usage" as const, targetValue: 30, rewardXp: 450, rewardBadgeName: "AI Collab", difficulty: "medium" as const },
  { title: "Research Partner", description: "Send 75 AI coach messages.", category: "ai_usage" as const, targetValue: 75, rewardXp: 900, rewardBadgeName: "Research Partner", difficulty: "medium" as const },
  { title: "AI Synced", description: "Send 150 AI coach messages.", category: "ai_usage" as const, targetValue: 150, rewardXp: 1800, rewardBadgeName: "Synced", difficulty: "hard" as const },
  { title: "Cyborg Scholar", description: "Send 250 AI coach messages.", category: "ai_usage" as const, targetValue: 250, rewardXp: 3000, rewardBadgeName: "Cyborg Scholar", difficulty: "hard" as const },
  { title: "Neural Architect", description: "Send 500 AI coach messages.", category: "ai_usage" as const, targetValue: 500, rewardXp: 5000, rewardBadgeName: "Neural Architect", difficulty: "hard" as const },
  { title: "Sentient Link", description: "Send 1000 AI coach messages.", category: "ai_usage" as const, targetValue: 1000, rewardXp: 8000, rewardBadgeName: "Sentient Link", difficulty: "hard" as const },
  { title: "Hive Mind", description: "Send 2000 AI coach messages.", category: "ai_usage" as const, targetValue: 2000, rewardXp: 12000, rewardBadgeName: "Hive Mind", difficulty: "hard" as const },
  { title: "Singularity", description: "Send 5000 AI coach messages.", category: "ai_usage" as const, targetValue: 5000, rewardXp: 25000, rewardBadgeName: "Singularity", difficulty: "hard" as const },

  // ── Group (10) ──────────────────────────────────────────────────────────────
  { title: "First Contact", description: "Make your first post in a study group.", category: "group" as const, targetValue: 1, rewardXp: 100, rewardBadgeName: "First Contact", difficulty: "easy" as const },
  { title: "Community Member", description: "Make 5 group interactions.", category: "group" as const, targetValue: 5, rewardXp: 200, rewardBadgeName: "Community Member", difficulty: "easy" as const },
  { title: "Active Collaborator", description: "Make 15 group interactions.", category: "group" as const, targetValue: 15, rewardXp: 500, rewardBadgeName: "Collaborator", difficulty: "medium" as const },
  { title: "Squad Leader", description: "Make 30 group interactions.", category: "group" as const, targetValue: 30, rewardXp: 900, rewardBadgeName: "Squad Leader", difficulty: "medium" as const },
  { title: "Network Weaver", description: "Make 75 group interactions.", category: "group" as const, targetValue: 75, rewardXp: 2000, rewardBadgeName: "Network Weaver", difficulty: "hard" as const },
  { title: "Social Scholar", description: "Make 150 group interactions.", category: "group" as const, targetValue: 150, rewardXp: 3500, rewardBadgeName: "Social Scholar", difficulty: "hard" as const },
  { title: "Community Pillar", description: "Make 200 group interactions.", category: "group" as const, targetValue: 200, rewardXp: 5000, rewardBadgeName: "Community Pillar", difficulty: "hard" as const },
  { title: "Guild Master", description: "Make 300 group interactions.", category: "group" as const, targetValue: 300, rewardXp: 7500, rewardBadgeName: "Guild Master", difficulty: "hard" as const },
  { title: "Global Connector", description: "Make 500 group interactions.", category: "group" as const, targetValue: 500, rewardXp: 10000, rewardBadgeName: "Global Connector", difficulty: "hard" as const },
  { title: "Ecosystem Backbone", description: "Make 1000 group interactions.", category: "group" as const, targetValue: 1000, rewardXp: 20000, rewardBadgeName: "Ecosystem Backbone", difficulty: "hard" as const },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  console.log(`Seeding ${ALL_CHALLENGES.length} challenges...`);
  
  // To avoid duplication, we first fetch existing challenges
  const existing = await db.select().from(challenges);
  const existingTitles = new Set(existing.map(c => c.title));

  let added = 0;
  for (const challenge of ALL_CHALLENGES) {
    if (!existingTitles.has(challenge.title)) {
      try {
        await db.insert(challenges).values(challenge);
        added++;
      } catch (err: any) {
        if (!err.message?.includes("Duplicate")) {
          console.error("Error inserting:", challenge.title, err.message);
        }
      }
    }
  }
  
  console.log(`✅ ${added} new challenges inserted. Total is now ${existing.length + added} / 63!`);
  process.exit(0);
}

seed().catch(console.error);
