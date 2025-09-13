from pathlib import Path
from src.analytics.automationKpi import loadProjects, expandMonthly, computeKpis

def test_automation_pipeline():
    projects = loadProjects(Path("data/automationProjects.csv"))
    monthly = expandMonthly(projects, months=3, hourlyRate=40.0)
    kpis = computeKpis(monthly)
    assert len(monthly) > 0
    assert kpis["totalHours"] > 0
