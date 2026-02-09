# Analytics (Portfolio-Safe)

This folder contains **synthetic/anonymized** analytics only. **No real customer or member data** is used.

## Contents

- **synthetic_data_generator.js** – Generates anonymized sample scan/redemption data for analysis.
- **transaction_kpi_analysis.py** – Computes KPIs (scans per day/week/month, unique members, top vendors, success vs failure, redemption rates).
- **fraud_rule_analysis.py** – Counts suspicious activity per rule (rapid repeat, cross-vendor burst, frequency anomalies).
- **system_metrics.md** – Documents metrics and how they are derived (e.g. validation latency from audit logs).

## Running

1. Generate synthetic data (Node):
   ```bash
   node analytics/synthetic_data_generator.js
   ```
   Output: `analytics/output/synthetic_scans.json`, `synthetic_fraud_events.json`

2. Run KPI analysis (Python 3, requires pandas, matplotlib):
   ```bash
   pip install pandas matplotlib
   python analytics/transaction_kpi_analysis.py
   ```
   Output: `analytics/output/kpi_results.png`, `kpi_summary.json`

3. Run fraud rule analysis:
   ```bash
   python analytics/fraud_rule_analysis.py
   ```
   Output: `analytics/output/fraud_rule_summary.json`

## KPIs

- Total scans per day/week/month
- Unique members scanned
- Top vendors by scan volume
- Success vs failure validations
- Redemption rates
- Suspicious activity counts per rule
- Average validation latency (when available from logs)
