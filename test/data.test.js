// Run with: npm test (Node's built-in test runner, no dependencies)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const taxData = require('..');

const STATUSES = ['single', 'mfj', 'mfs', 'hoh'];
const OFFICIAL = /^https:\/\/(www\.irs\.gov|www\.ssa\.gov|www\.law\.cornell\.edu|www\.govinfo\.gov|aspe\.hhs\.gov)\//;

/** Tax on taxable income from a bracket list, the long way. */
function taxOn(income, rows) {
  let tax = 0;
  for (const r of rows) {
    if (income <= r.min) break;
    const top = r.max === null ? income : Math.min(income, r.max);
    tax += (top - r.min) * r.rate;
  }
  return tax;
}

test('exports every year file plus the interest rates', () => {
  assert.deepEqual(taxData.years, [2026, 2027]);
  assert.equal(taxData[2026].year, 2026);
  assert.equal(taxData[2027].year, 2027);
  assert.ok(Array.isArray(taxData.underpaymentRates.quarters));
  assert.equal(taxData.get(2026), taxData[2026]);
  assert.throws(() => taxData.get(2019), /No data for tax year 2019/);
});

test('2026 brackets reproduce the base tax amounts printed in Rev. Proc. 2025-32', () => {
  const printed = {
    single: [[12400, 1240], [50400, 5800], [105700, 17966], [201775, 41024], [256225, 58448], [640600, 192979.25]],
    mfj: [[24800, 2480], [100800, 11600], [211400, 35932], [403550, 82048], [512450, 116896], [768700, 206583.5]],
    hoh: [[17700, 1770], [67450, 7740], [105700, 16155], [201750, 39207], [256200, 56631], [640600, 191171]],
    mfs: [[256225, 58448], [384350, 103291.75]]
  };
  for (const [status, rows] of Object.entries(printed)) {
    for (const [income, tax] of rows) {
      const row = taxData[2026].incomeTaxBrackets[status].find((b) => b.min === income);
      assert.equal(row.baseTax, tax, `${status} ${income}`);
      assert.ok(Math.abs(taxOn(income, taxData[2026].incomeTaxBrackets[status]) - tax) < 0.001);
    }
  }
});

test('2027 brackets reproduce the base tax amounts printed in Rev. Proc. 2026-35', () => {
  const printed = {
    single: [[12800, 1280], [52025, 5987], [109125, 18549], [208325, 42357], [264550, 60349], [661375, 199237.75]],
    mfj: [[25600, 2560], [104050, 11974], [218250, 37098], [416650, 84714], [529100, 120698], [793650, 213290.5]],
    hoh: [[18250, 1825], [69650, 7993], [109100, 16672], [208300, 40480], [264550, 58480], [661350, 197360]],
    mfs: [[396825, 106645.25]]
  };
  for (const [status, rows] of Object.entries(printed)) {
    for (const [income, tax] of rows) {
      const row = taxData[2027].incomeTaxBrackets[status].find((b) => b.min === income);
      assert.equal(row.baseTax, tax, `${status} ${income}`);
    }
  }
});

test('bracket tables are continuous and end with no upper limit', () => {
  for (const year of taxData.years) {
    for (const status of STATUSES) {
      const rows = taxData[year].incomeTaxBrackets[status];
      assert.equal(rows[0].min, 0);
      assert.equal(rows[rows.length - 1].max, null);
      assert.deepEqual(rows.map((r) => r.rate), [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37]);
      for (let i = 1; i < rows.length; i++) assert.equal(rows[i].min, rows[i - 1].max, `${year} ${status} row ${i}`);
    }
  }
});

test('key figures by year', () => {
  const y26 = taxData[2026];
  const y27 = taxData[2027];
  assert.equal(y26.standardDeduction.single, 16100);
  assert.equal(y26.standardDeduction.mfj, 32200);
  assert.equal(y27.standardDeduction.single, 16600);
  assert.equal(y26.selfEmploymentTax.socialSecurityWageBase, 184500);
  assert.equal(y27.selfEmploymentTax.socialSecurityWageBase, 192300);
  assert.equal(y26.selfEmploymentTax.netEarningsFactor, 0.9235);
  assert.equal(y26.selfEmploymentTax.socialSecurityRate + y26.selfEmploymentTax.medicareRate, 0.153);
  assert.deepEqual(y26.additionalMedicareTax.threshold, { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 });
  assert.equal(y26.qbiDeduction.threshold.single, 201750);
  assert.equal(y27.qbiDeduction.threshold.mfj, 416600);
  assert.equal(y26.qbiDeduction.minimumDeduction, 400);
  assert.equal(y27.qbiDeduction.minimumDeduction, 415);
  assert.equal(y26.informationReturns.form1099NEC.threshold, 2000);
  assert.equal(y27.informationReturns.form1099NEC.threshold, 2100);
  assert.equal(y26.informationReturns.form1099K.grossPaymentsOver, 20000);
  assert.deepEqual(y26.estimatedTax.dueDates, ['2026-04-15', '2026-06-15', '2026-09-15', '2027-01-15']);
  assert.equal(y26.retirement.definedContributionLimit, 72000);
  assert.equal(y27.retirement.electiveDeferralLimit, 25500);
  assert.deepEqual(y26.businessMileageRates.periods.map((p) => p.rate), [0.725, 0.76]);
});

test('figures the IRS has not published are left out, not guessed', () => {
  assert.deepEqual(taxData[2027].businessMileageRates.periods, []);
  assert.equal(taxData[2027].estimatedTax.provisional, true);
  assert.equal(taxData[2026].estimatedTax.provisional, false);
});

test('2027 estimated tax due dates fall on business days', () => {
  for (const d of taxData[2027].estimatedTax.dueDates) {
    const day = new Date(d + 'T00:00:00Z').getUTCDay();
    assert.ok(day >= 1 && day <= 5, `${d} is a weekday`);
  }
});

test('every section names at least one official source', () => {
  for (const year of taxData.years) {
    for (const [name, section] of Object.entries(taxData[year])) {
      if (!section || typeof section !== 'object' || !('description' in section)) continue;
      if (name === 'businessMileageRates' && section.periods.length === 0) continue;
      assert.ok(Array.isArray(section.sources) && section.sources.length > 0, `${year} ${name} has sources`);
      for (const s of section.sources) {
        assert.ok(s.label && s.label.length > 5, `${year} ${name} source label`);
        assert.match(s.url, OFFICIAL, `${year} ${name}: ${s.url}`);
      }
    }
  }
});

test('the CSV files match the JSON brackets', () => {
  for (const year of taxData.years) {
    const csv = fs.readFileSync(path.join(__dirname, '..', 'csv', `brackets-${year}.csv`), 'utf8').trim().split('\n');
    assert.equal(csv[0], 'filing_status,min,max,rate,base_tax');
    const rows = csv.slice(1).map((l) => l.split(','));
    let i = 0;
    for (const status of STATUSES) {
      for (const b of taxData[year].incomeTaxBrackets[status]) {
        const [s, min, max, rate, base] = rows[i++];
        assert.equal(s, status);
        assert.equal(Number(min), b.min);
        assert.equal(max === '' ? null : Number(max), b.max);
        assert.equal(Number(rate), b.rate);
        assert.equal(Number(base), b.baseTax);
      }
    }
    assert.equal(i, rows.length);
  }
});

test('underpayment rates: quarters in order, rates as decimals', () => {
  const q = taxData.underpaymentRates.quarters;
  for (let i = 1; i < q.length; i++) assert.ok(q[i].quarter > q[i - 1].quarter);
  for (const r of q) assert.ok(r.rate > 0 && r.rate < 0.2);
  assert.equal(q.find((r) => r.quarter === '2026-Q4').rate, 0.07);
  assert.equal(q.find((r) => r.quarter === '2027-Q1').rate, 0.08); // IR-2026-144
});
