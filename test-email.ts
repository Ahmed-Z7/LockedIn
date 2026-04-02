import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "lockedin.eg.support@gmail.com",
    pass: process.env.SMTP_PASS || "xhqxbwhdmpmvfmrf",
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: "LockedIn <lockedin.eg.support@gmail.com>",
      to: "ahmdzedan965@gmail.com",
      subject: "Test Email from LockedIn",
      text: "This is a test email.",
    });
    console.log("Email sent successfully:", info);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

main();
