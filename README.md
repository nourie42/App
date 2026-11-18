# Deal Desk

Private acquisition intake and commission-dealer screening for Daniel Nourie.

## Public site

The public GitHub Pages homepage is [https://nourie42.github.io/SunLiveSite/](https://nourie42.github.io/SunLiveSite/). It is the static `index.html` at the repo root (the casual greeting **what's up**).

To view that page locally, open `index.html` or serve the repo root:

```bash
python3 -m http.server 8000
```

- Read-only XLSX/CSV/TXT/Markdown import and JSON input/result export.
- Source-backed workbook audit, input guide and Sunoco research.
- Flat 10-year pretax unlevered company-operated portfolio screen; separate Sunoco and dealer economics.
- Missing input guards, transferable ancillary income, dissynergies, rent/commission cancellation, capex and explicit terminal cash.
- Optional authenticated AI review through the server-side ANTHROPIC_API_KEY and ANTHROPIC_MODEL settings. Without a key, copy the source packet to an approved AI chat and import JSON.

Not a native Excel engine or finished corporate underwriting model. No automated Excel writeback, tax, financing, persistent deal storage or site-by-site database in this version. All example data are fictional.

Validation: independent arithmetic review, input/missing data tests, TypeScript check, production build and browser input/import checks. Agent controls are feature-detected; browser test environment did not expose WebMCP. Live provider call awaits a configured API key.
