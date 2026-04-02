import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #6d28d9; text-align: center;">Welcome to LockedIn! 🚀</h2>
      <p style="font-size: 16px; text-align: center;">Your verification PIN code is:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${code}</span>
      </div>
      <p style="font-size: 14px; text-align: center; color: #6b7280;">This code expires in 5 minutes. Please do not share this code.</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'LockedIn <onboarding@resend.dev>', // Standardized
      to: email,
      subject: 'Your LockedIn Verification Code',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #db2777; text-align: center;">Reset Your Password 🔒</h2>
      <p style="font-size: 16px; text-align: center;">You requested a password reset. Your authorization code is:</p>
      <div style="background-color: #fce7f3; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #9d174d;">${code}</span>
      </div>
      <p style="font-size: 14px; text-align: center; color: #6b7280;">This code expires in 5 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'LockedIn <onboarding@resend.dev>', // Standardized
      to: email,
      subject: 'LockedIn Password Reset',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
