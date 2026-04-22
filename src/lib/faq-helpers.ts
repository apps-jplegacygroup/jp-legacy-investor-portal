export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function calculateFHADown(price: number): number {
  return Math.round(price * 0.035)
}

export function calculateFHATotalCash(price: number, cc: number): number {
  return calculateFHADown(price) + cc
}

export function calculateRefiAvailable(equity: number): number {
  return Math.round((equity * 0.75) / 1000) * 1000
}

export function calculateAnnualCashFlow(monthly: number): number {
  return monthly * 12
}

export function calculateEquityRecoveryPercent(equity: number, totalCash: number): number {
  if (totalCash <= 0) return 0
  return Math.round((equity / totalCash) * 100)
}
