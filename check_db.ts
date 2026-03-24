import "dotenv/config";
import { db } from "./server/db";
import { challenges, users, studyGroups } from "./drizzle/schema";
import { sql } from "drizzle-orm";

async function check() {
    const cCount = await db.select({ count: sql`count(*)` }).from(challenges);
    const uCount = await db.select({ count: sql`count(*)` }).from(users);
    const gCount = await db.select({ count: sql`count(*)` }).from(studyGroups);
    console.log(`Challenges: ${cCount[0].count}`);
    console.log(`Users: ${uCount[0].count}`);
    console.log(`Groups: ${gCount[0].count}`);
}

check().catch(console.error).finally(() => process.exit());
