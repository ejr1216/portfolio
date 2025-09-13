# Advanced Portfolio

Clean repo structure with KPIs, charts, CI, and GitHub Pages.

## Badges
[![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
[![Update KPIs](https://github.com/USERNAME/REPO/actions/workflows/update_kpis.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/update_kpis.yml)

## Structure
```
.github/workflows/   CI + KPI updater
src/analytics/       KPI logic
scripts/             generateKpiCharts.py
tests/               pytest
docs/                GitHub Pages site
docs/charts/         auto charts
data/                sampleData.csv (replace with your data)
configs/             future configs
notebooks/           optional notebooks
```

## Quickstart
```
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python scripts/generateKpiCharts.py
```

This will:
- build charts in `docs/charts/`
- write a KPI summary to `docs/index.md`
- you can enable GitHub Pages and point it at `/docs`.