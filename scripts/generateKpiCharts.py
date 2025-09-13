# New Code: scripts/generateKpiCharts.py
from __future__ import annotations

import sys
from pathlib import Path

# allow running as a file or module
repoRoot = Path(__file__).resolve().parents[1]
if str(repoRoot) not in sys.path:
    sys.path.append(str(repoRoot))

import matplotlib
matplotlib.use("Agg")  # headless image writing
import matplotlib.pyplot as plt
import pandas as pd

from src.analytics.kpi import loadData, computeKpis, monthlySummary


def ensureDir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def saveFigure(figPath: Path) -> None:
    plt.tight_layout()
    plt.savefig(figPath, dpi=140)
    plt.close()


def writeMarkdown(mdPath: Path, kpis: dict, charts: list[Path], monthly: pd.DataFrame) -> None:
    lines: list[str] = []
    lines.append("# Portfolio KPIs")
    lines.append("")
    lines.append("| KPI | Value |")
    lines.append("| --- | ---: |")
    lines.append(f"| Total Sales | {kpis['totalSales']} |")
    lines.append(f"| Average CSAT | {kpis['avgCsat']} |")
    lines.append(f"| Conversion Rate | {kpis['conversionRate']}% |")
    lines.append(f"| Avg Response Minutes | {kpis['avgResponseMinutes']} |")
    lines.append(f"| Total Leads | {kpis['totalLeads']} |")
    lines.append(f"| Total Appointments | {kpis['totalAppointments']} |")
    lines.append(f"| Total Showings | {kpis['totalShowings']} |")
    lines.append(f"| Total Revenue | ${kpis['totalRevenue']:,.0f} |")
    lines.append("")
    lines.append("## Charts")
    for p in charts:
        rel = p.relative_to(mdPath.parent).as_posix()
        lines.append(f"![{p.stem}]({rel})")
        lines.append("")
    lines.append("## Monthly Summary")
    lines.append("")
    header = ["month", "leads", "appointments", "showings", "sales", "csat", "responseMinutes", "revenue"]
    lines.append("| " + " | ".join(h.capitalize() for h in header) + " |")
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")
    for _, row in monthly.iterrows():
        values = [
            row["month"].strftime("%Y-%m"),
            int(row["leads"]),
            int(row["appointments"]),
            int(row["showings"]),
            int(row["sales"]),
            f"{row['csat']:.2f}",
            f"{row['responseMinutes']:.1f}",
            f"${row['revenue']:,.0f}",
        ]
        lines.append("| " + " | ".join(map(str, values)) + " |")
    mdPath.write_text("\n".join(lines))


def main() -> None:
    dataPath = repoRoot / "data" / "sampleData.csv"
    docsDir = repoRoot / "docs"
    chartsDir = docsDir / "charts"
    ensureDir(docsDir)
    ensureDir(chartsDir)

    df = loadData(dataPath)
    kpis = computeKpis(df)
    monthly = monthlySummary(df)

    plt.figure()
    plt.plot(monthly["month"], monthly["sales"], marker="o")
    plt.title("Monthly Sales")
    plt.xlabel("Month")
    plt.ylabel("Sales")
    saveFigure(chartsDir / "monthly_sales.png")

    plt.figure()
    plt.bar(monthly["month"].dt.strftime("%Y-%m"), monthly["csat"])
    plt.title("CSAT by Month")
    plt.xlabel("Month")
    plt.ylabel("CSAT")
    plt.xticks(rotation=45, ha="right")
    saveFigure(chartsDir / "csat_by_month.png")

    plt.figure()
    stages = ["Leads", "Appointments", "Showings", "Sales"]
    totals = [monthly["leads"].sum(), monthly["appointments"].sum(), monthly["showings"].sum(), monthly["sales"].sum()]
    plt.bar(stages, totals)
    plt.title("Funnel Totals")
    plt.xlabel("Stage")
    plt.ylabel("Count")
    saveFigure(chartsDir / "funnel_totals.png")

    plt.figure()
    plt.plot(monthly["month"], monthly["responseMinutes"], marker="o")
    plt.title("Average Response Minutes")
    plt.xlabel("Month")
    plt.ylabel("Minutes")
    saveFigure(chartsDir / "response_minutes.png")

    writeMarkdown(
        docsDir / "index.md",
        kpis,
        [
            chartsDir / "monthly_sales.png",
            chartsDir / "csat_by_month.png",
            chartsDir / "funnel_totals.png",
            chartsDir / "response_minutes.png",
        ],
        monthly,
    )


if __name__ == "__main__":
    main()
