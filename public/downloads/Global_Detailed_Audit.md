# Global worksheet forensic audit

Source: `Book1_ARKO_C32-C34_Filled.xlsx`, sole worksheet `Global`. Read-only review of every stored cell, all 287 formulas including shared-formula expansion, 27 styles, comments, workbook names, relationships, cached values and worksheet metadata. Independent evaluation used the worksheet's complete arithmetic/SUM/AVERAGE/IFERROR formula set. The workbook was not edited and was not recalculated by Excel.

## Decision

This is a useful inventory of synergy categories, but it is not a reusable, reliable acquisition screening engine in its present form. It does not implement the requested conversion to company-owned, dealer-commission operations. It cannot yet calculate a valid acquisition IRR, maximum purchase price, leverage, coverage, or consolidated synergy total. The three ARKO asset-count edits do not update a single financial formula.

The file still contains 2021/2022 historical financials, 2023 estimated financials, and legacy references to Global, GLP, GDSO and New England. It appears to be a legacy Global Partners/GLP analysis with ARKO asset-count annotations added, not a converted ARKO analysis. Verify target identity against the actual source financials before representing any monetary amount as ARKO or as a new deal.

Do not carry the example figures below into new-deal underwriting. They describe the uploaded file's mechanics and defects, not validated current synergies.

## What the worksheet actually contains

| Range | Purpose | What it currently does |
|---|---|---|
| A1:H28 | Synergy assumptions | Growth, terminal, supply, G&A, Opex, rebrand, optimization, IT and capital procurement assumptions |
| I2:R28 | Years 1–10, labeled EBITDA | Individual annual benefit lines. No subtotal. Includes capital procurement savings that should be separated from EBITDA |
| T2:AC28 | Years 1–10, labeled Capital | Some growth investment, working capital, severance, IT and rebranding cash outflows, plus a Year 10 working-capital recovery. No subtotal |
| B32:D34 | Asset count annotations | 1,057 COOP sites, 2,129 dealer supply sites, 2 pending-transaction terminals. None feeds a formula |
| I33:J36 | Other legacy site counts | 353 COOP, 295 commission, 192 lessee dealer, 833 contract dealer. None feeds a formula; conflicts with the ARKO count block |
| B41:K50 | Quarterly margin and maintenance estimates | Annualizes first-half 2023 and 2022, then adds a 2.5% full-year uplift labeled as 5% second-half backweighting |
| M41:Y49 | Historical margin context | 2018–2023 margins and station margin dollars. Disconnected reference data |
| B53:G95 | Historical and estimated P&L | 2021, 2022, selected two-year averages, a partial 2023 estimate, capex and comments |

The headline financial output is `F93 = F90 = F81-F84-F85`, or $350.115 million from the old assumptions. It is a baseline estimated EBITDA, without any link to the synergy section. Historical adjusted EBITDA average `E93` is $364.772 million. Neither amount is a current ARKO conclusion.

## Critical defects and omissions

### 1. Asset edits do not update the deal

`C32=1057`, `C33=2129`, and `C34=2` have zero direct or indirect dependents. They change descriptive text only. `C32` is labeled company-operated; it does not establish real-estate ownership. `C33` explicitly describes dealer stations supplied, not owned retail assets. `D34` says the two terminals relate to a pending USPP transaction and should be evaluated after close. These populations cannot be combined into automatically owned, convertible sites.

### 2. Rebranding is broken, and some displayed results are stale

`E19` contains a literal error value `#REF!`, with no formula left to repair by tracing. It appears intended to hold a site count, because `F19=E19*80000*12*0.025` uses 80,000 monthly gallons per site and $0.025/gallon benefit. `D19=25%`, labeled Rebrand %, has no dependents.

Cached errors exist in `E19,F19,H19,I19,J19,K19,T19,U19`. Expanded shared formulas show that `L19:R19` each depend on the previous broken cell. Their displayed caches still show $10.038 million each. Independent calculation makes all seven `#REF!`. Do not read those caches as valid results.

`T19=E19*-80000*0.75` and `U19=E19*-80000*0.25` appear to assume $80,000 conversion cost per site, split 75%/25% between the first two years. This is not the $90,000 conversion default previously discussed and is not connected to an editable cost-per-site input. `H19=F19*G19` is also labeled capital but never enters the cash schedule; do not sum H19 and T/U19 without resolving their intended meanings.

### 3. Capital procurement savings are labeled EBITDA

`C25:C28` are growth and maintenance capital spend; `D25:D28` are negotiated savings rates. `E25:E28=C*D` total $11.554 million per year at full realization. These values feed `J25:R28` inside the section labeled EBITDA. Capitalized procurement savings normally reduce investing cash outflow, not operating EBITDA. Keep them in a separate cash-capex benefit schedule unless the underlying spend is demonstrably an operating expense.

`F25:F28=25%` only drives `H25:H28`; actual Year 1 benefits in `I25:I28` use `G25:G28=50%`. Column F is labeled Phase in, so a user may change F expecting EBITDA to change and see nothing happen. H25:H28 total $2.8885 million and have no downstream references.

### 4. Terminal eligibility disappears in Year 3

`F9=C9*(D4+D5+D6)*E9/100` applies `C9=75%` terminal eligibility. Year 2 `J9=F9`. But `K9:R9` reverse-engineer gallons from EBITDA and cpg and omit C9 entirely:

`K9=(K6/$E$6*100+K5/$E$5*100+K4/$E$4*100)*($E$9/100)`.

With current inputs, Year 3 is $1.376 million. Applying the stated 75% eligibility would produce $1.032 million, a $344,000 difference. Year 10's equivalent difference is $848,000. If any of E4, E5 or E6 is zero, this reverse calculation divides by zero even when that business category is inactive. Forecast eligible gallons directly instead.

### 5. One input simultaneously controls timing and severance

G&A: `F15=D15*(1-C15)`; `I15=F15*G15`; `H15=F15*G15`; `T15=-H15`. Changing `G15` changes Year 1 realized savings and severance cash cost by the same percentage. A comment at G15 only says “Assumes sev”. This is not independent operating timing and severance modeling.

Opex uses the same pattern in row 18. `G18` additionally flows to G19/H19. Separate realization timing, severance cost, other transition costs, and recurring stranded cost.

### 6. The dealer-commission conversion is absent

There is no per-site retained fuel margin, dealer commission, forfeited merchandise gross profit, dealer rent, retained versus transferred site cost, existing lease expense, dealer viability, conversion eligibility or real-estate acquisition bridge. The Opex note in B18 explicitly says all COOP income was retained and much of its Opex was consequently left in place. Simply increasing savings from 5% to a much higher takeout would leave the old retail income while removing its operating costs and overstate profit.

For this operating model, first calculate each site's post-conversion Sunoco P&L. Dealer compensation, lost inside gross profit and retained property costs are real offsets to transferred labor and other expenses. Then aggregate the eligible sites and add only distinct corporate/supply benefits.

### 7. Several supposed investments never reach cash outflow

H21 ($3.195 million) and H22 ($0.136 million) are calculated as capital, but neither has any dependent and T21:AC22 is blank. They total $3.331 million. Decide whether these represent actual implementation costs, implied capital at a yield, or abandoned calculations; then schedule actual cash costs once.

H25:H28 are also unused as noted above. G9/H9 and most fields in rows 10/11 are disconnected. D16 ($25 million) and D23 ($10 million) do affect Year 1 cash outflow and need scope checks against severance, systems and integration costs.

### 8. The largest assumptions are unexplained top-down amounts

`C15=35%` means retain 35% of G&A and remove 65%, producing $167.7 million from an old $258 million baseline. `C18=95%` means retain 95% of Opex and remove 5%, producing $21.9 million from $438 million. These are not sourced current takeout benchmarks or proof of achievable savings.

`F13=18000000+2000000` is an old $20 million supply placeholder. Its note says it already includes benefits associated with the two shifted-barrel rows above. Populating rows 10/11 as additional benefits without splitting the embedded $20 million would double count. Optimization in rows 21/22, credit-card savings in row 19, and Opex in row 18 also need mutually exclusive scopes. G84 says Opex includes card fees.

### 9. Old financial rows do not automatically reconcile when updated

Historical combined sales C80:D80, product margin C81:D81, EBITDA C90:D90 and adjusted EBITDA C93:D93 are hardcoded. They do not recalculate from all component rows. Most historical Opex/G&A and accounting rows have no downstream link at all. New financial data require independent reconciliation.

`F84=219000000*2`, `F85=129000000*2`, and `F86=53000000*2` embed the half-year figures directly in formulas. Changing C84:D85 will not update synergy baselines F84/F85.

`E94` sits under a “2 year average” header but is `J50*-1000000`, a 2023 projected maintenance capex figure. It is not the average of C94 and D94. `F93=F90` carries no separate current-year adjusted-EBITDA normalization. The historical income reconciliation also requires identifying any other income/adjustment items rather than assuming all NIAT figures reconcile from the displayed rows.

`H49:K49` sum rows 42:48, which contain both parent segment rows and potential child detail rows. The child financial inputs are presently blank. Filling both parent totals and child details would double count the subsegments. Use one level of aggregation. Quarter annualization is not a substitute for TTM data when seasonality or structural changes are material.

### 10. No transaction economics or financial capacity

No purchase price, enterprise-to-equity bridge, debt assumed, lease treatment, transaction fees, tax cash flow, purchase accounting, acquired working-capital peg, comprehensive annual capital, terminal value, discount rate, IRR, NPV, debt financing, debt service, distribution coverage or pro forma leverage is calculated. The only formula functions are SUM, AVERAGE and IFERROR. “Assumed Return” G4 is a one-year EBITDA/capital yield used to backsolve capital, not a calculated deal IRR.

## Exact primary input map and what changes

### New business and terminal

| Cells to replace or expose | Meaning and units | What entering them does | Required evidence |
|---|---|---|---|
| C4, E4, G4 | New dealer sites per year; incremental margin in cents/gallon; annual EBITDA/capital yield as decimal | D4 uses 80,000 monthly gallons/site; F4 computes annual contribution; H4=F4/G4 backsolves annual growth investment; J4:R4 accumulate nine cohorts; T4:AB4 fund nine cohorts | Real pipeline, per-site throughput, net margin and independently priced investment |
| Literal 80000 in D4 | Gallons per site per month | Sets volume and everything derived from row 4 | Site-level actual annual gallons; replace aggregate average where site variation matters |
| C5,D5,E5; literal 100000 in H5 | New wholesale customers; aggregate gallons/year; incremental cpg; one-time dollars/customer | F5 annual contribution, Year 1 half benefit, Year 2 onward full benefit, T5 one-time cost | Pipeline, contracts, delivery/rack economics and costs |
| C6,D6,E6; literals 10 and 4 in H6 | New unbranded customer count (currently unused), aggregate gallons/year, cpg, presumed working-capital days and dollars/gallon | F6 annual contribution; H6=D6/365*10*4; Year 1 half benefit; working capital deployed T6 and fully recovered AC6 | Customer pipeline, receivable/inventory/payable days, fuel price and recoverability |
| C9,E9 | Eligible terminal share; incremental terminal net cpg | F9 and Year 2 eligible terminal benefit; Year 1 25%; later years currently defective | Actual eligible rack volumes, terminal capacity, marginal cost and route savings |
| C10:E11 and row 13 | Shifted-barrel categories and supply savings | Rows 10/11 are currently inactive; F13 contains $20m hardcoded formula and drives half/full-year supply benefits | Buyer/seller rack overlap and supply team analysis with no overlap among rows |

For row 4, Year 1 EBITDA I4 is blank, then each subsequent year adds a full annual $2.88 million cohort. Nine capital payments occur in Years 1–9 and nine benefit cohorts exist by Year 10. This is a one-year lag, not a ten-year rolling terminal forecast.

### Cost, brand and optimization

| Cells to replace or expose | Meaning and units | What entering them does | Required evidence |
|---|---|---|---|
| F85 or a new linked baseline; C15 | Eligible current G&A dollars/year; fraction retained | D15 baseline and F15 annual saving; I15 year-1 realization; J:R full saving | Target chart of accounts, normalized G&A, functions retained, Sunoco incremental staffing and systems |
| G15; independent new inputs needed | Year-1 realization and current severance percentage are tied | Both year-1 benefit and T15 cash spend change | Timing by function and actual severance calculation |
| D16 | Supplemental one-time reduction cost, dollars | T16=-D16 only | Cost-to-achieve budget; confirm no duplicate severance |
| F84 or linked baseline; C18 | Eligible current Opex dollars/year; fraction retained | D18 baseline and F18 annual saving | Site operating costs split into transferred, retained, eliminated and added |
| G18; independent new inputs needed | Year-1 realization and current severance percentage tied | Both I18 and T18 change, plus G19/H19 | Transfer schedule and actual transition costs |
| D19 and E19 | Rebrand share (disconnected) and presumed number of eligible sites (broken) | Once redesigned, row 19 should show net benefit and conversion cash by eligible site | Site brand, remaining term, supplier repayment/UNAM, verified card and license benefit, actual conversion cost |
| Formula literals in F19,T19,U19 | 80k gallons/month, 2.5 cpg benefit, $80k/site, 75%/25% schedule | Drive rebrand benefit and expense schedule | Replace with explicit sourced inputs; don't assume every acquired/supplied location can convert |
| C54,D54; literal 0.8 in C21; E21 | Historic gallons, eligible 80% share, optimization cpg | F21 full annual optimization benefit; I21 75%; J:R full | Compatible target gallon base, eligible sites, pricing/logistics reason and proof it is not in supply margin |
| Formula literals in C22; E22 | 49m/90% buyer gallons and 0.5 incremental cpg | F22 buyer-side benefit; I22 75%; J:R full | Actual buyer adjacent volumes and incremental action plan attributable to this deal |
| G21,G22 | Implied capital percentage | H21/H22 only; currently no cash schedule effect | Explicit implementation costs with dates |
| D23 | IT integration dollars | T23 one-time cash expense | Systems migration budget including stranded and recurring replacement costs |

### Capital and source financials

| Cells | Inputs required | What they show |
|---|---|---|
| C26,C28 | Buyer's eligible growth/maintenance capex in dollars/year | Buyer procurement benefit, requiring deal attribution |
| D25:D28 | Savings rates for target/buyer growth/maintenance spending | E25:E28 full run-rate cash capex savings, currently in wrong EBITDA section |
| G25:G28 | Year-1 realization fractions | I25:I28 year-1 benefit; F25:F28 do not control this |
| F25:F28 | Currently quarter-target multipliers | H25:H28 only; no effect on annual benefit or cash schedule |
| C32:C34 and I33:I36 | Operating and ownership inventory | Display only; reconcile and use a new site roster as the authority |
| D42:G48, applicable parent rows 42,45,48 | Quarterly segment gross product margin, $millions | H:I first-half annualization; J:K add 2.5% annual uplift; F62/F74/F78 in dollars feed F81 |
| D50,E50 plus embedded first-half figures in F50,G50 | Quarterly and first-half maintenance capex, $millions | J50 projected current-year spend and E94 negative cash amount |
| C53,D53 plus text headers 41/F53 | Correct reporting periods | Labels only; they do not select data automatically |
| C54:D54,C64:D64,C76:D76 | Segment gallons/year | Two-year average E; only GDSO average affects optimization |
| C56:D57,C66:D68,C77:D77 | Segment sales, dollars/year | Component totals and averages; combined C80:D80 is hardcoded and needs separate reconciliation |
| C60:D61,C71:D73,C78:D78 | Product margins, dollars/year | Segment margin totals; combined C81:D81 must be reconciled separately |
| C80:D93, applicable financial rows | Revenue, product margin, depreciation in COGS, Opex, G&A, D&A, interest, tax, NIAT, EBITDA, asset gains, impairment and adjusted EBITDA | Historical context; multiple headline totals and adjustments are hardcoded |
| F84:F86 | Current annualized Opex, G&A, D&A | Opex and G&A feed baseline EBITDA and synergies; D&A does not feed F90 |
| C94:D95 and formulas E94/E95 | Maintenance and growth capex, negative dollars/year, with acquisition spend excluded consistently | Target procurement saving bases through C25/C27; note E94 is a projected current-year amount, not a two-year average |

Fill source financial data first, then derive baseline recurring economics, then assess individual actions. Do not enter a desired savings percentage first and backfit the seller data to it.

## The conversion bridge the new bot must calculate

The user states an intended company-owned, dealer-commission strategy for every site. Treat that as the modeled future operating structure, subject to actual acquisition ownership and contract eligibility. It does not mean each currently supplied dealer can be purchased or converted under the existing deal.

For each eligible site:

1. Establish current normalized contribution attributable to Sunoco's acquisition perimeter: fuel gross margin plus merchandise/other gross profit plus existing rent, less present operating and occupancy costs. Preserve any existing dealer commission already in the baseline.
2. Build post-conversion Sunoco contribution explicitly: retained fuel gross margin, incremental verified supply/logistics/card benefits, rent and other retained income, minus dealer commission, card fees retained by Sunoco, retained site costs, lease expense, property taxes/insurance, environmental/maintenance obligations and incremental support cost.
3. The conversion uplift is post-conversion contribution minus the same site's baseline contribution. If the dealer keeps inside margin, remove that margin from Sunoco's post-conversion earnings. Do not deduct it a second time in a separate adjustment after using this bridge.
4. Build the dealer's own P&L: commission income plus inside gross profit and retained ancillary income, less dealer labor, utilities, operating costs and rent paid to Sunoco. A negative or implausibly low dealer result means the commission/rent/operating transfer assumptions need work.
5. Add corporate G&A actions only once, with identified eliminated costs, retained/stranded costs and replacement costs. Add distinct supply/procurement actions only where not embedded in the per-site fuel margin bridge.
6. Schedule implementation costs, brand conversion, supplier repayments, working capital, real-estate acquisition and ongoing maintenance/tank capital separately from EBITDA. Growth investment belongs in incremental cash flows and its resulting growth margin must be separately identified.
7. Reconcile baseline EBITDA plus conversion delta plus non-overlapping corporate and commercial actions to pro forma EBITDA. Reconcile pro forma EBITDA to cash flows, acquisition price, IRR/NPV and financing capacity.

Public Sunoco data can substantiate operating structure and benchmark companywide results. It cannot supply confidential per-site commission economics, supplier margin, target severance, credit-card rates, rent, property ownership or a particular deal's approved hurdle. The bot must retain missing fields and ask targeted questions instead of inserting a generic companywide percentage.

## Required bot behavior

- Identify workbook and target by both file name and internal financial periods/entity labels. This file fails that consistency check.
- Store each extracted value with source file, sheet/page/cell, period, currency, units, business perimeter and whether reported, management-estimated or assumed.
- Preserve a known zero separately from a missing value. Many `IFERROR(AVERAGE(...),0)` source averages currently turn empty rows into zero.
- Maintain an editable input map; formulas must not be silently overwritten. Numeric literals embedded in formulas are separate assumptions needing exposure.
- Use explicit annual gallons and cents-per-gallon conversions: gallons × cpg / 100. Quarterly figures in rows 42–50 are in millions, while annual financials and synergy dollars are unscaled dollars.
- Enforce mutually exclusive synergy IDs tied to cost accounts, contracts or sites. Growth profit, operating expense savings, capex savings, working-capital releases and one-time costs are separate types.
- Provide a no-synergy base, validated operating conversion case, and explicitly labeled exploratory opportunities. Confidence must follow source quality and action feasibility rather than a decorative score.
- Return open questions prioritized by effect on earnings and cash flow, a traceable EBITDA bridge, a dealer viability check, and a completed model only once required inputs reconcile.
- Do not use this file's 65% G&A takeout, 5% Opex takeout, $20m supply amount, 2.5-cpg brand benefit or buyer capital totals as default underwriting.

## Additional structural observations

There are 627 nonempty stored cells, 287 formulas and 165 numeric constants (including years and context-only values). No external-link parts, hyperlinks, drawings/charts, data validation, conditional formatting, sheet protection, tables or hidden sheets were found. There are no input fill colors: all ordinary fills are absent, so color does not reliably distinguish inputs from outputs. The workbook includes 9,744 mostly legacy hidden defined names. Seven contain `#REF!`; none is used by an active formula. These name errors are separate from E19's active financial defect.

The only active comments are G15 and G18, each “Assumes sev”, dated 2023. No financial source URLs or detailed assumption evidence are included. XML declares A1:AX96, but financial content ends at row 95 and column AC; a blank merged area AJ1:AX1 is not an additional model or output.

For scale only, independently summing the existing Year 2 benefit lines excluding the broken rebrand row yields $234.311 million. Of this, $11.554 million is capital-procurement savings classified in the EBITDA area. This is an audit diagnostic, not a model-generated subtotal or valid deal result. Existing Year 1 capital entries excluding the broken rebrand row total a $97.679 million outflow, before omitted/unclear capital entries and purchase consideration.

## Supporting machine-readable files

- `input_map.json`: curated field groups, expected inputs, units, output behavior, existing cell details and warnings, plus every numeric constant and embedded numeric formula.
- `enriched.json`: full cell inventory with expanded formulas, precedents, dependents, summary and names.
- `expanded_formulas.tsv`: every complete formula with cached value.
- `independent_calculation.json`: current independent arithmetic results and all seven cache mismatches.
- `extracted.json`: raw extracted values, formula metadata, styles and package metadata.

These are intermediate analytical evidence; the original workbook remains unchanged.
