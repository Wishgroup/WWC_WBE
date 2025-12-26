/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

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
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        <strong>What's Next?</strong>
                      </p>
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Log in to your member dashboard to explore exclusive offers, upcoming events, and manage your membership. Your journey into the oceanic lifestyle begins now!
                      </p>
                      
                      <div style="text-align: center; margin: 40px 0 20px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/member/dashboard" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Access Member Dashboard
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

What's Next?
Log in to your member dashboard to explore exclusive offers, upcoming events, and manage your membership. Your journey into the oceanic lifestyle begins now!

Access your dashboard: ${process.env.FRONTEND_URL || 'https://www.wishwavesclub.com'}/member/dashboard

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

export default {
  sendWelcomeEmail,
};

