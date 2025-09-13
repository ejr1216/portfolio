from __future__ import annotations
from pathlib import Path
import pandas as pd

def loadData(csvPath: Path) -> pd.DataFrame:
    df = pd.read_csv(csvPath, parse_dates=["date"])
    df = df.sort_values("date")
    return df

def computeKpis(df: pd.DataFrame) -> dict:
    totalSales = int(df["sales"].sum())
    avgCsat = round(float(df["csat"].mean()), 2)
    totalLeads = int(df["leads"].sum())
    totalAppointments = int(df["appointments"].sum())
    totalShowings = int(df["showings"].sum())
    conversionRate = round((df["sales"].sum() / df["leads"].sum()) * 100, 2) if df["leads"].sum() else 0.0
    avgResponseMinutes = round(float(df["responseMinutes"].mean()), 1)
    totalRevenue = float(df["revenue"].sum())
    kpis = {
        "totalSales": totalSales,
        "avgCsat": avgCsat,
        "conversionRate": conversionRate,
        "avgResponseMinutes": avgResponseMinutes,
        "totalLeads": totalLeads,
        "totalAppointments": totalAppointments,
        "totalShowings": totalShowings,
        "totalRevenue": totalRevenue,
    }
    return kpis

def monthlySummary(df: pd.DataFrame) -> pd.DataFrame:
    dfm = df.copy()
    dfm["month"] = dfm["date"].dt.to_period("M").dt.to_timestamp()
    group = dfm.groupby("month", as_index=False).agg({
        "leads": "sum",
        "appointments": "sum",
        "showings": "sum",
        "sales": "sum",
        "csat": "mean",
        "responseMinutes": "mean",
        "revenue": "sum"
    })
    group["csat"] = group["csat"].round(2)
    group["responseMinutes"] = group["responseMinutes"].round(1)
    return group