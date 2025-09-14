# scripts/generateAutomationKpis.py
from __future__ import annotations

import sys, json
from pathlib import Path
repoRoot = Path(__file__).resolve().parents[1]
if str(repoRoot) not in sys.path:
    sys.path.append(str(repoRoot))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

from src.analytics.automationKpi import (
    loadProjects, expandMonthly, computeKpis, monthlySummary, projectLeaderboard
)

def ensureDir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def saveFigure(figPath: Path, w: int = 1100, h: int = 520) -> None:
    plt.gcf().set_size_inches(w/100, h/100)
    plt.tight_layout()
    plt.savefig(figPath, dpi=150)
    plt.close()

def writeMarkdown(mdPath: Path, kpis: dict, charts: list[Path]) -> None:
    lines: list[str] = []
    lines += [
        "---",
        "title: Automation Impact",
        "layout: default",
        "---",
        '<link rel="stylesheet" href="assets/css/custom.css">',
        '<div class="hero">',
        "<h1>Automation Impact</h1>",
        "<p>Hours and cost saved from deployed automations</p>",
        '<a class="btn" href="projects.html">View Projects</a> ',
        '<a class="btn" href="highlights.html">Highlights</a>',
        "</div>",
        "## KPI Summary",
        "",
        "| KPI | Value |",
        "| --- | ---: |",
        f"| Total Hours Saved | {kpis['totalHours']:.1f} |",
        f"| Estimated Cost Saved | ${kpis['totalCost']:,.0f} |",
        f"| FTE Saved (est.) | {kpis['fteSaved']:.2f} |",
        f"| Avg Monthly Hours | {kpis['avgMonthlyHours']:.1f} |",
        "",
        "## Charts",
        '<div class="charts-grid">',
        '<canvas id="chartMonthly" height="150"></canvas>',
        '<canvas id="chartByProject" height="150"></canvas>',
        '<canvas id="chartCumulative" height="150"></canvas>',
        "</div>",
        "",
        "### Static image fallbacks",
    ]
    for p in charts:
        rel = p.relative_to(mdPath.parent).as_posix()
        lines += [f"![{p.stem}]({rel})", ""]
    lines += [
        '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
        '<script src="assets/js/kpis.js"></script>',
    ]
    mdPath.write_text("\n".join(lines))

def writeJson(jsonPath: Path, kpis: dict, monthAgg: pd.DataFrame, leaderboard: pd.DataFrame) -> None:
    payload = {
        "kpis": kpis,
        "monthly": [
            {"month": d.strftime("%Y-%m"), "hours": float(h), "cost": float(c)}
            for d, h, c in zip(monthAgg["month"], monthAgg["hours"], monthAgg["cost"])
        ],
        "leaderboard": [
            {"project": str(r["project"]), "hours": float(r["hours"]), "cost": float(r["cost"])}
            for _, r in leaderboard.iterrows()
        ],
    }
    jsonPath.write_text(json.dumps(payload, indent=2))

def main() -> None:
    dataPath = repoRoot / "data" / "automationProjects.csv"
    docsDir = repoRoot / "docs"
    chartsDir = docsDir / "charts"
    dataDir = docsDir / "data"
    ensureDir(docsDir); ensureDir(chartsDir); ensureDir(dataDir)

    projects = loadProjects(dataPath)
    monthly = expandMonthly(projects, months=12, hourlyRate=22.0)

    kpis = computeKpis(monthly)
    monthAgg = monthlySummary(monthly).sort_values("month").reset_index(drop=True)
    leaderboard = projectLeaderboard(monthly)

    # Static charts (cleaner typography and aspect ratios)
    plt.figure()
    plt.plot(monthAgg["month"], monthAgg["hours"], marker="o")
    plt.title("Monthly Hours Saved"); plt.xlabel("Month"); plt.ylabel("Hours")
    saveFigure(chartsDir / "monthly_hours_saved.png")

    plt.figure()
    plt.bar(leaderboard["project"], leaderboard["hours"])
    plt.title("Hours Saved by Project"); plt.xlabel("Project"); plt.ylabel("Hours")
    plt.xticks(rotation=20, ha="right")
    saveFigure(chartsDir / "hours_by_project.png")

    plt.figure()
    monthAgg["cumHours"] = monthAgg["hours"].cumsum()
    plt.plot(monthAgg["month"], monthAgg["cumHours"], marker="o")
    plt.title("Cumulative Hours Saved"); plt.xlabel("Month"); plt.ylabel("Hours")
    saveFigure(chartsDir / "cumulative_hours.png")

    writeJson(dataDir / "kpi.json", kpis, monthAgg, leaderboard)
    writeMarkdown(docsDir / "index.md", kpis, [
        chartsDir / "monthly_hours_saved.png",
        chartsDir / "hours_by_project.png",
        chartsDir / "cumulative_hours.png",
    ])

if __name__ == "__main__":
    main()
