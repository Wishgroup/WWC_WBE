/**
 * API Service Layer
 * Centralized API calls to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Token getter function - set by AuthContext
let tokenGetter = null;

/**
 * Set token getter function (called from AuthContext)
 */
export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

/**
 * Generic API request helper
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from getter if available, otherwise try localStorage (for backward compatibility)
  let token = null;
  if (tokenGetter) {
    try {
      token = await tokenGetter();
    } catch (error) {
      console.error('Error getting token:', error);
    }
  } else {
    token = localStorage.getItem('token');
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:23',message:'Making API request',data:{endpoint,method:options.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const response = await fetch(url, config);
    const data = await response.json();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:27',message:'API response received',data:{status:response.status,ok:response.ok,hasSuccess:!!data?.success,hasUser:!!data?.user,dataKeys:Object.keys(data||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:30',message:'API request failed',data:{status:response.status,error:data.error,message:data.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:35',message:'Returning API data',data:{hasSuccess:!!data?.success,hasUser:!!data?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    return data;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfe73359-2dd7-4cb3-884a-a3bdccf851f1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:38',message:'API request exception',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
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
  /**
   * Sync Auth0 user with backend database
   */
  syncUser: async () => {
    return apiRequest('/api/auth/sync', {
      method: 'POST',
    });
  },

  /**
   * Get current authenticated user from backend
   */
  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },

  /**
   * Logout (for audit logging)
   */
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
};

/**
 * Health Check
 */
export const healthCheck = () => {
  return apiRequest('/health');
};

