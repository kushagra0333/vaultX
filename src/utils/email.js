// lib/email.js
export async function sendEmail({ to, subject, text }) {
  // In development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log(`Email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return true;
  }

  // In production, implement your actual email service (SendGrid, Mailgun, etc.)
  // Example for SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to,
    from: 'noreply@vaultx.com',
    subject,
    text
  };
  
  return sgMail.send(msg);
  */
  
  return true;
}