import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_7WJ5CqK6_NsCP7P7M4YjNbKqH8W2M'; 
const FROM = 'LockedIn <onboarding@resend.dev>'; 
const APP_URL = process.env.FRONTEND_URL || 'https://lockedin-eg.vercel.app';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { background-color: #0a0118; font-family: sans-serif; color: #fff; margin: 0; padding: 40px 20px; }
    .card { background: #120a2e; border: 1px solid #7c3aed44; border-radius: 24px; padding: 40px; max-width: 500px; margin: 0 auto; }
    .logo { color: #fff; font-weight: 900; background: linear-gradient(135deg,#7c3aed,#3b82f6); padding: 10px 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px; text-decoration: none; }
    .code { font-size: 32px; letter-spacing: 10px; color: #a78bfa; font-weight: 900; margin: 30px 0; text-align: center; background: rgba(124,58,237,0.1); padding: 20px; border-radius: 16px; border: 1px solid rgba(124,58,237,0.3); }
    h1 { font-size: 24px; margin: 0 0 10px; color: #fff; }
    p { color: #9ca3af; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🔒 LOCKEDIN</div>
    ${content}
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #4b5563;">
      Stay focused. Stay locked in.<br>
      <a href="${APP_URL}" style="color: #7c3aed; text-decoration: none;">lockedin-eg.vercel.app</a>
    </div>
  </div>
</body>
</html>
`;

async function sendResendEmail(to: string, subject: string, html: string) {
  try {
    console.log(`[Resend] Sending email to: ${to}`);
    const response = await axios.post('https://api.resend.com/emails', {
      from: FROM,
      to: [to],
      subject,
      html
    }, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('[Resend] Email sent successfully ID:', response.data.id);
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error('[Resend] API ERROR:', errorData);
    throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1>Verify Your Email</h1>
    <p>Welcome to LockedIn! Use the 6-digit PIN below to verify your account:</p>
    <div class="code">${code}</div>
    <p style="font-size: 13px; color: #f87171;">⏱ Expires in 5 minutes</p>
  `);
  return sendResendEmail(email, '🔐 Your LockedIn Verification Code', html);
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password. Enter the code below to proceed:</p>
    <div class="code">${code}</div>
    <p style="font-size: 13px; color: #f87171;">⏱ Expires in 5 minutes</p>
  `);
  return sendResendEmail(email, '🔑 Reset Your LockedIn Password', html);
}
