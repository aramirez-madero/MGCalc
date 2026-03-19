export function calculateMonthlyPayment(principal, annualRate, months) {
  if (!principal || !months) {
    return 0;
  }

  const annualRateDecimal = annualRate / 100;
  const monthlyRate = Math.pow(1 + annualRateDecimal, 30 / 360) - 1;

  if (monthlyRate === 0) {
    return principal / months;
  }

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function calculateQuote(selectedLot, form) {
  if (!selectedLot) {
    return null;
  }

  const basePrice = selectedLot.area * selectedLot.precioM2;
  const discountAmount = basePrice * (Number(form.discountPercent || 0) / 100);
  const finalPrice = basePrice - discountAmount;
  const initialAmount = finalPrice * (Number(form.initialPercent || 0) / 100);
  const financedAmount = Math.max(finalPrice - initialAmount, 0);
  const monthlyPayment = calculateMonthlyPayment(
    financedAmount,
    Number(form.annualRate || 0),
    Number(form.termMonths || 0),
  );
  const monthlyRate = Math.pow(1 + Number(form.annualRate || 0) / 100, 30 / 360) - 1;

  return {
    basePrice,
    discountAmount,
    finalPrice,
    initialAmount,
    financedAmount,
    monthlyPayment,
    monthlyRate,
  };
}
