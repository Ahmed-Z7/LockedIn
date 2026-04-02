import axios from 'axios';

/**
 * Gmail REST API Email Service
 * This bypasses SMTP port blocks by using HTTPS (Port 443)
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '584680300268-cjuo65ij8imsdhp3otrtgb0l4q9gl5mj.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const FROM_EMAIL = 'lockedin.eg.support@gmail.com';

async function getAccessToken() {
  if (!REFRESH_TOKEN || !CLIENT_SECRET) {
    throw new Error('GMAIL_REFRESH_TOKEN or GOOGLE_CLIENT_SECRET is missing in environment variables');
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
    console.error('[Gmail API] Failed to refresh access token:', error.response?.data || error.message);
    throw new Error('Failed to connect to Gmail API');
  }
}

async function sendGmailApiEmail(to: string, subject: string, html: string) {
  try {
    const accessToken = await getAccessToken();
    
    // Create RFC822 compliant email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      '',
      html
    ].join('\n');

    // Base64URL encode the message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log(`[Gmail API] Attempting to send email to: ${to}`);
    const response = await axios.post(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      { raw: encodedMessage },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('[Gmail API] Email sent successfully! ID:', response.data.id);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('[Gmail API] Error sending email:', error.response?.data || error.message);
    throw new Error(`Gmail API Error: ${error.message}`);
  }
}

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { background-color: #0a0118; font-family: sans-serif; color: #fff; margin: 0; padding: 40px 20px; }
    .card { background: #120a2e; border: 1px solid #7c3aed44; border-radius: 24px; padding: 40px; max-width: 500px; margin: 0 auto; }
    .logo { color: #fff; font-weight: 900; background: linear-gradient(135deg,#7c3aed,#3b82f6); padding: 10px 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px; text-decoration: none; }
    .code { font-size: 32px; letter-spacing: 10px; color: #a78bfa; font-weight: 900; margin: 30px 0; text-align: center; background: rgba(124,58,237,0.1); padding: 20px; border-radius: 16px; border: 1px solid rgba(124,58,237,0.3); }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🔒 LOCKEDIN</div>
    ${content}
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1>Verify Your Email</h1>
    <p>Use the code below to verify your account:</p>
    <div class="code">${code}</div>
  `);
  return sendGmailApiEmail(email, '🔐 Your LockedIn Verification Code', html);
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = baseTemplate(`
    <h1>Reset Your Password</h1>
    <p>Enter the code below to proceed with password reset:</p>
    <div class="code">${code}</div>
  `);
  return sendGmailApiEmail(email, '🔑 Reset Your LockedIn Password', html);
}
