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

  // Card Issuance (Phase 3)
  prepareCardIssuance: (memberId) => {
    return apiRequest('/api/admin/cards/prepare', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ memberId }),
    });
  },

  confirmCardIssuance: (sessionId, cardUid) => {
    return apiRequest('/api/admin/cards/confirm', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ sessionId, cardUid }),
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

  // Work Queue (Phase 2)
  getWorkQueue: () => {
    return apiRequest('/api/admin/work-queue', {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  // Bank Transfer Verification
  getBankTransfers: (status = 'all') => {
    return apiRequest(`/api/admin/bank-transfers?status=${status}`, {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  verifyBankTransfer: (orderId) => {
    return apiRequest(`/api/admin/bank-transfers/${orderId}/verify`, {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },

  rejectBankTransfer: (orderId, reason) => {
    return apiRequest(`/api/admin/bank-transfers/${orderId}/reject`, {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ reason }),
    });
  },

  // Events (upcoming events – shown on public Events page)
  getEvents: () => {
    return apiRequest('/api/events/admin', {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },
  createEvent: (body) => {
    return apiRequest('/api/events/admin', {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify(body),
    });
  },
  updateEvent: (id, body) => {
    return apiRequest(`/api/events/admin/${id}`, {
      method: 'PUT',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify(body),
    });
  },
  getEventCheckins: (eventId, limit = 100, offset = 0) => {
    return apiRequest(`/api/events/admin/${eventId}/checkins?limit=${limit}&offset=${offset}`, {
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
    });
  },
};

/**
 * Vendor API requests (Phase 4)
 */
export const vendorAPI = {
  // POS Readers
  getReaders: () => {
    return apiRequest('/api/vendor/readers');
  },

  registerReader: (readerData) => {
    return apiRequest('/api/vendor/readers', {
      method: 'POST',
      body: JSON.stringify(readerData),
    });
  },

  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/vendor/transactions?${params}`);
  },

  approveApplication: (applicationId, applicationType) => {
    return apiRequest(`/api/admin/applications/${applicationId}/approve`, {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ applicationType }),
    });
  },

  rejectApplication: (applicationId, applicationType, reason = '') => {
    return apiRequest(`/api/admin/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: {
        'X-Admin-API-Key': localStorage.getItem('admin_api_key') || 'dev_admin_api_key_change_in_production',
      },
      body: JSON.stringify({ applicationType, reason }),
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

  savePersonalInfo: (personalInfo) => {
    return apiRequest('/api/auth/save-personal-info', {
      method: 'POST',
      body: JSON.stringify(personalInfo),
    });
  },

  setPassword: (email, password) => {
    return apiRequest('/api/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  forgotPassword: (email) => {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: (token, email, password) => {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, password }),
    });
  },
};

/**
 * Member API
 */
export const memberAPI = {
  getMe: () => {
    return apiRequest('/api/members/me');
  },
  getRedemptions: () => {
    return apiRequest('/api/members/redemptions');
  },
  getEventCheckins: () => {
    return apiRequest('/api/members/event-checkins');
  },
  getVendors: () => {
    return apiRequest('/api/members/vendors');
  },
  getOffers: (membershipType) => {
    const params = membershipType ? `?membershipType=${membershipType}` : '';
    return apiRequest(`/api/members/offers${params}`);
  },
  reportCard: (cardUid, issueType) => {
    return apiRequest('/api/members/card/report', {
      method: 'POST',
      body: JSON.stringify({ cardUid, issueType }),
    });
  },
  blockCard: (cardUid) => {
    return apiRequest('/api/members/card/block', {
      method: 'POST',
      body: JSON.stringify({ cardUid }),
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

  // Bank Transfer Payment API
  submitBankTransfer: (formData) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/payment/bank-transfer`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData, // FormData object
    })
    .then(async (response) => {
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        throw new Error(`Server returned invalid response. Status: ${response.status}`);
      }
      
      if (!response.ok) {
        const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    })
    .catch((error) => {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Could not connect to server. Please check if the backend is running and try again.');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    });
  },

  getOrderStatus: (orderId) => {
    return apiRequest(`/api/payment/bank-transfer/receipt-status/${orderId}`);
  },
};

/**
 * Public Events API (no auth – for Events page)
 */
export const eventsAPI = {
  getUpcoming: () => apiRequest('/api/events'),
  getEvent: (eventId) => apiRequest(`/api/events/${eventId}`),
  register: (eventId) => {
    return apiRequest(`/api/events/${eventId}/register`, {
      method: 'POST',
    });
  },
};

/**
 * Contact & Subscription API
 */
export const contactAPI = {
  subscribe: (email) => {
    return apiRequest('/api/contact/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  submitInquiry: (inquiryData) => {
    return apiRequest('/api/contact/inquiry', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },
};

/**
 * Support Chat API
 */
export const supportAPI = {
  // Create a new support ticket
  createTicket: (subject, description) => {
    return apiRequest('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, description }),
    });
  },

  // Get all tickets (for member: their tickets, for admin: all tickets)
  getTickets: () => {
    return apiRequest('/api/support/tickets');
  },

  // Get a specific ticket with messages
  getTicket: (ticketId) => {
    return apiRequest(`/api/support/tickets/${ticketId}`);
  },

  // Send a message in a ticket
  sendMessage: (ticketId, message) => {
    return apiRequest(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Update ticket status (Admin only)
  updateTicketStatus: (ticketId, status, notes) => {
    return apiRequest(`/api/support/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // Get support statistics (Admin only)
  getStats: () => {
    return apiRequest('/api/support/stats');
  },
};

/**
 * Health Check
 */
export const healthCheck = () => {
  return apiRequest('/health');
};

