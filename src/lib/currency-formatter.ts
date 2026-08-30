// 1:1 port of helpers/CurrencyFormatter.js — receipt amounts depend on this
// exact formatting ("Rp 12.000") and the cash rounding table. FROZEN.

const defaultOptions = {
  significantDigits: 0,
  thousandsSeparator: '.',
  symbol: 'Rp',
};

export const currencyFormatter = (
  value: number,
  options?: Partial<typeof defaultOptions>,
) => {
  if (typeof value !== 'number') value = 0.0;
  const opts = { ...defaultOptions, ...options };
  const fixed = value.toFixed(opts.significantDigits);

  const [currency] = fixed.split('.');
  return `${opts.symbol} ${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    opts.thousandsSeparator,
  )}`;
};

export const roundingUp = (value: number) => {
  const last3Digit = parseInt(String(value).slice(-3));
  if (value == 0) return 0;
  if (last3Digit < 1) {
    return value;
  } else if (last3Digit <= 399) {
    return value - last3Digit;
  } else if (last3Digit <= 499) {
    const rounderValue = 500 - last3Digit;
    return value + rounderValue;
  } else if (last3Digit <= 899) {
    const rounderValue = last3Digit - 500;
    return value - rounderValue;
  } else if (last3Digit <= 999) {
    const rounderValue = 1000 - last3Digit;
    return value + rounderValue;
  }
};
