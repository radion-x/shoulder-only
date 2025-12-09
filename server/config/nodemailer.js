const nodemailer = require('nodemailer');

let transporter;

if (process.env.MAILGUN_SMTP_LOGIN && process.env.MAILGUN_SMTP_PASSWORD) {
  const smtpPort = parseInt(process.env.MAILGUN_SMTP_PORT || "465", 10);
  
  transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_SERVER || 'smtp.mailgun.org',
    port: smtpPort,
    secure: smtpPort === 465, // Use SSL for port 465
    connectionTimeout: 30000, // 30 second timeout
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true, // Use connection pooling
    maxConnections: 5,
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Nodemailer transporter verification error:', error);
      console.error('SMTP Config:', {
        host: process.env.MAILGUN_SMTP_SERVER,
        port: smtpPort,
        user: process.env.MAILGUN_SMTP_LOGIN ? '***set***' : '***missing***'
      });
    } else {
      console.log('Nodemailer transporter is ready to send emails.');
    }
  });
} else {
  console.warn('Mailgun SMTP credentials not fully set in .env. Email sending will be disabled.');
}

module.exports = transporter;
