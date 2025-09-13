from __future__ import annotations

import sys
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

def saveFigure(figPath: Path) -> None:
    plt.tight_layout()
    plt.savefig(figPath, dpi=150)
    plt.close()

def writeMarkdown(mdPath: Path, kpis: dict, charts: list[Path], monthly: pd.DataFrame, leaderboard: pd.DataFrame) -> None:
    lines: list[str] = []
    lines += [
        "---",
        "title: Portfolio KPIs",
        "layout: default",
        "---",
        '<link rel="stylesheet" href="/assets/css/custom.css">',
        '<div class="hero">',
        "<h1>Portfolio KPIs</h1>",
        "<p>Automation hours saved and impact</p>",
        '<a class="btn" href="https://github.com/ejr1216/portfolio">View on GitHub</a>',
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
    ]
    for p in charts:
        rel = p.relative_to(mdPath.parent).as_posix()
        lines += [f"![{p.stem}]({rel})", ""]
    lines += ["## Top Projects by Hours", "", "| Project | Hours | Cost |", "| --- | ---: | ---: |"]
    for _, r in leaderboard.iterrows():
        lines.append(f"| {r['project']} | {r['hours']:.1f} | ${r['cost']:,.0f} |")

    lines += ["", "## Monthly Summary", "", "| Month | Hours | Cost |", "| --- | ---: | ---: |"]
    for _, r in monthly.iterrows():
        lines.append(f"| {r['month'].strftime('%Y-%m')} | {r['hours']:.1f} | ${r['cost']:,.0f} |")

    mdPath.write_text("\n".join(lines))

def main() -> None:
    dataPath = repoRoot / "data" / "automationProjects.csv"
    docsDir = repoRoot / "docs"
    chartsDir = docsDir / "charts"
    ensureDir(docsDir)
    ensureDir(chartsDir)

    projects = loadProjects(dataPath)
    monthly = expandMonthly(projects, months=12, hourlyRate=40.0)
    kpis = computeKpis(monthly)
    monthAgg = monthlySummary(monthly)
    leaderboard = projectLeaderboard(monthly)

    # Chart 1: Monthly total hours
    plt.figure()
    plt.plot(monthAgg["month"], monthAgg["hours"], marker="o")
    plt.title("Monthly Hours Saved")
    plt.xlabel("Month")
    plt.ylabel("Hours")
    saveFigure(chartsDir / "monthly_hours_saved.png")

    # Chart 2: Hours by project
    plt.figure()
    plt.bar(leaderboard["project"], leaderboard["hours"])
    plt.title("Hours Saved by Project")
    plt.xlabel("Project")
    plt.ylabel("Hours")
    plt.xticks(rotation=25, ha="right")
    saveFigure(chartsDir / "hours_by_project.png")

    # Chart 3: Cumulative hours
    plt.figure()
    cum = monthAgg.sort_values("month").assign(cumHours=monthAgg["hours"].cumsum())
    plt.plot(cum["month"], cum["cumHours"], marker="o")
    plt.title("Cumulative Hours Saved")
    plt.xlabel("Month")
    plt.ylabel("Hours")
    saveFigure(chartsDir / "cumulative_hours.png")

    writeMarkdown(
        docsDir / "index.md",
        kpis,
        [
            chartsDir / "monthly_hours_saved.png",
            chartsDir / "hours_by_project.png",
            chartsDir / "cumulative_hours.png",
        ],
        monthAgg,
        leaderboard,
    )

if __name__ == "__main__":
    main()
