import sgMail from '@sendgrid/mail';

// Ensure SendGrid API key is set
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SendGrid API key is missing. Check your environment variables.');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text, html }) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@vaultx.com', // Must be verified in SendGrid
    subject,
    text: text || 'Your VaultX verification OTP',
    html: html || `<p>${text || 'Your VaultX verification OTP'}</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('SendGrid Error:', error.response?.body || error.message);
    throw new Error('Failed to send email. Please try again.');
  }
}