# Deprecated and Removed Items

Items removed or deprecated during the final product refactor. Do not reintroduce without review.

---

## Removed (dead code)

| Item | Reason |
|------|--------|
| **src/pages/Policy.css** | No corresponding Policy.jsx; file was never referenced. Removed in Phase 8. |

---

## Deprecated (kept for compatibility)

| Item | Notes |
|------|--------|
| **POST /api/nfc/validate (legacy body)** | Body `cardUid` + `posReaderId` (no payload/signature) still supported for backward compatibility. New flow uses `payload` + `signature` and returns `validationId` for redeem. |
| **X-Vendor-API-Key only** | POS device auth (X-POS-READER-ID + X-POS-DEVICE-KEY) is the final model; vendor API key remains supported. |
| **nfc_cards table** | Legacy card-by-UID. New credential model uses `cards` table (card_public_id). Both may coexist during migration. |

---

## Not deprecated

- Existing API response shape `{ success, ... }` is unchanged unless an endpoint explicitly adds fields (e.g. `allowed`, `next_action`).
- run.cjs and cPanel/Passenger deployment structure are unchanged.
- All current routes (frontend and backend) remain stable.
