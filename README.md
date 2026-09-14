# Eduardo J. Rodriguez: Automotive CX, AI and Automation

[![Portfolio](https://img.shields.io/badge/Portfolio-Live-0b2545?style=for-the-badge&logo=github)](https://ejr1216.github.io/portfolio)
[![Hours Saved](https://img.shields.io/badge/Hours%20Saved-86K%2B-0f4c3a?style=for-the-badge)](https://ejr1216.github.io/portfolio)
[![Savings](https://img.shields.io/badge/Cost%20Savings-%242.9M-b08d57?style=for-the-badge)](https://ejr1216.github.io/portfolio)
[![Updated](https://img.shields.io/badge/Updated-Sep%2014%2C%202026-555?style=for-the-badge)](https://ejr1216.github.io/portfolio)

**Live site:** [ejr1216.github.io/portfolio](https://ejr1216.github.io/portfolio)

National CX Director at a 71-location automotive group. I design and run the automation fleet that measures, routes, and improves customer experience: 18 OEM survey portals, every public review, every team, every morning.

## Impact (modeled from production automation logs, as of September 14, 2026)
- **86,000+** hours returned to the business (live counter on the site)
- **$2.9M** in cost savings (January 2026 baseline, hours since then valued at $25/hr)
- **9.4** FTE equivalent, running unattended
- **71** locations, **18** OEM portals, **107** CSI lines captured daily, **12** team huddles every morning

## Live demos (fictional data, production renderers)
- [Daily CX Huddle](https://ejr1216.github.io/portfolio/demos/cx-huddle.html): the per-team morning email with power rankings, priorities, rescores, and store scorecards
- [Daily Social Review Summary](https://ejr1216.github.io/portfolio/demos/social-review.html): the corporate review digest with the rendered report dashboard
- [Rooftop IQ](https://ejr1216.github.io/rooftop-iq-demo/): automotive intelligence platform teaser

## Technology ecosystem
- **RPA:** UiPath, Power Automate, n8n, Zapier
- **AI/ML:** LLMs, vector databases, prompt engineering, model training
- **Data:** SQL, NoSQL, ETL, MongoDB, Snowflake, MySQL
- **Cloud:** Azure, AWS, GCP, Terraform
- **Dev:** Python, JavaScript, GitHub, Kubernetes, Docker, CI/CD
- **BI:** Power BI, Excel, Smartsheet, executive reporting

## How the numbers work
`docs/data/impact.js` is the single source of truth. The page computes every live figure from an anchor date (January 27, 2026), a base daily rate, and per-automation increments with start dates, so the counters stay honest on any day the page is opened. Savings start from the January cumulative figure and grow at $25 per hour saved. Edit that file, never the HTML.

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
