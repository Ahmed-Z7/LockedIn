import axios from 'axios';

/**
 * Gmail REST API Email Service (Optimized for Deliverability)
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '584680300268-cjuo65ij8imsdhp3otrtgb0l4q9gl5mj.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

async function getAccessToken() {
  if (!REFRESH_TOKEN || !CLIENT_SECRET) {
    throw new Error('GMAIL_REFRESH_TOKEN or GOOGLE_CLIENT_SECRET missing');
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error('[Gmail API] Auth Error:', error.response?.data || error.message);
    throw new Error('Connect Error');
  }
}

async function sendGmailApiEmail(to: string, subject: string, html: string) {
  try {
    const accessToken = await getAccessToken();
    
    // MIME encoding for the subject to prevent garbage characters and spam triggers
    const encodedSubject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    const message = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      '',
      html
    ].join('\r\n'); // Use CRLF for RFC822 compliance

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await axios.post(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      { raw: encodedMessage },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    
    console.log('[Gmail API] Sent ID:', response.data.id);
    return { success: true };
  } catch (error: any) {
    console.error('[Gmail API] Send Error:', error.response?.data || error.message);
    throw new Error('Send Error');
  }
}

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px;background-color:#0a0118;font-family:sans-serif;color:#fff;">
  <div style="max-width:500px;margin:0 auto;background:#120a2e;border:1px solid #7c3aed44;border-radius:24px;padding:40px;">
    <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:10px 20px;border-radius:12px;display:inline-block;color:#fff;font-weight:900;margin-bottom:30px;">🔒 LOCKEDIN</div>
    ${content}
    <div style="margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#4b5563;">
      Stay focused. Stay locked in.<br>
      lockedin-eg.vercel.app
    </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1 style="font-size:24px;color:#fff;">Verify Your Email</h1>
    <p style="color:#9ca3af;">Use the code below to verify your account:</p>
    <div style="font-size:32px;letter-spacing:10px;color:#a78bfa;font-weight:900;margin:30px 0;text-align:center;background:rgba(124,58,237,0.1);padding:20px;border-radius:16px;">${code}</div>
  `);
  return sendGmailApiEmail(email, '🔐 Your LockedIn Verification Code', html);
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1 style="font-size:24px;color:#fff;">Reset Your Password</h1>
    <p style="color:#9ca3af;">Enter the code below to reset your password:</p>
    <div style="font-size:32px;letter-spacing:10px;color:#a78bfa;font-weight:900;margin:30px 0;text-align:center;background:rgba(124,58,237,0.1);padding:20px;border-radius:16px;">${code}</div>
  `);
  return sendGmailApiEmail(email, '🔑 Reset Your LockedIn Password', html);
}
