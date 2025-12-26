# Admin Dashboard Guide

## Overview

The Admin Dashboard provides a comprehensive interface to manage all aspects of the Wish Waves Club backend system.

## Access

Navigate to `/admin` in your browser or click the "Admin" link in the header.

## Features

### 1. Fraud Monitoring Dashboard
- **Real-time fraud detection statistics**
- View fraud events by severity (High, Medium, Low)
- Filter fraud logs by severity and resolution status
- Resolve fraud events manually
- Monitor average fraud scores

### 2. Card Management
- **Block/Unblock NFC cards**
- Report cards as lost, stolen, or damaged
- Reissue cards with new UIDs
- View all blocked/inactive cards
- Manage card lifecycle

### 3. Vendor Analytics
- **Vendor performance metrics**
- View unique members per vendor
- Track total taps, approvals, and offers applied
- Monitor fraud scores by vendor
- Approval rate and offer usage statistics

### 4. Offer Management
- **Create and manage dynamic offers**
- Configure offer types (percentage, fixed amount)
- Set membership restrictions
- Configure vendor categories and country rules
- Activate/deactivate offers

### 5. Country Rules Management
- **Configure country-specific business rules**
- Set allowed membership types per country
- Configure maximum discount percentages
- Set currency and tax rules
- Manage compliance restrictions

### 6. NFC Test Interface
- **Test NFC validation in real-time**
- Simulate NFC taps with different parameters
- View validation results including:
  - Approval/rejection status
  - Member information
  - Applied offers
  - Fraud scores
- Test with different vendor API keys

### 7. Audit Logs
- **Complete system audit trail**
- View all system actions
- Filter by user type (admin, system, API)
- Track IP addresses and timestamps
- View detailed action logs

## API Configuration

The dashboard connects to the backend API. Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:3002
```

## Authentication

The dashboard uses API key authentication. The admin API key is stored in localStorage and defaults to:
- Development: `dev_admin_api_key_change_in_production`
- Production: Should be set via environment variable

## Backend Requirements

Ensure the backend server is running on port 3002 (or update `VITE_API_URL`):

```bash
cd backend
npm run dev
```

## Features Showcase

### Fraud Detection
- Real-time fraud scoring
- Geo-location validation
- Tap frequency monitoring
- Card sharing detection
- Expired/blocked card detection

### Dynamic Offers
- Real-time offer calculation
- Membership-based offers
- Vendor category restrictions
- Country rule compliance
- Time-based offers

### Multi-Country Support
- Country-specific rules
- Currency handling
- Tax rule configuration
- Compliance restrictions
- Blackout periods

### NFC Lifecycle Management
- Card issuance
- Blocking/unblocking
- Re-issuance with UID remapping
- Lost/stolen/damaged reporting
- Blacklist management

## Testing

Use the NFC Test Interface to:
1. Test card validation
2. Verify fraud detection
3. Test offer calculation
4. Validate country rules
5. Test different scenarios

## Support

For issues or questions, refer to:
- Backend documentation: `backend/README.md`
- API documentation: `backend/README.md`
- Database layout: `backend/database/DATABASE_LAYOUT.md`


