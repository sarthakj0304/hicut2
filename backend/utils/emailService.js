const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HICUT" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (firstName) => ({
    subject: 'Welcome to HICUT! 🚗',
    text: `Hi ${firstName}, welcome to the HICUT community! Start earning tokens by sharing rides.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007AFF;">Welcome to HICUT! 🚗</h1>
        <p>Hi ${firstName},</p>
        <p>Welcome to the HICUT community! We're excited to have you on board.</p>
        <p>Start earning tokens by:</p>
        <ul>
          <li>Sharing rides with community members</li>
          <li>Completing your profile verification</li>
          <li>Referring friends to join HICUT</li>
        </ul>
        <p>Happy riding!</p>
        <p>The HICUT Team</p>
      </div>
    `
  }),

  rideConfirmation: (riderName, driverName, pickup, destination) => ({
    subject: 'Ride Confirmed - HICUT',
    text: `Your ride with ${driverName} has been confirmed. Pickup: ${pickup}, Destination: ${destination}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #34C759;">Ride Confirmed! ✅</h1>
        <p>Hi ${riderName},</p>
        <p>Your ride has been confirmed with ${driverName}.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Pickup:</strong> ${pickup}</p>
          <p><strong>Destination:</strong> ${destination}</p>
        </div>
        <p>Have a safe trip!</p>
        <p>The HICUT Team</p>
      </div>
    `
  }),

  tokenEarned: (userName, tokens, category) => ({
    subject: `You earned ${tokens} tokens! 🎉`,
    text: `Congratulations! You earned ${tokens} ${category} tokens for completing your ride.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFD700;">Tokens Earned! 🎉</h1>
        <p>Hi ${userName},</p>
        <p>Congratulations! You've earned <strong>${tokens} ${category} tokens</strong> for completing your ride.</p>
        <p>Use your tokens to redeem rewards from our partner brands.</p>
        <p>Keep riding and earning!</p>
        <p>The HICUT Team</p>
      </div>
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Reset Your HICUT Password',
    text: `Click the following link to reset your password: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007AFF;">Reset Your Password</h1>
        <p>You requested to reset your HICUT password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>The HICUT Team</p>
      </div>
    `
  })
};

// Send templated email
const sendTemplatedEmail = async (to, templateName, templateData) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const { subject, text, html } = template(templateData);
    return await sendEmail(to, subject, text, html);
  } catch (error) {
    console.error('Templated email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  emailTemplates
};