# US tax data: 2026 and 2027 federal tax figures as JSON

[![tests](https://github.com/jajpo-tools/us-tax-data/actions/workflows/test.yml/badge.svg)](https://github.com/jajpo-tools/us-tax-data/actions/workflows/test.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The US federal tax numbers a tax calculator needs, in one JSON file per tax year. That covers tax brackets, the standard deduction, self-employment tax, the QBI deduction, 1099 reporting thresholds, estimated tax due dates, retirement plan limits and mileage rates. **Every section links to the IRS or SSA publication it comes from.** Tests check the bracket tables against the tax amounts the IRS prints in its revenue procedures.

- **Years:** 2026 and 2027 (2027 as far as the IRS has published).
- **Formats:** JSON (`data/`) and CSV brackets (`csv/`).
- **Dependencies:** none. Use it from a CDN, Node, Python or a spreadsheet.

These are the same figures that run the free calculators on [JAJPO](https://jajpo.com/), and both are built from one source file, so they can't drift apart.

## What's in each year file

| Section | What it holds |
|---|---|
| `incomeTaxBrackets` | Brackets for single, married filing jointly (`mfj`), separately (`mfs`) and head of household (`hoh`), with `min`, `max`, `rate` and `baseTax` |
| `standardDeduction` | By filing status |
| `selfEmploymentTax` | 92.35% factor, $400 minimum, Social Security and Medicare rates, the wage base |
| `additionalMedicareTax` | 0.9% and the thresholds by filing status |
| `qbiDeduction` | Section 199A: rate, thresholds, phase-in range, wage and property limits, minimum deduction |
| `qualifiedTipsDeduction` | Section 224 tips deduction: cap and phase-out |
| `estimatedTax` | Quarterly due dates, safe harbor percentages, the $1,000 rule, the January exception |
| `informationReturns` | Form 1099-NEC and 1099-K reporting thresholds |
| `businessMileageRates` | IRS standard mileage rate periods |
| `retirement` | Solo 401(k) and SEP-IRA limits, catch-ups, the compensation limit |
| `homeOffice` | Simplified method rate and cap; 39-year depreciation rates |
| `longTermCarePremiumLimits` | By age, for the self-employed health insurance deduction |
| `premiumTaxCredit` | Applicable percentage table and poverty guidelines |
| `unemploymentTax` | FUTA rate, credit and wage base |

`data/irs-underpayment-rates.json` has the IRS underpayment interest rate for each quarter (the rate behind the estimated tax penalty).

<!-- tables:start -->
### 2026 tax brackets (taxable income)

| Rate | Single | Married filing jointly | Head of household |
|---|---|---|---|
| 10% | $0 – $12,400 | $0 – $24,800 | $0 – $17,700 |
| 12% | $12,400 – $50,400 | $24,800 – $100,800 | $17,700 – $67,450 |
| 22% | $50,400 – $105,700 | $100,800 – $211,400 | $67,450 – $105,700 |
| 24% | $105,700 – $201,775 | $211,400 – $403,550 | $105,700 – $201,750 |
| 32% | $201,775 – $256,225 | $403,550 – $512,450 | $201,750 – $256,200 |
| 35% | $256,225 – $640,600 | $512,450 – $768,700 | $256,200 – $640,600 |
| 37% | over $640,600 | over $768,700 | over $640,600 |

### 2027 tax brackets (taxable income)

| Rate | Single | Married filing jointly | Head of household |
|---|---|---|---|
| 10% | $0 – $12,800 | $0 – $25,600 | $0 – $18,250 |
| 12% | $12,800 – $52,025 | $25,600 – $104,050 | $18,250 – $69,650 |
| 22% | $52,025 – $109,125 | $104,050 – $218,250 | $69,650 – $109,100 |
| 24% | $109,125 – $208,325 | $218,250 – $416,650 | $109,100 – $208,300 |
| 32% | $208,325 – $264,550 | $416,650 – $529,100 | $208,300 – $264,550 |
| 35% | $264,550 – $661,375 | $529,100 – $793,650 | $264,550 – $661,350 |
| 37% | over $661,375 | over $793,650 | over $661,350 |

### Key figures, 2026 and 2027

| | 2026 | 2027 |
|---|---|---|
| Standard deduction: single / joint / head of household | $16,100 / $32,200 / $24,150 | $16,600 / $33,200 / $24,925 |
| Self-employment tax rate | 15.3% on 92.35% of net profit | 15.3% on 92.35% of net profit |
| Social Security wage base | $184,500 | $192,300 |
| Additional Medicare Tax (0.9%) starts: single / joint | $200,000 / $250,000 | $200,000 / $250,000 |
| QBI deduction threshold: single / joint | $201,750 / $403,500 | $208,300 / $416,600 |
| QBI minimum deduction | $400 (with $1,000+ of QBI) | $415 (with $1,030+ of QBI) |
| Form 1099-NEC threshold | $2,000 | $2,100 |
| Form 1099-K threshold | over $20,000 and over 200 payments | over $20,000 and over 200 payments |
| Estimated tax due dates | Apr 15, 2026; Jun 15, 2026; Sep 15, 2026; Jan 15, 2027 | Apr 15, 2027; Jun 15, 2027; Sep 15, 2027; Jan 18, 2028 (provisional) |
| 401(k) employee deferral / catch-up (50+) / ages 60–63 | $24,500 / $8,000 / $11,250 | $25,500 / $8,500 / $11,750 |
| Solo 401(k) and SEP-IRA total limit | $72,000 | $75,000 |
| Business mileage rate | 72.5¢ from Jan 1, 76¢ from Jul 1 | not published yet |
<!-- tables:end -->

## Use it

**From a CDN (browser or any language):**

```js
const res = await fetch('https://cdn.jsdelivr.net/gh/jajpo-tools/us-tax-data@main/data/2026.json');
const tax2026 = await res.json();
console.log(tax2026.standardDeduction.single); // 16100
```

**From Node:**

```bash
npm install github:jajpo-tools/us-tax-data
```

```js
const taxData = require('us-tax-data');

// Federal income tax on taxable income, from the bracket table
function incomeTax(taxableIncome, status, year) {
  const row = taxData.get(year).incomeTaxBrackets[status]
    .find((b) => b.max === null || taxableIncome <= b.max);
  return row.baseTax + (taxableIncome - row.min) * row.rate;
}

incomeTax(60000, 'single', 2026); // 5800 + 22% of 9,600 = 7912
```

**From Python:**

```python
import json, urllib.request

url = "https://cdn.jsdelivr.net/gh/jajpo-tools/us-tax-data@main/data/2026.json"
tax = json.load(urllib.request.urlopen(url))
print(tax["selfEmploymentTax"]["socialSecurityWageBase"])  # 184500
```

**In a spreadsheet:** open `csv/brackets-2026.csv` in Excel or Google Sheets.

## The data format

Money is in US dollars. Rates are decimals (`0.22` is 22%). `"max": null` means no upper limit. Each section has a `description` and a `sources` list:

```json
"selfEmploymentTax": {
  "description": "Schedule SE. Net earnings = net profit × netEarningsFactor. ...",
  "netEarningsFactor": 0.9235,
  "minimumNetEarnings": 400,
  "socialSecurityRate": 0.124,
  "socialSecurityWageBase": 184500,
  "medicareRate": 0.029,
  "deductiblePortion": 0.5,
  "sources": [
    { "label": "IRS: Self-employment tax (Social Security and Medicare)", "url": "https://www.irs.gov/..." },
    { "label": "SSA: 2026 contribution and benefit base ($184,500)", "url": "https://www.ssa.gov/oact/cola/cbb.html" }
  ]
}
```

Figures the IRS hasn't published yet are left out, not guessed. For 2027, the mileage rate is an empty list until the IRS announces it (usually in December). The 2027 estimated tax dates are marked `"provisional": true` until the 2027 Form 1040-ES comes out.

## How it's checked

- `npm test` rebuilds the tax at every bracket boundary and compares it with the amounts printed in Rev. Proc. 2025-32 (2026) and Rev. Proc. 2026-35 (2027).
- It also checks that the tables have no gaps, that every section cites an official source (irs.gov, ssa.gov, the US Code, the Federal Register or HHS), that the CSV matches the JSON, and that the 2027 due dates fall on business days.
- Each year file has a `lastVerified` date.

Found a figure that's wrong or out of date? [Open an issue](https://github.com/jajpo-tools/us-tax-data/issues) with the IRS link.

## Updates

New figures are added when the IRS publishes them: the 2027 mileage rate (expected December 2026), each quarter's interest rate, and the 2027 Form 1040-ES dates. Watch the repo's releases to hear about changes.

## Calculators built on this data

- [1099 Tax Calculator](https://jajpo.com/taxes/1099-tax-calculator/): self-employment tax plus federal income tax, with every step shown
- [Quarterly Estimated Tax Calculator](https://jajpo.com/taxes/quarterly-tax-calculator/): what to pay on each due date, with the safe harbor rules
- [1099-NEC Checker](https://jajpo.com/taxes/1099-nec-checker/): whether you need to send a contractor a Form 1099-NEC
- [Self-employment tax, explained](https://jajpo.com/taxes/self-employment-tax/): the Schedule SE steps in plain English

## Not tax advice

This is reference data for software, taken from public IRS and SSA publications. It doesn't cover state taxes or every federal rule. Check the linked source before you rely on a figure.

## License

MIT for the code, the structure and the notes. The tax figures themselves are US government facts and in the public domain.

Maintained by [JAJPO](https://jajpo.com/): free tax and invoicing tools for US freelancers.
