import { db } from './server/db';
import { challenges } from './drizzle/schema';

async function seed() {
  console.log('--- Seeding Challenges ---');
  
  const initialChallenges = [
    {
      title: 'Neural Onboarding',
      description: 'Complete your first synchronized study session to initialize your neural link.',
      category: 'study_time' as const,
      targetValue: 60, // 60 minutes
      rewardXp: 500,
      rewardBadgeName: 'Neural Initiate',
      difficulty: 'easy' as const,
    },
    {
      title: 'Deep Work Master',
      description: 'Maintain absolute focus for 300 minutes across multiple sessions.',
      category: 'focus' as const,
      targetValue: 300,
      rewardXp: 1500,
      rewardBadgeName: 'Focus Ghost',
      difficulty: 'medium' as const,
    },
    {
      title: 'Collective Mindset',
      description: 'Participate in 5 group study sessions to enhance collective intelligence.',
      category: 'group' as const,
      targetValue: 5,
      rewardXp: 1200,
      rewardBadgeName: 'Sync Agent',
      difficulty: 'medium' as const,
    },
    {
      title: 'Relentless Discipline',
      description: 'Maintain a 14-day study streak without interruption.',
      category: 'streak' as const,
      targetValue: 14,
      rewardXp: 2500,
      rewardBadgeName: 'Infinite Flame',
      difficulty: 'hard' as const,
    },
    {
      title: 'Night Owl Sync',
      description: 'Complete 10 sessions between 00:00 and 04:00.',
      category: 'consistency' as const,
      targetValue: 10,
      rewardXp: 1800,
      rewardBadgeName: 'Midnight Spectre',
      difficulty: 'hard' as const,
    }
  ];

  for (const challenge of initialChallenges) {
    try {
      await db.insert(challenges).values(challenge);
      console.log(`+ Seeded: ${challenge.title}`);
    } catch (e) {
      console.log(`! Skipped: ${challenge.title} (already exists?)`);
    }
  }

  console.log('--- Seeding Complete ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
