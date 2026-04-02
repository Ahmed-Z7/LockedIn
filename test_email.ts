import { sendVerificationEmail, sendPasswordResetEmail } from "./server/email";
import "dotenv/config";

async function testEmails() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address as an argument.");
    process.exit(1);
  }

  console.log(`[Test] Sending verification email to ${email}...`);
  try {
    const result = await sendVerificationEmail(email, "123456");
    console.log("[Test] Success:", result);
  } catch (error) {
    console.error("[Test] Verification Failed:", error);
  }

  console.log(`\n[Test] Sending password reset email to ${email}...`);
  try {
    const result = await sendPasswordResetEmail(email, "654321");
    console.log("[Test] Success:", result);
  } catch (error) {
    console.error("[Test] Reset Failed:", error);
  }
}

testEmails();
