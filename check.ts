import { db } from "./server/db";
import { verificationCodes } from "./drizzle/schema";

async function run() {
  try {
    const res = await db.select().from(verificationCodes);
    console.log("Success! Verification Codes count:", res.length);
  } catch (error) {
    console.error("DB Error:", error);
  }
}
run();
