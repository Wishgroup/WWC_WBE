/**
 * Integration Example
 * Shows how to integrate the backend with your frontend or POS system
 */

// Example 1: NFC Validation from Vendor POS System
async function validateNFCTap(cardUid, vendorCode, posReaderId, transactionAmount = null) {
  try {
    const response = await fetch('http://localhost:3001/api/nfc/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vendor-API-Key': vendorCode, // Your vendor API key
      },
      body: JSON.stringify({
        cardUid,
        posReaderId,
        latitude: 25.2048, // Optional: GPS coordinates
        longitude: 55.2708,
        transactionAmount, // Optional: For offer calculation
      }),
    });

    const result = await response.json();

    if (result.approved) {
      console.log('✅ Card approved');
      console.log('Member ID:', result.memberId);
      console.log('Membership Type:', result.membershipType);
      
      if (result.offer) {
        console.log('🎁 Offer Applied:');
        console.log('  - Offer Code:', result.offer.offerCode);
        console.log('  - Discount:', result.offer.discountPercentage || result.offer.discountAmount);
      }
      
      return {
        success: true,
        approved: true,
        offer: result.offer,
        currency: result.currency,
      };
    } else {
      console.log('❌ Card rejected:', result.reason);
      return {
        success: false,
        approved: false,
        reason: result.reason,
      };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Example 2: Admin - Get Fraud Logs
async function getFraudLogs(adminApiKey, filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(
      `http://localhost:3001/api/admin/fraud/logs?${queryParams}`,
      {
        headers: {
          'X-Admin-API-Key': adminApiKey,
        },
      }
    );

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching fraud logs:', error);
    return [];
  }
}

// Example 3: Admin - Block Card
async function blockCard(adminApiKey, cardUid, reason) {
  try {
    const response = await fetch('http://localhost:3001/api/admin/cards/block', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiKey,
      },
      body: JSON.stringify({
        cardUid,
        reason,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error blocking card:', error);
    return { success: false, error: error.message };
  }
}

// Example 4: Admin - Get Vendor Analytics
async function getVendorAnalytics(adminApiKey, vendorId = null) {
  try {
    const url = vendorId
      ? `http://localhost:3001/api/admin/vendors/analytics?vendorId=${vendorId}`
      : 'http://localhost:3001/api/admin/vendors/analytics';

    const response = await fetch(url, {
      headers: {
        'X-Admin-API-Key': adminApiKey,
      },
    });

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    return [];
  }
}

// Example 5: Admin - Update Country Rules
async function updateCountryRules(adminApiKey, countryCode, rules) {
  try {
    const response = await fetch('http://localhost:3001/api/admin/country-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiKey,
      },
      body: JSON.stringify({
        countryCode,
        countryName: rules.countryName,
        allowedMembershipTypes: rules.allowedMembershipTypes,
        maxDiscountPercentage: rules.maxDiscountPercentage,
        currency: rules.currency,
        taxRules: rules.taxRules,
        complianceRestrictions: rules.complianceRestrictions,
        blackoutPeriods: rules.blackoutPeriods,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating country rules:', error);
    return { success: false, error: error.message };
  }
}

// Example Usage
async function exampleUsage() {
  console.log('📱 Example: NFC Validation');
  await validateNFCTap('CARD123456789', 'VENDOR001', 'POS001', 100.00);

  console.log('\n📊 Example: Get Fraud Logs');
  const fraudLogs = await getFraudLogs('your_admin_api_key', {
    severity: 'high',
    resolved: 'false',
  });
  console.log('High severity fraud events:', fraudLogs.length);

  console.log('\n🔒 Example: Block Card');
  await blockCard('your_admin_api_key', 'CARD123456789', 'suspicious_activity');

  console.log('\n📈 Example: Vendor Analytics');
  const analytics = await getVendorAnalytics('your_admin_api_key');
  console.log('Vendor analytics:', analytics);
}

// Export for use in other files
export {
  validateNFCTap,
  getFraudLogs,
  blockCard,
  getVendorAnalytics,
  updateCountryRules,
};

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage();
}





