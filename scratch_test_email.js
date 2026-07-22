require('dotenv').config({ path: '../server/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('Testing SMTP with:', process.env.EMAIL_USER, process.env.EMAIL_PASS ? 'PASS_PROVIDED' : 'NO_PASS');

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP VERIFICATION FAILED:', error);
  } else {
    console.log('SMTP VERIFICATION SUCCESS!');
    
    // Try sending an actual email
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'If you see this, email is working.'
    }).then(info => {
      console.log('Email sent successfully:', info.messageId);
    }).catch(err => {
      console.error('Failed to send test email:', err);
    });
  }
});
