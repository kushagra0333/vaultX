import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'your@email.com', // use your real email here
  from: 'your_verified_sender@domain.com', // must be verified in SendGrid
  subject: 'Test Email',
  text: 'This is a test email from SendGrid!',
};

sgMail.send(msg)
  .then(() => {
    console.log('Email sent');
  })
  .catch((error) => {
    console.error(error);
  });