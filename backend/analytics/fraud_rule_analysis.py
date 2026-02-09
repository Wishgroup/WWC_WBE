#!/usr/bin/env python3
"""
Fraud rule analysis on SYNTHETIC data only (portfolio-safe).
Counts suspicious activity per rule type. No real data.
Output: analytics/output/fraud_rule_summary.json
"""

import json
from pathlib import Path
from collections import Counter

BASE = Path(__file__).resolve().parent
OUTPUT = BASE / "output"
FRAUD_PATH = OUTPUT / "synthetic_fraud_events.json"

def main():
    if not FRAUD_PATH.exists():
        print("Run synthetic_data_generator.js first to create synthetic_fraud_events.json")
        return
    with open(FRAUD_PATH) as f:
        events = json.load(f)
    by_type = Counter(e["event_type"] for e in events)
    by_severity = Counter(e["severity"] for e in events)
    summary = {
        "total_suspicious_events": len(events),
        "count_by_rule_type": dict(by_type),
        "count_by_severity": dict(by_severity),
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT / "fraud_rule_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print("Fraud rule summary:", json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
