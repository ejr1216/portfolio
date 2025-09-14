from __future__ import annotations
from pathlib import Path
import pandas as pd

def loadProjects(csvPath: Path) -> pd.DataFrame:
    df = pd.read_csv(csvPath)
    norm = {c: c.strip().lower().replace(" ", "").replace("_", "") for c in df.columns}
    df.columns = [norm[c] for c in df.columns]
    rename = {
        "project": "project",
        "startdate": "startDate",
        "hourssavedperweek": "hoursSavedPerWeek",
        "employeesimpacted": "employeesImpacted",
        "hourlyrate": "hourlyRate",
        "owner": "owner",
        "status": "status",
        "tool": "tool",
        "costestusd": "costEstUsd",
    }
    df = df.rename(columns={k: v for k, v in rename.items() if k in df.columns})
    if "employeesImpacted" not in df.columns:
        df["employeesImpacted"] = 1
    if "hourlyRate" not in df.columns:
        df["hourlyRate"] = 22.0
    df["startDate"] = pd.to_datetime(df["startDate"])
    df["hoursSavedPerWeek"] = df["hoursSavedPerWeek"].astype(float)
    df["employeesImpacted"] = df["employeesImpacted"].astype(float)
    df["hourlyRate"] = df["hourlyRate"].astype(float)
    return df

def expandMonthly(dfProjects: pd.DataFrame, months: int = 12, hourlyRate: float = 22.0) -> pd.DataFrame:
    end = pd.Timestamp.today().to_period("M")
    monthsIdx = pd.period_range(end - (months - 1), end, freq="M")
    rows = []
    for _, r in dfProjects.iterrows():
        rate = float(r["hourlyRate"]) if "hourlyRate" in dfProjects.columns else float(hourlyRate)
        for m in monthsIdx:
            if m.to_timestamp(how="end") >= r["startDate"]:
                monthlyHours = float(r["hoursSavedPerWeek"]) * float(r["employeesImpacted"]) * 4.33
                rows.append({
                    "month": m.to_timestamp(),
                    "project": r.get("project", ""),
                    "monthlyHours": monthlyHours,
                    "monthlyCostSaved": monthlyHours * rate
                })
    return pd.DataFrame(rows)

def computeKpis(monthly: pd.DataFrame) -> dict:
    if monthly.empty:
        return {"totalHours": 0.0, "totalCost": 0.0, "fteSaved": 0.0, "avgMonthlyHours": 0.0}
    totalHours = float(monthly["monthlyHours"].sum())
    totalCost = float(monthly["monthlyCostSaved"].sum())
    fteSaved = round(totalHours / 2080, 2)
    avgMonthly = round(monthly.groupby("month")["monthlyHours"].sum().mean(), 1)
    return {"totalHours": round(totalHours, 1), "totalCost": round(totalCost, 2),
            "fteSaved": fteSaved, "avgMonthlyHours": avgMonthly}

def monthlySummary(monthly: pd.DataFrame) -> pd.DataFrame:
    return (monthly.groupby("month", as_index=False)
            .agg(hours=("monthlyHours", "sum"), cost=("monthlyCostSaved", "sum")))

def projectLeaderboard(monthly: pd.DataFrame) -> pd.DataFrame:
    return (monthly.groupby("project", as_index=False)
            .agg(hours=("monthlyHours", "sum"), cost=("monthlyCostSaved", "sum"))
            .sort_values("hours", ascending=False))
