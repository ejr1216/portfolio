/* Single source of truth for every KPI on the site. Loaded as a script so it works from file:// and GitHub Pages alike. Edit numbers here, never in index.html. */
window.IMPACT = {
  "_comment": "Single source of truth for every KPI rendered on the site. The page computes live values from this file at load time. Dates are America/Chicago calendar days. Edit numbers here, never in index.html.",
  "asOf": "2026-09-14",
  "lastUpdatedLabel": "September 14, 2026",
  "hourlyRate": 25,
  "impliedInvestmentUsd": 167300,
  "_impliedInvestmentNote": "Backed out of the January 2026 figures (2,716,525 / 16.24). ROI on the page = (cumulative savings - investment) / investment.",
  "anchor": {
    "date": "2026-01-27",
    "hours": 77615,
    "reviews5star": 55200,
    "vocCases": 273340,
    "_note": "Hours and reviews are the values the site showed when it was last published on 2026-01-27. vocCases was re-based 2026-09-14 per the owner: about 350,000 cases on 2026-09-14 (120k per year since October 2023), so the anchor is 350,000 minus 230 days x 333.3. Everything accrues from the daily rates below."
  },
  "baseDailyRates": {
    "hours": 119.3,
    "reviews5star": 115,
    "vocCases": 333.3,
    "_note": "119.3 hrs/day = 89.3/day (VoC intake, since Oct 2023) + 30/day (Dec 2025 additions). Unchanged from the January model."
  },
  "increments": [
    {
      "name": "Daily CSI sweep, 18 OEM portals, 107 store/department lines",
      "start": "2026-07-23",
      "hoursPerDay": 8.0,
      "basis": "107 lines x ~4.5 min manual portal work per line, daily"
    },
    {
      "name": "KIA Survey Ledger importer (4 Smartsheets, daily delta)",
      "start": "2026-08-18",
      "hoursPerDay": 1.5,
      "basis": "~2,300 outcome rows/week keyed by hand"
    },
    {
      "name": "Weekly Operations Report (3 PDFs, decks, audit workbook)",
      "start": "2026-09-09",
      "hoursPerDay": 1.15,
      "basis": "8 analyst hours per Sunday"
    },
    {
      "name": "Social Review Processor (daily 05:00 + Wednesday weekly)",
      "start": "2026-09-10",
      "hoursPerDay": 3.5,
      "basis": "~90 reviews/day classified, Google-verified, reported, emailed"
    },
    {
      "name": "Daily CX Huddle (12 team emails, Mon-Sat)",
      "start": "2026-09-11",
      "hoursPerDay": 4.3,
      "basis": "12 emails x 25 min, six days a week"
    },
    {
      "name": "Live Reputation.com pull (66 locations)",
      "start": "2026-09-14",
      "hoursPerDay": 0.85,
      "basis": "replaces a manual export + reshape every morning"
    }
  ],
  "goals": {
    "hours": 150000,
    "savingsUsd": 5000000,
    "reviews5star": 100000,
    "vocCases": 500000,
    "productionAutomations": 50,
    "uipathWorkflows": 100
  },
  "static": {
    "productionAutomations": 33,
    "_productionAutomationsNote": "18 OEM extraction packages + 15 supporting automations (CX Huddle, review processor daily, review processor weekly, operations report, KIA ledger importer, Mazda ledger importer, scoreboard write-back, executive summary, OneDrive mirror + sync guard, coverage healer, session keepalive, Stellantis morning login, OTP relay, reputation pull, report downloads).",
    "uipathWorkflows": 33,
    "_uipathNote": "Carried over from January 2026; no newer count available.",
    "oemPortals": 18,
    "brands": 19,
    "locations": 71,
    "csiStores": 54,
    "dailyCsiLines": 107,
    "huddleTeams": 12,
    "reputationLocations": 66,
    "reviewsPerDay": 90,
    "reviewsPerMonth": 2600,
    "sweepMinutes": 112,
    "otpLoginsAutomatedPerSweep": 11,
    "systemdUnits": 20,
    "pythonLoc": 63000,
    "srcRegressionTests": 268,
    "kiaLedgerChecks": 20431,
    "teamSize": 21,
    "annualRequests": 120000,
    "uptimePct": 99.9,
    "adoptionPct": 100,
    "csiImprovementPct": 15,
    "retentionGrowthPct": 12.5,
    "surveyCsiLiftPct": 10,
    "surveyReachLiftPct": 20,
    "csatPoints": 5,
    "reviewResponseRatePct": 99,
    "googleRatingFrom": 4.6,
    "googleRatingTo": 4.7,
    "newGoogleReviews": 5000
  },
  "sources": {
    "resume": "Eduardo_J_Rodriguez_Ford_Director_AI_Strategy_Resume.docx (2026-09-10): 71 locations, +15% CSI, +12.5% retention, 99.9% uptime, 120k+ requests/yr, team of 21, 100% adoption, +5 CSAT, +10% CSI and +20% reach from survey automation",
    "csiRepo": "github.com/ejr1216/csi-report-automation: 18 *_automation packages, 107 lines/day in DAILY CSI.xlsx, 51k tracked Python lines, 87 commits since 2026-07-23",
    "srcRepo": "github.com/ejr1216/SRC-Department: 12k Python lines, 268/268 regression baseline, ~90 reviews/day",
    "systemd": "20 csi-*/src-* user units on the production Linux host",
    "nadaArticle": "Auto Remarketing, January 2026: 99% response rate, 4.6 to 4.7 stars, 63 dealerships at the time"
  }
};
