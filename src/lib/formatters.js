const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return moneyFormatter.format(Number(value || 0));
}

export function formatNumber(value) {
  return integerFormatter.format(Number(value || 0));
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}
