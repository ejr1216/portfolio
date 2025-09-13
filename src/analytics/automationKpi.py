from __future__ import annotations
from pathlib import Path
import pandas as pd

def loadProjects(csvPath: Path) -> pd.DataFrame:
    df = pd.read_csv(csvPath)
    # normalize headers like "Start Date", "start_date", etc.
    rename = {c: c.strip().lower().replace(" ", "").replace("_", "") for c in df.columns}
    df.columns = [rename[c] for c in df.columns]
    aliases = {
        "startdate": "startDate",
        "hourssavedperweek": "hoursSavedPerWeek",
    }
    df = df.rename(columns={k: v for k, v in aliases.items() if k in df.columns})
    df["startDate"] = pd.to_datetime(df["startDate"])
    return df

def expandMonthly(dfProjects: pd.DataFrame, months: int = 12, hourlyRate: float = 40.0) -> pd.DataFrame:
    end = pd.Timestamp.today().to_period("M")
    monthsIdx = pd.period_range(end - (months - 1), end, freq="M")
    rows = []
    for _, r in dfProjects.iterrows():
        for m in monthsIdx:
            if m.to_timestamp(how="end") >= r["startDate"]:
                monthlyHours = float(r["hoursSavedPerWeek"]) * 4.33
                rows.append({
                    "month": m.to_timestamp(),
                    "project": r["project"],
                    "owner": r.get("owner", ""),
                    "tool": r.get("tool", ""),
                    "status": r.get("status", ""),
                    "monthlyHours": monthlyHours,
                    "monthlyCostSaved": monthlyHours * hourlyRate
                })
    return pd.DataFrame(rows)

def computeKpis(monthly: pd.DataFrame) -> dict:
    totalHours = float(monthly["monthlyHours"].sum()) if not monthly.empty else 0.0
    totalCost = float(monthly["monthlyCostSaved"].sum()) if not monthly.empty else 0.0
    fteSaved = round(totalHours / 2080, 2) if totalHours else 0.0
    avgMonthly = round(monthly.groupby("month")["monthlyHours"].sum().mean(), 1) if not monthly.empty else 0.0
    return {
        "totalHours": round(totalHours, 1),
        "totalCost": round(totalCost, 2),
        "fteSaved": fteSaved,
        "avgMonthlyHours": avgMonthly
    }

def monthlySummary(monthly: pd.DataFrame) -> pd.DataFrame:
    return (monthly.groupby("month", as_index=False)
            .agg(hours=("monthlyHours", "sum"), cost=("monthlyCostSaved", "sum")))

def projectLeaderboard(monthly: pd.DataFrame) -> pd.DataFrame:
    return (monthly.groupby("project", as_index=False)
            .agg(hours=("monthlyHours", "sum"), cost=("monthlyCostSaved", "sum"))
            .sort_values("hours", ascending=False))
