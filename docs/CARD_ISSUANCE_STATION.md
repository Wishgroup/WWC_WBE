# Card Issuance Station Setup Guide

**Purpose**: Guide for setting up the Windows-based card issuance station with ACR1252U reader for DESFire EV2 card credential writing.

---

## Hardware Requirements

1. **Windows PC** (Windows 10/11 recommended)
2. **ACR1252U USB NFC Reader** (ACS ACR1252U)
3. **DESFire EV2 Cards** (MIFARE DESFire EV2, Option 3)

---

## Software Setup

### 1. Install ACR1252U Drivers

1. Download drivers from ACS website: https://www.acs.com.hk/en/driver/3/acr1252u-usb-nfc-reader/
2. Install drivers on Windows PC
3. Connect ACR1252U via USB
4. Verify device appears in Device Manager

### 2. Install Issuer Bridge Application

The Issuer Bridge is a local service that runs on the Windows issuance station. It provides a bridge between the backend API and the physical card writer.

**Requirements**:
- Node.js 18+ installed
- ACR1252U drivers installed
- Network access to backend API

**Installation**:

```bash
# Create issuer bridge directory
mkdir c:\wwc-issuer-bridge
cd c:\wwc-issuer-bridge

# Install dependencies
npm install pcsc-lite acr1252u-driver express
```

**Issuer Bridge Contract**:

The bridge should expose a local HTTP endpoint that the admin dashboard can call:

```
POST http://localhost:3002/issuer/write
Content-Type: application/json

{
  "payload": "{...}",  // JSON payload from prepare endpoint
  "signature": "...",  // HMAC-SHA256 signature
  "card_public_id": "CARD_..."
}
```

**Response**:
```json
{
  "success": true,
  "card_uid": "04:XX:XX:XX:XX:XX:XX",
  "message": "Card written successfully"
}
```

---

## Card Issuance Workflow

### Step 1: Admin Prepares Credential

1. Admin logs into admin dashboard
2. Navigates to "Card Management" → "Card Issuance"
3. Enters Member ID
4. Clicks "Prepare Credential"
5. System generates:
   - `card_public_id`
   - `payload` (JSON)
   - `signature` (HMAC-SHA256)
   - `session_id`

### Step 2: Write to Physical Card

1. Admin copies payload and signature
2. Opens Issuer Bridge application on Windows station
3. Connects ACR1252U reader
4. Taps physical DESFire EV2 card
5. Bridge writes payload + signature to card
6. Bridge returns card UID

### Step 3: Confirm Issuance

1. Admin enters:
   - Session ID (from prepare step)
   - Card UID (from reader)
2. Clicks "Confirm Issuance"
3. System:
   - Verifies signature
   - Updates card record in database
   - Marks issue session as 'confirmed'

---

## Card Credential Structure

### Payload (JSON stored on card)

```json
{
  "member_public_id": "MEM_1234567890_ABCDEF",
  "card_public_id": "CARD_1234567890_ABCDEF",
  "tier": "annual",
  "expires_at": "2026-12-31T23:59:59.000Z",
  "key_version": 1,
  "nonce": "a1b2c3d4e5f6...",
  "issued_at": "2025-01-15T10:30:00.000Z"
}
```

### Signature

- Algorithm: HMAC-SHA256
- Secret: `CARD_SIGNING_SECRET_v1` (from environment)
- Format: Base64-encoded
- Verification: Backend verifies signature matches payload

---

## Security Notes

1. **Card Signing Secret**: Must be at least 32 characters, stored securely
2. **Key Versioning**: Supports key rotation via `CARD_SIGNING_SECRET_v2`, etc.
3. **UID Usage**: Card UID is used for audit only, NOT for identity
4. **Signature Verification**: All card validations verify signature, not just UID lookup

---

## Issuer Bridge Implementation Example

```javascript
// issuer-bridge.js (example)
const express = require('express');
const pcsc = require('pcsc-lite');
const app = express();

app.use(express.json());

app.post('/issuer/write', async (req, res) => {
  const { payload, signature, card_public_id } = req.body;
  
  try {
    // Connect to ACR1252U
    const reader = await connectToReader();
    
    // Wait for card tap
    const card = await waitForCard(reader);
    const cardUid = card.getUID();
    
    // Write payload to DESFire EV2 card
    await writeToCard(card, payload, signature);
    
    res.json({
      success: true,
      card_uid: cardUid,
      message: 'Card written successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3002, () => {
  console.log('Issuer Bridge running on http://localhost:3002');
});
```

---

## Troubleshooting

### Card Not Detected
- Check ACR1252U USB connection
- Verify drivers installed correctly
- Try reconnecting reader

### Write Fails
- Verify card is DESFire EV2 (not DESFire EV1)
- Check card is not locked/protected
- Verify payload format is correct

### Signature Verification Fails
- Check `CARD_SIGNING_SECRET_v1` matches backend
- Verify payload JSON is valid
- Check key_version matches

---

## Testing

1. **Test Prepare**: Verify credential generation works
2. **Test Write**: Verify physical write succeeds
3. **Test Confirm**: Verify confirmation updates database
4. **Test Validation**: Verify card can be validated with signature

---

**Note**: The Issuer Bridge application is not included in this repository. It should be developed separately as a local Windows service that communicates with the ACR1252U reader.



