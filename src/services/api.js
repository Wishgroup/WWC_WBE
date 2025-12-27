/**
 * API Service Layer
 * Centralized API calls to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generic API request helper
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok before trying to parse JSON
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid response. Status: ${response.status}`);
    }
    
    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.response = { status: response.status, data };
      throw error;
    }
    
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Network error: Could not connect to server. Please check if the backend is running and try again.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    
    // Re-throw other errors
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Admin API requests
 */
export const adminAPI = {
  // Fraud Management
  getFraudLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/admin/fraud/logs?${params}`, {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  getFraudStats: () => {
    return apiRequest('/api/admin/fraud/stats', {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  resolveFraudEvent: (fraudEventId, resolutionNotes) => {
    return apiRequest('/api/admin/fraud/resolve', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ fraudEventId, resolutionNotes }),
    });
  },

  // Card Management
  getBlockedCards: () => {
    return apiRequest('/api/admin/cards/blocked', {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  blockCard: (cardUid, reason) => {
    return apiRequest('/api/admin/cards/block', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ cardUid, reason }),
    });
  },

  unblockCard: (cardUid) => {
    return apiRequest('/api/admin/cards/unblock', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ cardUid }),
    });
  },

  reissueCard: (oldCardUid, newCardUid) => {
    return apiRequest('/api/admin/cards/reissue', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ oldCardUid, newCardUid }),
    });
  },

  reportCard: (cardUid, reportType) => {
    return apiRequest('/api/admin/cards/report', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ cardUid, reportType }),
    });
  },

  // Vendor Analytics
  getVendorAnalytics: (vendorId = null) => {
    const url = vendorId 
      ? `/api/admin/vendors/analytics?vendorId=${vendorId}`
      : '/api/admin/vendors/analytics';
    return apiRequest(url, {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  // Country Rules
  updateCountryRules: (rulesData) => {
    return apiRequest('/api/admin/country-rules', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify(rulesData),
    });
  },

  // Audit Logs
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/admin/audit-logs?${params}`, {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },
};

/**
 * NFC Validation API
 */
export const nfcAPI = {
  validate: (cardUid, posReaderId, vendorApiKey, options = {}) => {
    return apiRequest('/api/nfc/validate', {
      method: 'POST',
      headers: {
        'X-Vendor-API-Key': vendorApiKey || 'VENDOR001',
      },
      body: JSON.stringify({
        cardUid,
        posReaderId,
        latitude: options.latitude,
        longitude: options.longitude,
        transactionAmount: options.transactionAmount,
      }),
    });
  },
};

/**
 * Authentication API
 */
export const authAPI = {
  register: (email, password, fullName, membershipType) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, membershipType }),
    });
  },

  login: (email, password, userType = 'member') => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:185',message:'authAPI.login called',data:{email,userType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType }),
    });
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return apiRequest('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  updateProfileIconStyle: (iconStyle) => {
    return apiRequest('/api/auth/profile-icon', {
      method: 'PUT',
      body: JSON.stringify({ iconStyle }),
    });
  },
};

/**
 * Payment API
 */
export const paymentAPI = {
  createSession: (userId, membershipType) => {
    return apiRequest('/api/payment/create-session', {
      method: 'POST',
      body: JSON.stringify({ userId, membershipType }),
    });
  },

  verifyPayment: (sessionId) => {
    return apiRequest(`/api/payment/verify/${sessionId}`);
  },

  // CC Avenue Payment API
  validateCard: (cardDetails) => {
    return apiRequest('/api/payment/ccavenue/validate-card', {
      method: 'POST',
      body: JSON.stringify({ cardDetails }),
    });
  },

  initiateCCAvenuePayment: (paymentData) => {
    return apiRequest('/api/payment/ccavenue/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};

/**
 * Health Check
 */
export const healthCheck = () => {
  return apiRequest('/health');
};

