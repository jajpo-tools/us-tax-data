'use strict';
/**
 * US federal tax figures by tax year, from IRS and SSA publications.
 *
 *   const taxData = require('us-tax-data');
 *   taxData[2026].standardDeduction.single   // 16100
 *   taxData.get(2027).incomeTaxBrackets.mfj  // [{ min, max, rate, baseTax }, ...]
 */
const data = {
  2026: require('./data/2026.json'),
  2027: require('./data/2027.json')
};

const years = Object.keys(data).map(Number).sort();

function get(year) {
  const y = data[year];
  if (!y) throw new Error(`No data for tax year ${year}. Available: ${years.join(', ')}`);
  return y;
}

module.exports = Object.assign({}, data, {
  years,
  get,
  underpaymentRates: require('./data/irs-underpayment-rates.json')
});
