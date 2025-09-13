from pathlib import Path
from src.analytics.kpi import loadData, computeKpis, monthlySummary

def test_smoke():
    df = loadData(Path("data/sampleData.csv"))
    kpis = computeKpis(df)
    monthly = monthlySummary(df)
    assert kpis["totalSales"] > 0
    assert len(monthly) >= 1