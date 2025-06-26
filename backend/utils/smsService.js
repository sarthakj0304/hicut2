const twilio = require('twilio');

// Check if Twilio credentials are available
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn('⚠️ Twilio credentials not configured. SMS functionality will be disabled.');
}

// Initialize Twilio client only if credentials are available
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Send SMS function
const sendSMS = async (to, message) => {
  try {
    if (!client) {
      console.warn('SMS service not available - Twilio not configured');
      // In development, just log the message instead of failing
      console.log(`📱 SMS would be sent to ${to}: ${message}`);
      return { sid: 'mock-message-id', status: 'sent' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

// SMS templates
const smsTemplates = {
  phoneVerification: (otp) => 
    `Your HICUT verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
  
  rideRequest: (driverName, pickup) => 
    `New ride request from ${driverName}. Pickup: ${pickup}. Open HICUT app to respond.`,
  
  rideConfirmed: (driverName, eta) => 
    `Ride confirmed! ${driverName} will arrive in ${eta}. Track your ride in the HICUT app.`,
  
  rideStarted: (destination) => 
    `Your ride has started! Heading to ${destination}. Have a safe trip!`,
  
  rideCompleted: (tokens) => 
    `Ride completed! You earned ${tokens} tokens. Rate your experience in the HICUT app.`,
  
  emergencyAlert: (location) => 
    `EMERGENCY: HICUT user needs help at ${location}. Contact authorities if necessary.`
};

// Send templated SMS
const sendTemplatedSMS = async (to, templateName, templateData) => {
  try {
    const template = smsTemplates[templateName];
    if (!template) {
      throw new Error(`SMS template '${templateName}' not found`);
    }

    const message = typeof template === 'function' ? template(templateData) : template;
    return await sendSMS(to, message);
  } catch (error) {
    console.error('Templated SMS sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendTemplatedSMS,
  smsTemplates
};