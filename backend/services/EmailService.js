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

/**
 * Send bank transfer email with account details
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's full name
 * @param {string} membershipType - Type of membership (annual/lifetime)
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code (default: AED)
 * @param {string} orderId - Order ID for tracking
 */
export const sendBankTransferEmail = async (userEmail, userName, membershipType, amount, currency = 'AED', orderId) => {
  try {
    const transporter = createTransporter();
    
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@wishwavesclub.com';
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.wishwavesclub.com';
    
    const membershipTypeDisplay = membershipType === 'lifetime' ? 'Lifetime' : 'Annual';
    
    // Bank account details from environment variables
    const bankName = process.env.BANK_NAME || 'Your Bank Name';
    const accountName = process.env.BANK_ACCOUNT_NAME || 'Wish Waves Club';
    const accountNumber = process.env.BANK_ACCOUNT_NUMBER || '1234567890';
    const iban = process.env.BANK_IBAN || 'AE123456789012345678901';
    const swift = process.env.BANK_SWIFT || 'SWIFTCODE';
    const branch = process.env.BANK_BRANCH || 'Branch Name';
    
    const receiptUploadUrl = `${frontendUrl}/payment/bank-transfer/receipt/${orderId}`;
    
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
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Bank Transfer Instructions</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear ${userName},
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for choosing <strong>Bank Transfer</strong> as your payment method for your ${membershipTypeDisplay} membership with Wish Waves Club.
                      </p>
                      
                      <div style="background-color: #f0f9fa; border-left: 4px solid #0a5d6f; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #0a5d6f; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
                          Payment Details
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 5px 0;">
                          <strong>Membership Type:</strong> ${membershipTypeDisplay}<br>
                          <strong>Amount:</strong> ${currency} ${amount.toLocaleString()}<br>
                          <strong>Order ID:</strong> ${orderId}
                        </p>
                      </div>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        <strong>Bank Account Details:</strong>
                      </p>
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 600; width: 40%;">Bank Name:</td>
                            <td style="padding: 8px 0; color: #555555;">${bankName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 600;">Account Name:</td>
                            <td style="padding: 8px 0; color: #555555;">${accountName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 600;">Account Number:</td>
                            <td style="padding: 8px 0; color: #555555; font-family: monospace;">${accountNumber}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 600;">IBAN:</td>
                            <td style="padding: 8px 0; color: #555555; font-family: monospace;">${iban}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 600;">SWIFT Code:</td>
                            <td style="padding: 8px 0; color: #555555; font-family: monospace;">${swift}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #333333; font-weight: 600;">Branch:</td>
                            <td style="padding: 8px 0; color: #555555;">${branch}</td>
                          </tr>
                        </table>
                      </div>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        <strong>Important Instructions:</strong>
                      </p>
                      <ol style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                        <li>Please transfer the exact amount of <strong>${currency} ${amount.toLocaleString()}</strong> to the bank account details above.</li>
                        <li>Include your Order ID (<strong>${orderId}</strong>) in the transfer reference/notes.</li>
                        <li>After completing the transfer, please upload your payment receipt using the link below.</li>
                        <li>Your membership will be activated after we verify your payment receipt.</li>
                      </ol>
                      
                      <div style="text-align: center; margin: 40px 0 20px 0;">
                        <a href="${receiptUploadUrl}" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Upload Payment Receipt
                        </a>
                      </div>
                      
                      <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                        If you have any questions or need assistance, please contact us at <a href="mailto:info@wishgroup.ae" style="color: #0a5d6f;">info@wishgroup.ae</a>
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
                        Welcome to the Oceanic Lifestyle
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

Thank you for choosing Bank Transfer as your payment method for your ${membershipTypeDisplay} membership with Wish Waves Club.

Payment Details:
- Membership Type: ${membershipTypeDisplay}
- Amount: ${currency} ${amount.toLocaleString()}
- Order ID: ${orderId}

Bank Account Details:
Bank Name: ${bankName}
Account Name: ${accountName}
Account Number: ${accountNumber}
IBAN: ${iban}
SWIFT Code: ${swift}
Branch: ${branch}

Important Instructions:
1. Please transfer the exact amount of ${currency} ${amount.toLocaleString()} to the bank account details above.
2. Include your Order ID (${orderId}) in the transfer reference/notes.
3. After completing the transfer, please upload your payment receipt using this link: ${receiptUploadUrl}
4. Your membership will be activated after we verify your payment receipt.

If you have any questions or need assistance, please contact us at info@wishgroup.ae

Wish Waves Club
Welcome to the Oceanic Lifestyle
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

/**
 * Send rejection email when receipt is rejected
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's full name
 * @param {string} orderId - Order ID
 * @param {string} notes - Admin rejection notes
 */
export const sendRejectionEmail = async (userEmail, userName, orderId, notes) => {
  try {
    const transporter = createTransporter();
    
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@wishwavesclub.com';
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.wishwavesclub.com';
    
    const receiptUploadUrl = `${frontendUrl}/payment/bank-transfer/receipt/${orderId}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt Review Update - Wish Waves Club</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Receipt Review Update</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear ${userName},
                      </p>
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We have reviewed your payment receipt for Order <strong>${orderId}</strong>, and unfortunately, we are unable to approve it at this time.
                      </p>
                      
                      ${notes ? `
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #856404; font-size: 16px; line-height: 1.6; margin: 0;">
                          <strong>Review Notes:</strong><br>
                          ${notes}
                        </p>
                      </div>
                      ` : ''}
                      
                      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                        <strong>What to do next:</strong>
                      </p>
                      <ol style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                        <li>Please review the notes above and ensure your receipt meets our requirements.</li>
                        <li>Upload a new receipt using the link below.</li>
                        <li>Make sure the receipt clearly shows the payment amount and transaction details.</li>
                      </ol>
                      
                      <div style="text-align: center; margin: 40px 0 20px 0;">
                        <a href="${receiptUploadUrl}" 
                           style="display: inline-block; background-color: #0a5d6f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Upload New Receipt
                        </a>
                      </div>
                      
                      <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                        If you have any questions, please contact us at <a href="mailto:info@wishgroup.ae" style="color: #0a5d6f;">info@wishgroup.ae</a>
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
                        Welcome to the Oceanic Lifestyle
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
Receipt Review Update - Wish Waves Club

Dear ${userName},

We have reviewed your payment receipt for Order ${orderId}, and unfortunately, we are unable to approve it at this time.

${notes ? `Review Notes:\n${notes}\n\n` : ''}
What to do next:
1. Please review the notes above and ensure your receipt meets our requirements.
2. Upload a new receipt using this link: ${receiptUploadUrl}
3. Make sure the receipt clearly shows the payment amount and transaction details.

If you have any questions, please contact us at info@wishgroup.ae

Wish Waves Club
Welcome to the Oceanic Lifestyle
    `;
    
    const mailOptions = {
      from: `"Wish Waves Club" <${emailFrom}>`,
      to: userEmail,
      subject: `Receipt Review Update - Order ${orderId} - Wish Waves Club`,
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    throw error;
  }
};

export default {
  sendWelcomeEmail,
  sendBankTransferEmail,
  sendRejectionEmail,
};

