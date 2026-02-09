#!/usr/bin/env python3
"""
Transaction KPI analysis on SYNTHETIC data only (portfolio-safe).
Requires: pandas, matplotlib. Install: pip install pandas matplotlib
Output: analytics/output/kpi_results.png, kpi_summary.json
"""

import json
import os
from datetime import datetime
from pathlib import Path

try:
    import pandas as pd
    import matplotlib.pyplot as plt
except ImportError:
    print("Install: pip install pandas matplotlib")
    raise

BASE = Path(__file__).resolve().parent
OUTPUT = BASE / "output"
SCANS_PATH = OUTPUT / "synthetic_scans.json"

def load_scans():
    if not SCANS_PATH.exists():
        print("Run synthetic_data_generator.js first to create synthetic_scans.json")
        return pd.DataFrame()
    with open(SCANS_PATH) as f:
        data = json.load(f)
    return pd.DataFrame(data)

def run_kpis(df):
    if df.empty:
        return {}
    df["tap_timestamp"] = pd.to_datetime(df["tap_timestamp"])
    df["date"] = df["tap_timestamp"].dt.date
    df["week"] = df["tap_timestamp"].dt.isocalendar().week
    df["month"] = df["tap_timestamp"].dt.to_period("M").astype(str)

    total_scans = len(df)
    unique_members = df["member_id"].nunique()
    success = (df["validation_result"] == "approved").sum()
    failed = total_scans - success
    success_rate = (success / total_scans * 100) if total_scans else 0

    scans_per_day = df.groupby("date").size()
    scans_per_week = df.groupby("week").size()
    scans_per_month = df.groupby("month").size()

    top_vendors = df.groupby("vendor_id").size().sort_values(ascending=False).head(10)
    avg_latency = df["latency_ms"].mean() if "latency_ms" in df.columns else None

    kpis = {
        "total_scans": int(total_scans),
        "unique_members_scanned": int(unique_members),
        "success_validations": int(success),
        "failure_validations": int(failed),
        "success_rate_pct": round(success_rate, 2),
        "scans_per_day_avg": round(float(scans_per_day.mean()), 2),
        "scans_per_week_avg": round(float(scans_per_week.mean()), 2),
        "scans_per_month_avg": round(float(scans_per_month.mean()), 2),
        "top_vendors_by_scan_volume": top_vendors.to_dict(),
        "avg_validation_latency_ms": round(avg_latency, 2) if avg_latency is not None else None,
    }
    return kpis, df

def plot_kpis(df, kpis):
    if df.empty or not kpis:
        return
    OUTPUT.mkdir(parents=True, exist_ok=True)

    fig, axes = plt.subplots(2, 2, figsize=(10, 8))

    # Scans over time (by day)
    if "date" in df.columns:
        daily = df.groupby("date").size()
        axes[0, 0].bar(range(len(daily)), daily.values, color="steelblue", alpha=0.8)
        axes[0, 0].set_title("Scans per day")
        axes[0, 0].set_ylabel("Count")

    # Validation result distribution
    if "validation_result" in df.columns:
        res = df["validation_result"].value_counts()
        axes[0, 1].pie(res.values, labels=res.index, autopct="%1.1f%%", startangle=90)
        axes[0, 1].set_title("Validation result")

    # Top vendors
    if "top_vendors_by_scan_volume" in kpis:
        tv = kpis["top_vendors_by_scan_volume"]
        axes[1, 0].barh(list(tv.keys()), list(tv.values()), color="coral", alpha=0.8)
        axes[1, 0].set_title("Top vendors by scan volume")
        axes[1, 0].set_xlabel("Scans")

    # Latency if present
    if "latency_ms" in df.columns:
        axes[1, 1].hist(df["latency_ms"], bins=20, color="seagreen", alpha=0.8, edgecolor="black")
        axes[1, 1].set_title("Validation latency (ms)")
        axes[1, 1].set_xlabel("ms")

    plt.tight_layout()
    out_path = OUTPUT / "kpi_results.png"
    plt.savefig(out_path, dpi=100, bbox_inches="tight")
    plt.close()
    print("Saved", out_path)

def main():
    df = load_scans()
    kpis, _ = run_kpis(df)
    if not kpis:
        return
    # Remove non-serializable for JSON
    kpis_export = {k: v for k, v in kpis.items() if k != "top_vendors_by_scan_volume"}
    kpis_export["top_vendors_by_scan_volume"] = {str(k): int(v) for k, v in kpis.get("top_vendors_by_scan_volume", {}).items()}
    with open(OUTPUT / "kpi_summary.json", "w") as f:
        json.dump(kpis_export, f, indent=2)
    print("KPIs:", json.dumps(kpis_export, indent=2))
    plot_kpis(df, kpis)

if __name__ == "__main__":
    main()
