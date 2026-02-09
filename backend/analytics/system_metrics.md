# System Metrics (Portfolio-Safe)

This document describes the metrics used for analytics. All analytics use **synthetic/anonymized** data only.

## Data Sources (Synthetic)

- **synthetic_scans.json** – Simulated NFC tap log rows: member_id, card_uid, vendor_id, pos_reader_id, tap_timestamp, validation_result, fraud_score, latency_ms.
- **synthetic_fraud_events.json** – Simulated fraud events: event_type (rapid_repeat, cross_vendor_burst, frequency_anomaly, geo_inconsistency), severity, fraud_score.

## KPIs

| KPI | Description |
|-----|-------------|
| Total scans per day/week/month | Count of validation requests in the period. |
| Unique members scanned | Distinct member_id in the period. |
| Top vendors by scan volume | Vendor_id ranked by scan count. |
| Success vs failure validations | validation_result: approved vs rejected/restricted. |
| Redemption rates | (Optional) Derived from offer_applied in tap logs when present. |
| Suspicious activity per rule | Count of fraud_events by event_type. |
| Average validation latency | Mean of validation_latency_ms from audit logs or synthetic latency_ms. |

## Validation Latency (Production)

In production, validation latency is recorded in **audit_logs.details** for action `nfc_validation_request` as `validation_latency_ms`. Analytics can aggregate this for average latency; no PII is required (vendor_id and card_uid can be anonymized for reporting).

## Fraud Rules

- **Rapid repeat** – Same card scanned multiple times in a short window.
- **Cross-vendor burst** – Same card at multiple vendors in an implausible time.
- **Frequency anomaly** – Scan rate above a threshold (e.g. per hour/day).
- **Geo inconsistency** – Tap location vs member/vendor country/city.

Counts per rule are available from **fraud_events** (or synthetic equivalent) for portfolio dashboards.
