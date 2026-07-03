import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@snip.to';

export const emailService = {
  async sendPasswordResetEmail(to: string, resetLink: string) {
    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY not set — skipping email send');
      return;
    }
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Reset your Snip password',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
            <span style="background: linear-gradient(135deg, #F55D20, #F5A623); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Snip</span>
          </div>
          <p style="color: #555; font-size: 15px; line-height: 1.5; margin: 16px 0;">
            We received a request to reset your password. Click the button below to set a new one.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; padding: 12px 24px; border-radius: 12px;
                    background: linear-gradient(135deg, #F55D20, #F5A623); color: #fff;
                    font-size: 15px; font-weight: 600; text-decoration: none; margin: 8px 0;">
            Reset password
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  },
};
