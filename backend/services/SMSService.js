/**
 * SMS Service
 * Provider-agnostic SMS interface with mock implementation
 * Ready for real SMS provider integration
 */

/**
 * SMS Provider Interface
 * Implement this interface for different SMS providers
 */
class SMSProvider {
  async send(phoneNumber, message) {
    throw new Error('SMS provider not implemented');
  }
}

/**
 * Mock SMS Provider (for development/testing)
 * Logs SMS instead of sending
 */
class MockSMSProvider extends SMSProvider {
  async send(phoneNumber, message) {
    console.log('📱 [MOCK SMS]', {
      to: phoneNumber,
      message: message,
      timestamp: new Date().toISOString(),
    });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      provider: 'mock',
      message_id: `mock_${Date.now()}`,
    };
  }
}

/**
 * Twilio SMS Provider (example - not implemented)
 */
class TwilioSMSProvider extends SMSProvider {
  constructor(accountSid, authToken, fromNumber) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async send(phoneNumber, message) {
    // TODO: Implement Twilio integration
    // const client = require('twilio')(this.accountSid, this.authToken);
    // return await client.messages.create({
    //   body: message,
    //   from: this.fromNumber,
    //   to: phoneNumber,
    // });
    throw new Error('Twilio provider not yet implemented');
  }
}

/**
 * SMS Service
 * Uses provider from environment or defaults to mock
 */
class SMSService {
  constructor() {
    const providerType = process.env.SMS_PROVIDER || 'mock';
    
    if (providerType === 'twilio') {
      this.provider = new TwilioSMSProvider(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
        process.env.TWILIO_FROM_NUMBER
      );
    } else {
      // Default to mock
      this.provider = new MockSMSProvider();
    }
  }

  async send(phoneNumber, message) {
    try {
      return await this.provider.send(phoneNumber, message);
    } catch (error) {
      console.error('SMS send error:', error);
      throw error;
    }
  }
}

export const sendSMS = async (phoneNumber, message) => {
  const service = new SMSService();
  return await service.send(phoneNumber, message);
};

export default {
  sendSMS,
};




