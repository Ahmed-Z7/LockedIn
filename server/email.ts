import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_SENDER_EMAIL || 'LockedIn <onboarding@resend.dev>';
const APP_URL = process.env.VITE_APP_URL || 'https://locked-in.vercel.app';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LockedIn</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0118;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0118;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:16px;padding:14px 20px;display:inline-block;">
                    <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">🔒 LOCKEDIN</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(145deg,#120a2e,#0f0a24);border:1px solid rgba(124,58,237,0.25);border-radius:24px;padding:40px 36px;box-shadow:0 0 60px rgba(124,58,237,0.15);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                You're receiving this email because an action was triggered on your LockedIn account.<br/>
                If you didn't request this, you can safely ignore this email.<br/><br/>
                <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">lockedin.team</a>
                &nbsp;·&nbsp;
                <span style="color:#374151;">Stay focused. Stay locked in.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const codeBlock = (code: string, accent = '#7c3aed') => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:24px 40px;">
          <tr>
            <td align="center">
              <span style="font-size:42px;font-weight:900;letter-spacing:10px;color:${accent};font-family:'Courier New',monospace;">${code}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export async function sendVerificationEmail(email: string, code: string) {
  const html = baseTemplate(`
    <!-- Icon -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#7c3aed22,#3b82f622);border:1px solid rgba(124,58,237,0.4);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;font-size:32px;line-height:72px;text-align:center;">🚀</div>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f3f4f6;text-align:center;letter-spacing:-0.5px;">
      Verify Your Email
    </h1>
    <p style="margin:0 0 4px;font-size:15px;color:#9ca3af;text-align:center;line-height:1.6;">
      Welcome to LockedIn! You're one step away from unlocking your full potential.
    </p>
    <p style="margin:0 0 4px;font-size:15px;color:#9ca3af;text-align:center;line-height:1.6;">
      Use the 6-digit PIN below to verify your account:
    </p>

    ${codeBlock(code, '#a78bfa')}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td align="center">
          <span style="display:inline-block;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px 18px;font-size:13px;color:#f87171;font-weight:600;">
            ⏱  Expires in 5 minutes
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;text-align:center;">
      For your security, never share this code with anyone — including LockedIn support.
    </p>
  `);

  try {
    const data = await resend.emails.send({
      from: FROM,
      to: email,
      subject: '🔐 Your LockedIn Verification Code',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = baseTemplate(`
    <!-- Icon -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#db277722,#7c3aed22);border:1px solid rgba(219,39,119,0.4);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;font-size:32px;line-height:72px;text-align:center;">🔒</div>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f3f4f6;text-align:center;letter-spacing:-0.5px;">
      Reset Your Password
    </h1>
    <p style="margin:0 0 4px;font-size:15px;color:#9ca3af;text-align:center;line-height:1.6;">
      We received a request to reset the password for your LockedIn account.
    </p>
    <p style="margin:0 0 4px;font-size:15px;color:#9ca3af;text-align:center;line-height:1.6;">
      Enter the code below to proceed:
    </p>

    ${codeBlock(code, '#f472b6')}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td align="center">
          <span style="display:inline-block;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px 18px;font-size:13px;color:#f87171;font-weight:600;">
            ⏱  Expires in 5 minutes
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;text-align:center;">
      If you didn't request a password reset, please ignore this email.<br/>
      Your account is safe — no changes have been made.
    </p>
  `);

  try {
    const data = await resend.emails.send({
      from: FROM,
      to: email,
      subject: '🔑 Reset Your LockedIn Password',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
