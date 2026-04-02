import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 globally for Node.js
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.GMAIL_USER || 'lockedin.eg.support@gmail.com',
    pass: process.env.GMAIL_PASS || 'sficoiixvganqoxs',
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com'
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  debug: true,
  logger: true
} as any);

const FROM = 'LockedIn <lockedin.eg.support@gmail.com>';
const APP_URL = process.env.FRONTEND_URL || 'https://lockedin-eg.vercel.app';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LockedIn</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0118;font-family:sans-serif;color:#fff;">
  <div style="max-width:500px;margin:20px auto;background:#120a2e;border:1px solid #7c3aed44;border-radius:24px;padding:40px;box-shadow:0 0 40px rgba(124,58,237,0.1);">
     <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:12px 20px;border-radius:12px;display:inline-block;color:#fff;font-weight:900;margin-bottom:20px;">🔒 LOCKEDIN</div>
     ${content}
     <div style="margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#4b5563;">
       Stay focused. Stay locked in.<br>
       <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">lockedin-eg.vercel.app</a>
     </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1 style="font-size:24px;margin:0 0 10px;">Verify Your Email</h1>
    <p style="color:#9ca3af;line-height:1.6;margin:0;">Use the 6-digit PIN below to verify your account:</p>
    <div style="font-size:32px;letter-spacing:10px;color:#a78bfa;font-weight:900;margin:30px 0;text-align:center;background:rgba(124,58,237,0.1);padding:20px;border-radius:16px;">${code}</div>
  `);

  try {
    console.log(`[Gmail] Attempting to send verification email to: ${email}`);
    const info = await transporter.sendMail({ from: FROM, to: email, subject: '🔐 Your LockedIn Verification Code', html });
    console.log('[Gmail] Email sent successfully:', info.messageId);
    return { success: true, data: info };
  } catch (error: any) {
    console.error('[Gmail] SMTP Error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1 style="font-size:24px;margin:0 0 10px;">Reset Your Password</h1>
    <p style="color:#9ca3af;line-height:1.6;margin:0;">Enter the code below to reset your password:</p>
    <div style="font-size:32px;letter-spacing:10px;color:#a78bfa;font-weight:900;margin:30px 0;text-align:center;background:rgba(124,58,237,0.1);padding:20px;border-radius:16px;">${code}</div>
  `);

  try {
    console.log(`[Gmail] Attempting to send reset email to: ${email}`);
    const info = await transporter.sendMail({ from: FROM, to: email, subject: '🔑 Reset Your LockedIn Password', html });
    console.log('[Gmail] Email sent successfully:', info.messageId);
    return { success: true, data: info };
  } catch (error: any) {
    console.error('[Gmail] SMTP Error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
