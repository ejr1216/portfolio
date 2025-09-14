from pathlib import Path
from src.analytics.automationKpi import loadProjects, expandMonthly, computeKpis

def test_automation_pipeline():
    data_path = Path("data/automationProjects.csv")
    projects = loadProjects(data_path)
    assert len(projects) > 0
    monthly = expandMonthly(projects, months=12, hourlyRate=22.0)
    assert len(monthly) > 0
    kpis = computeKpis(monthly)
    assert kpis["totalHours"] > 0
    print(f" Test passed! Total impact: {kpis['totalHours']:.0f} hours")
