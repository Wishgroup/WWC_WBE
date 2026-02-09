/**
 * Email Service
 * Handles sending emails using Nodemailer
 * Configured for mail.wishwavesclub.com
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with Wish Waves Club email configuration
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || 'mail.wishwavesclub.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465');
  const smtpUser = process.env.SMTP_USER || 'info@wishwavesclub.com';
  const smtpPass = process.env.SMTP_PASS;
  
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
    },
  });
};

// Default email addresses
const DEFAULT_FROM = process.env.EMAIL_FROM || 'info@wishwavesclub.com';
const INQUIRY_EMAIL = process.env.INQUIRY_EMAIL || 'info@wishwavesclub.com';

/**
 * Send welcome email to new member
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's full name
 * @param {string} membershipType - Type of membership (annual/lifetime)
 */
export const sendWelcomeEmail = async (userEmail, userName, membershipType) => {
  try {
    const transporter = createTransporter();
    
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@wishwavesclub.com';
    
    const membershipTypeDisplay = membershipType === 'lifetime' ? 'Lifetime' : 'Annual';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Wish Waves Club</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a5d6f 0%, #0d7a8f 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Welcome to the Oceanic Lifestyle</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear ${userName},
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We are thrilled to welcome you to <strong>Wish Waves Club</strong>! Your payment has been successfully received, and your ${membershipTypeDisplay} membership is now active.
                      </p>
                      
                      <div style="background-color: #f0f9fa; border-left: 4px solid #0a5d6f; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #0a5d6f; font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">
                          Welcome to the Oceanic Lifestyle
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                          You now have access to exclusive benefits, events, and experiences that await you. Dive into a world of luxury, adventure, and unforgettable moments.
                        </p>
                      </div>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>Your Membership Details:</strong>
                      </p>
                      <ul style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                        <li>Membership Type: ${membershipTypeDisplay}</li>
                        <li>Status: Active</li>
                        <li>Email: ${userEmail}</li>
                      </ul>
                      
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                          🔐 Set Your Password
                        </p>
                        <p style="color: #856404; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                          To access your member dashboard, please set your password first. Click the button below to create your secure password.
                        </p>
                        <div style="text-align: center; margin: 15px 0 0 0;">
                          <a href="${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/set-password?email=${encodeURIComponent(userEmail)}" 
                             style="display: inline-block; background-color: #ffc107; color: #000000; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Set Your Password
                          </a>
                        </div>
                      </div>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        <strong>What's Next?</strong>
                      </p>
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Once you've set your password, you can log in to your member dashboard to explore exclusive offers, upcoming events, and manage your membership. Your journey into the oceanic lifestyle begins now!
                      </p>
                      
                      <div style="text-align: center; margin: 40px 0 20px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/login" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Login to Dashboard
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        <strong>Wish Waves Club</strong>
                      </p>
                      <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0;">
                        If you have any questions, please contact us at <a href="mailto:info@wishgroup.ae" style="color: #0a5d6f;">info@wishgroup.ae</a>
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
    
    const textContent = `
Welcome to the Oceanic Lifestyle

Dear ${userName},

We are thrilled to welcome you to Wish Waves Club! Your payment has been successfully received, and your ${membershipTypeDisplay} membership is now active.

Welcome to the Oceanic Lifestyle
You now have access to exclusive benefits, events, and experiences that await you. Dive into a world of luxury, adventure, and unforgettable moments.

Your Membership Details:
- Membership Type: ${membershipTypeDisplay}
- Status: Active
- Email: ${userEmail}

🔐 Set Your Password
To access your member dashboard, please set your password first. Use the link below to create your secure password.

Set Your Password: ${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/set-password?email=${encodeURIComponent(userEmail)}

What's Next?
Once you've set your password, you can log in to your member dashboard to explore exclusive offers, upcoming events, and manage your membership. Your journey into the oceanic lifestyle begins now!

Login: ${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/login

Wish Waves Club
If you have any questions, please contact us at info@wishgroup.ae
    `;
    
    const mailOptions = {
      from: `"Wish Waves Club" <${emailFrom}>`,
      to: userEmail,
      subject: 'Welcome to Wish Waves Club - Welcome to the Oceanic Lifestyle',
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

const FRONTEND_BASE = process.env.FRONTEND_URL || 'https://www.wishwavesclub.com';

/**
 * Send password reset email with secure link
 * @param {string} userEmail - User's email address
 * @param {string} resetToken - One-time reset token
 */
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@wishwavesclub.com';
    const resetLink = `${FRONTEND_BASE}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(userEmail)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a5d6f 0%, #0d7a8f 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We received a request to reset the password for your Wish Waves Club account (${userEmail}).
                      </p>
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                        Click the button below to choose a new password. This link will expire in 1 hour.
                      </p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
                      </div>
                      <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                        If you didn't request this, you can safely ignore this email. Your password will not be changed.
                      </p>
                      <p style="color: #888888; font-size: 12px; line-height: 1.6; margin: 15px 0 0 0;">
                        Link not working? Copy and paste this URL into your browser:<br/>
                        <a href="${resetLink}" style="color: #0a5d6f; word-break: break-all;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 12px; margin: 0;">Wish Waves Club</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const textContent = `Reset Your Password\n\nWe received a request to reset the password for ${userEmail}.\n\nReset link (expires in 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\nWish Waves Club`;

    const mailOptions = {
      from: `"Wish Waves Club" <${emailFrom}>`,
      to: userEmail,
      subject: 'Wish Waves Club – Reset Your Password',
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send subscription thank you email
 * @param {string} userEmail - Subscriber's email address
 */
export const sendSubscriptionThankYou = async (userEmail) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Subscribing</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a5d6f 0%, #0d7a8f 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Thank You for Subscribing!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear Subscriber,
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for subscribing to <strong>Wish Waves Club</strong>!
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        You're now part of our exclusive community. Stay tuned for exciting updates, exclusive offers, and upcoming events delivered straight to your inbox.
                      </p>
                      
                      <div style="background-color: #f0f9fa; border-left: 4px solid #0a5d6f; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #0a5d6f; font-size: 16px; line-height: 1.6; margin: 0;">
                          We're excited to share the oceanic lifestyle with you. Get ready for exclusive benefits, premium experiences, and unforgettable moments!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        <strong>Wish Waves Club</strong>
                      </p>
                      <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0;">
                        If you have any questions, please contact us at <a href="mailto:${INQUIRY_EMAIL}" style="color: #0a5d6f;">${INQUIRY_EMAIL}</a>
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
    
    const textContent = `
Thank You for Subscribing!

Dear Subscriber,

Thank you for subscribing to Wish Waves Club!

You're now part of our exclusive community. Stay tuned for exciting updates, exclusive offers, and upcoming events delivered straight to your inbox.

We're excited to share the oceanic lifestyle with you. Get ready for exclusive benefits, premium experiences, and unforgettable moments!

Wish Waves Club
If you have any questions, please contact us at ${INQUIRY_EMAIL}
    `;
    
    const mailOptions = {
      from: `"Wish Waves Club" <${DEFAULT_FROM}>`,
      to: userEmail,
      subject: 'Thank You for Subscribing to Wish Waves Club',
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Subscription thank you email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending subscription email:', error);
    throw error;
  }
};

/**
 * Send login notification email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's full name
 * @param {string} loginTime - Login timestamp
 * @param {string} ipAddress - IP address of login
 */
export const sendLoginNotification = async (userEmail, userName, loginTime, ipAddress) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a5d6f 0%, #0d7a8f 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Login Notification</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hello ${userName || 'there'},
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We wanted to let you know that you've successfully logged into your <strong>Wish Waves Club</strong> account.
                      </p>
                      
                      <div style="background-color: #f0f9fa; border-left: 4px solid #0a5d6f; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0;">
                          <strong>Login Details:</strong><br>
                          Time: ${loginTime}<br>
                          IP Address: ${ipAddress || 'Not available'}
                        </p>
                      </div>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        If this wasn't you, please secure your account immediately by changing your password.
                      </p>
                      
                      <div style="text-align: center; margin: 40px 0 20px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/login" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Access Your Account
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        <strong>Wish Waves Club</strong>
                      </p>
                      <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0;">
                        If you have any concerns, please contact us at <a href="mailto:${INQUIRY_EMAIL}" style="color: #0a5d6f;">${INQUIRY_EMAIL}</a>
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
    
    const textContent = `
Login Notification

Hello ${userName || 'there'},

We wanted to let you know that you've successfully logged into your Wish Waves Club account.

Login Details:
Time: ${loginTime}
IP Address: ${ipAddress || 'Not available'}

If this wasn't you, please secure your account immediately by changing your password.

Access your account: ${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/login

Wish Waves Club
If you have any concerns, please contact us at ${INQUIRY_EMAIL}
    `;
    
    const mailOptions = {
      from: `"Wish Waves Club" <${DEFAULT_FROM}>`,
      to: userEmail,
      subject: 'Login Notification - Wish Waves Club',
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending login notification email:', error);
    throw error;
  }
};

/**
 * Send inquiry email to info@wishwavesclub.com
 * @param {Object} inquiryData - Inquiry details (name, email, subject, message, etc.)
 */
export const sendInquiryEmail = async (inquiryData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, subject, message, phone, inquiryType } = inquiryData;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Inquiry - ${subject || 'Contact Form'}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a5d6f 0%, #0d7a8f 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">New Inquiry Received</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        You have received a new inquiry:
                      </p>
                      
                      <div style="background-color: #f0f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                          <strong>Name:</strong> ${name || 'Not provided'}
                        </p>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                          <strong>Email:</strong> <a href="mailto:${email}" style="color: #0a5d6f;">${email}</a>
                        </p>
                        ${phone ? `<p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
                        ${inquiryType ? `<p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;"><strong>Type:</strong> ${inquiryType}</p>` : ''}
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                          <strong>Subject:</strong> ${subject || 'No subject'}
                        </p>
                      </div>
                      
                      <div style="background-color: #ffffff; border: 1px solid #e9ecef; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #333333; font-size: 14px; line-height: 1.8; margin: 0 0 10px 0;">
                          <strong>Message:</strong>
                        </p>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
                          ${message || 'No message provided'}
                        </p>
                      </div>
                      
                      <div style="text-align: center; margin: 30px 0 20px 0;">
                        <a href="mailto:${email}" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Reply to ${name || email}
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0;">
                        This inquiry was submitted through the Wish Waves Club website.
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
    
    const textContent = `
New Inquiry Received

You have received a new inquiry:

Name: ${name || 'Not provided'}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}${inquiryType ? `Type: ${inquiryType}\n` : ''}Subject: ${subject || 'No subject'}

Message:
${message || 'No message provided'}

Reply to: ${email}
    `;
    
    const mailOptions = {
      from: `"Wish Waves Club Website" <${DEFAULT_FROM}>`,
      to: INQUIRY_EMAIL,
      replyTo: email,
      subject: `New Inquiry: ${subject || 'Contact Form Submission'}`,
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Inquiry email sent to', INQUIRY_EMAIL, ':', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending inquiry email:', error);
    throw error;
  }
};

/**
 * Send bank transfer instructions email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's full name
 * @param {string} membershipType - Type of membership (annual/lifetime)
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code (e.g., 'USD')
 * @param {string} orderId - Order ID for tracking
 */
export const sendBankTransferEmail = async (userEmail, userName, membershipType, amount, currency, orderId) => {
  try {
    const transporter = createTransporter();
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@wishwavesclub.com';
    
    const membershipTypeDisplay = membershipType === 'lifetime' ? 'Lifetime' : 'Annual';
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bank Transfer Instructions - Wish Waves Club</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a5d6f 0%, #0d7a8f 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Bank Transfer Instructions</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear ${userName},
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for choosing to pay via bank transfer for your <strong>${membershipTypeDisplay} Membership</strong> with Wish Waves Club.
                      </p>
                      
                      <div style="background-color: #f0f9fa; border-left: 4px solid #0a5d6f; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #0a5d6f; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                          Payment Details
                        </p>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                          <strong>Order ID:</strong> ${orderId}
                        </p>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                          <strong>Amount:</strong> ${formattedAmount}
                        </p>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                          <strong>Membership Type:</strong> ${membershipTypeDisplay}
                        </p>
                      </div>
                      
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                          📋 Next Steps
                        </p>
                        <ol style="color: #856404; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Complete the bank transfer using the details provided in your payment confirmation</li>
                          <li>Upload your payment receipt using the link below</li>
                          <li>Wait for admin verification (usually within 24-48 hours)</li>
                          <li>You'll receive an email once your payment is verified and membership is activated</li>
                        </ol>
                      </div>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        <strong>Important:</strong> Please include your Order ID (${orderId}) in the bank transfer reference/memo field to help us process your payment quickly.
                      </p>
                      
                      <div style="text-align: center; margin: 40px 0 20px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/order-status?orderId=${orderId}" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Check Order Status
                        </a>
                      </div>
                      
                      <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                        If you have any questions about your payment or need assistance, please contact our support team at <a href="mailto:${INQUIRY_EMAIL}" style="color: #0a5d6f;">${INQUIRY_EMAIL}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        <strong>Wish Waves Club</strong>
                      </p>
                      <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0;">
                        Thank you for your membership application!
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
    
    const textContent = `
Bank Transfer Instructions - Wish Waves Club

Dear ${userName},

Thank you for choosing to pay via bank transfer for your ${membershipTypeDisplay} Membership with Wish Waves Club.

Payment Details:
- Order ID: ${orderId}
- Amount: ${formattedAmount}
- Membership Type: ${membershipTypeDisplay}

Next Steps:
1. Complete the bank transfer using the details provided in your payment confirmation
2. Upload your payment receipt
3. Wait for admin verification (usually within 24-48 hours)
4. You'll receive an email once your payment is verified and membership is activated

Important: Please include your Order ID (${orderId}) in the bank transfer reference/memo field to help us process your payment quickly.

Check Order Status: ${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/order-status?orderId=${orderId}

If you have any questions about your payment or need assistance, please contact our support team at ${INQUIRY_EMAIL}

Wish Waves Club
Thank you for your membership application!
    `;
    
    const mailOptions = {
      from: `"Wish Waves Club" <${emailFrom}>`,
      to: userEmail,
      subject: `Bank Transfer Instructions - Order ${orderId} - Wish Waves Club`,
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Bank transfer email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending bank transfer email:', error);
    throw error;
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSubscriptionThankYou,
  sendLoginNotification,
  sendInquiryEmail,
  sendBankTransferEmail,
};

