import { db } from './server/db';
import { challenges } from './drizzle/schema';

async function debug() {
  const all = await db.select().from(challenges);
  console.log('Total Count:', all.length);
  if (all.length > 0) {
    console.log('Sample Categories:', Array.from(new Set(all.map(c => c.category))));
    console.log('First 5:', JSON.stringify(all.slice(0, 5), null, 2));
  }
  process.exit(0);
}

debug();
