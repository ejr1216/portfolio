# Eduardo J. Rodriguez: Automotive CX, AI and Automation

[![Portfolio](https://img.shields.io/badge/Portfolio-Live-0b2545?style=for-the-badge&logo=github)](https://ejr1216.github.io/portfolio)
[![Hours Saved](https://img.shields.io/badge/Hours%20Saved-105K%2B-0f4c3a?style=for-the-badge)](https://ejr1216.github.io/portfolio)
[![Savings](https://img.shields.io/badge/Cost%20Savings-%242.6M-b08d57?style=for-the-badge)](https://ejr1216.github.io/portfolio)
[![Updated](https://img.shields.io/badge/Updated-Sep%2014%2C%202026-555?style=for-the-badge)](https://ejr1216.github.io/portfolio)

**Live site:** [ejr1216.github.io/portfolio](https://ejr1216.github.io/portfolio)

National CX Director at a 71-location automotive group. I design and run the automation fleet that measures, routes, and improves customer experience: 18 OEM survey portals, every public review, every team, every morning.

## Impact (modeled from production automation logs, as of September 14, 2026)
- **105,000+** hours returned to the business (live counter on the site)
- **$2.6M** in cost savings at a $25/hr blended rate
- **24.3** FTE equivalent, running unattended
- **71** locations, **18** OEM portals, **107** CSI lines captured daily, **12** team huddles every morning

## Live demos (fictional data, production renderers)
- [Daily CX Huddle](https://ejr1216.github.io/portfolio/demos/cx-huddle.html): the per-team morning email with power rankings, priorities, rescores, and store scorecards
- [Daily Social Review Summary](https://ejr1216.github.io/portfolio/demos/social-review.html): the corporate review digest with the rendered report dashboard
- [Rooftop IQ](https://ejr1216.github.io/rooftop-iq-demo/): automotive intelligence platform teaser

## Systems in production
| Time (Central) | System | What it does |
| --- | --- | --- |
| 04:02 | Portal session mint | One-time passcode relayed through Smartsheet, no human in the loop |
| 05:00 | Social Review Processor | Pulls yesterday's reviews, classifies Sales / Service / Unknown, verifies live status on Google, emails the summary |
| 10:00 | Daily CSI sweep | 18 OEM portals, 107 store and department lines, self-healing coverage, executive summary, about 112 minutes |
| After the sweep, Mon to Sat | Daily CX Huddle | One designed email per team (12 teams) |
| Sunday | Operations report | All Ops, Fixed Ops, and Variable Ops PDFs with decks and an audit workbook |
| Every 30 min | Session keepalive | Keeps portal sessions alive across very different lifetimes |

## How the numbers work
`docs/data/impact.js` is the single source of truth. The page computes every live figure from an anchor date, a base daily rate, and per-automation increments with start dates, so the counters stay honest on any day the page is opened. Edit that file, never the HTML.

## Repository layout
```
docs/            GitHub Pages site (index.html, demos/, assets/, data/impact.js)
data/            automationProjects.csv, the project ledger behind scripts/generateAutomationKpis.py
scripts/         KPI generator used by CI
src/analytics/   KPI computation module
tests/           pytest suite run by CI
```

## Quick start
```bash
pip install -r requirements.txt
python scripts/generateAutomationKpis.py
python -m pytest tests/
```

## Contact
- Email: [ejr1216@icloud.com](mailto:ejr1216@icloud.com)
- LinkedIn: [linkedin.com/in/ejr1216](https://www.linkedin.com/in/ejr1216)
- GitHub: [github.com/ejr1216](https://github.com/ejr1216)
