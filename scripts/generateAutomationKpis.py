#!/usr/bin/env python3
import sys
import json
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.analytics.automationKpi import (
    loadProjects, expandMonthly, computeKpis, monthlySummary, projectLeaderboard
)

def main():
    print(" Generating KPIs...")
    data_path = Path("data/automationProjects.csv")
    projects = loadProjects(data_path)
    monthly = expandMonthly(projects, months=12)
    kpis = computeKpis(monthly)
    month_summary = monthlySummary(monthly)
    leaderboard = projectLeaderboard(monthly)
    
    # Create JSON
    json_data = {
        "kpis": kpis,
        "monthly": [
            {"month": m.strftime("%Y-%m"), "hours": float(h), "cost": float(c)}
            for m, h, c in zip(month_summary["month"], month_summary["hours"], month_summary["cost"])
        ],
        "projects": [
            {"name": str(p), "hours": float(h), "cost": float(c)}
            for p, h, c in zip(leaderboard["project"], leaderboard["hours"], leaderboard["cost"])
        ]
    }
    
    json_path = Path("docs/data/kpi.json")
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(json_data, indent=2))
    print(f" KPIs generated: {kpis['totalHours']:.0f} hours saved")

if __name__ == "__main__":
    main()
