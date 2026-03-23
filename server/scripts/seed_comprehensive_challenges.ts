import 'dotenv/config';
import { db } from '../db';
import { challenges } from '../../drizzle/schema';

async function seed() {
  console.log('--- Seeding 63 Comprehensive Challenges ---');

  const categories = ['study_time', 'streak', 'focus', 'consistency', 'ai_usage', 'group'] as const;
  
  const challengeData: any[] = [];

  // 1. Study Time (10 Challenges)
  for (let i = 1; i <= 10; i++) {
    const hours = [1, 5, 10, 25, 50, 100, 250, 500, 750, 1000][i-1];
    challengeData.push({
      title: `Study Marathon Lvl ${i}`,
      description: `Log a total of ${hours} hours of focused study time.`,
      category: 'study_time',
      targetValue: hours * 60, // in minutes
      rewardXp: hours * 10,
      difficulty: hours > 100 ? 'hard' : (hours > 20 ? 'medium' : 'easy'),
    });
  }

  // 2. Streak (10 Challenges)
  for (let i = 1; i <= 10; i++) {
    const days = [3, 7, 14, 30, 60, 90, 150, 200, 300, 365][i-1];
    challengeData.push({
      title: `Persistence Lvl ${i}`,
      description: `Maintain a study streak for ${days} consecutive days.`,
      category: 'streak',
      targetValue: days,
      rewardXp: days * 15,
      difficulty: days > 60 ? 'hard' : (days > 14 ? 'medium' : 'easy'),
    });
  }

  // 3. Focus (10 Challenges)
  for (let i = 1; i <= 10; i++) {
    const sessions = [5, 10, 25, 50, 75, 100, 150, 200, 300, 500][i-1];
    challengeData.push({
      title: `Focus Depth Lvl ${i}`,
      description: `Complete ${sessions} deep work sessions without distraction.`,
      category: 'focus',
      targetValue: sessions,
      rewardXp: sessions * 20,
      difficulty: sessions > 100 ? 'hard' : (sessions > 25 ? 'medium' : 'easy'),
    });
  }

  // 4. Consistency (10 Challenges)
  const consistencyTypes = ['Early Bird', 'Night Owl', 'Weekend Warrior', 'Noon Ninja', 'Dawn Patrol', 'Twilight Scholar', 'System Sync', 'Heartbeat', 'Iron Will', 'Unstoppable'];
  for (let i = 1; i <= 10; i++) {
     challengeData.push({
       title: `${consistencyTypes[i-1]} Mastery`,
       description: `Maintain high performance in your specific study window for ${i * 10} sessions.`,
       category: 'consistency',
       targetValue: i * 10,
       rewardXp: i * 100,
       difficulty: i > 7 ? 'hard' : (i > 3 ? 'medium' : 'easy'),
     });
  }

  // 5. AI Usage (10 Challenges)
  for (let i = 1; i <= 10; i++) {
    const prompts = [10, 25, 50, 100, 200, 400, 600, 800, 1000, 2000][i-1];
    challengeData.push({
      title: `Neural Prompting Lvl ${i}`,
      description: `Interact with the AI Coach ${prompts} times to refine your learning.`,
      category: 'ai_usage',
      targetValue: prompts,
      rewardXp: Math.floor(prompts * 2.5),
      difficulty: prompts > 500 ? 'hard' : (prompts > 50 ? 'medium' : 'easy'),
    });
  }

  // 6. Group Study (13 Challenges to reach 63)
  for (let i = 1; i <= 13; i++) {
    const groupActions = [1, 3, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100][i-1];
    challengeData.push({
      title: `Collective Sync Lvl ${i}`,
      description: `Participate in ${groupActions} group study sessions or collective discussions.`,
      category: 'group',
      targetValue: groupActions,
      rewardXp: groupActions * 30,
      difficulty: groupActions > 50 ? 'hard' : (groupActions > 10 ? 'medium' : 'easy'),
    });
  }

  console.log(`Total challenges prepared: ${challengeData.length}`);

  for (const challenge of challengeData) {
    try {
      await db.insert(challenges).values(challenge);
      console.log(`+ Seeded: ${challenge.title}`);
    } catch (e) {
      // Just update if it exists or ignore
      console.log(`! Exists: ${challenge.title}`);
    }
  }

  console.log('--- Seeding Done ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
