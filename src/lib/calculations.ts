import { FinancialSummary, YearlyProjection } from './types'

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function buildAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number
): Array<{ month: number; payment: number; interest: number; principalPaid: number; balance: number }> {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  const payment = calculateMonthlyPayment(principal, annualRate, termYears)
  const schedule = []
  let balance = principal

  for (let month = 1; month <= n; month++) {
    const interest = balance * r
    const principalPaid = payment - interest
    balance = balance - principalPaid
    schedule.push({
      month,
      payment,
      interest,
      principalPaid,
      balance: Math.max(0, balance),
    })
  }
  return schedule
}

export function calculateFinancials(
  purchasePrice: number,
  equityPercent: number,
  annualInterestRate: number,
  loanTermYears: number,
  monthlyRentYear1: number,
  rentIncreasePercent: number,
  vacancyRate: number,
  insurance: number,
  maintenancePercent: number,
  propertyMgmtPercent: number,
  utilitiesPercent: number,
  brokerFees: number,
  hoa: number,
  propertyTax: number,
  numUnits: number,
  taxRate: number,
  depreciationYears: number,
  pointsPercent: number,
  otherEquitySpent: number,
  totalEquityInvested: number,
  closingCostsPercent: number = 4
): FinancialSummary {
  const loanPercent = 1 - equityPercent / 100
  const loanAmount = purchasePrice * loanPercent
  const equityAmount = purchasePrice * (equityPercent / 100)
  const closingCosts = purchasePrice * (closingCostsPercent / 100)
  const totalCashToClose = equityAmount + closingCosts
  const initialEquity = equityAmount + otherEquitySpent

  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears)
  const totalPayments = loanTermYears * 12
  const sumOfPayments = monthlyPayment * totalPayments
  const interestCost = sumOfPayments - loanAmount

  // Depreciable basis = 60% of purchase price (excluding land)
  const depreciableBasis = purchasePrice * 0.6
  const annualDepreciation = depreciableBasis / depreciationYears

  // Amortization of points
  const pointsDollars = loanAmount * (pointsPercent / 100)
  const annualAmortizationOfPoints = pointsDollars / loanTermYears

  const amortizationSchedule = buildAmortizationSchedule(loanAmount, annualInterestRate, loanTermYears)
  const annualDebtService = monthlyPayment * 12

  const projections: YearlyProjection[] = []
  let cumulativePrincipal = 0

  for (let year = 1; year <= 5; year++) {
    const yearlyRent = monthlyRentYear1 * 12 * Math.pow(1 + rentIncreasePercent / 100, year - 1)
    const monthlyRent = yearlyRent / 12
    const grossOperatingIncome = yearlyRent * (1 - vacancyRate / 100)

    // Variable expenses scale with yearly rent
    const maintenanceAmt = yearlyRent * (maintenancePercent / 100)
    const propertyMgmtAmt = yearlyRent * (propertyMgmtPercent / 100)
    const utilitiesAmt = yearlyRent * (utilitiesPercent / 100)
    const totalOperatingExpenses =
      insurance + maintenanceAmt + propertyMgmtAmt + utilitiesAmt + brokerFees + hoa + propertyTax
    const expenseRatio = totalOperatingExpenses / grossOperatingIncome

    const netOperatingIncome = grossOperatingIncome - totalOperatingExpenses
    const noiRatio = netOperatingIncome / grossOperatingIncome

    // Interest and principal for this year from amortization schedule
    const startMonth = (year - 1) * 12
    const yearPayments = amortizationSchedule.slice(startMonth, startMonth + 12)
    const yearlyInterest = yearPayments.reduce((sum, p) => sum + p.interest, 0)
    const yearlyPrincipal = yearPayments.reduce((sum, p) => sum + p.principalPaid, 0)

    const btCashFlowYearly = netOperatingIncome - annualDebtService
    const btCashFlowMonthly = btCashFlowYearly / 12

    const btIncome =
      netOperatingIncome - yearlyInterest - annualDepreciation - annualAmortizationOfPoints
    const incomeTax = Math.max(0, btIncome * (taxRate / 100))
    const atIncome = btIncome - incomeTax

    const atCashFlowYearly = btCashFlowYearly - incomeTax
    const atCashFlowMonthly = atCashFlowYearly / 12

    cumulativePrincipal += yearlyPrincipal

    const effectiveEquity = totalEquityInvested > 0 ? totalEquityInvested : totalCashToClose
    const cashOnCashBT = btCashFlowYearly / effectiveEquity
    const atCoCROE = atCashFlowYearly / effectiveEquity

    const capRate = netOperatingIncome / purchasePrice
    const rentToPurchaseRatio = monthlyRent / purchasePrice

    const btCashPlusPrincipal = btCashFlowYearly + yearlyPrincipal
    const btROI = btCashPlusPrincipal / effectiveEquity

    const atCashPlusPrincipal = atCashFlowYearly + yearlyPrincipal
    const atROI = atCashPlusPrincipal / effectiveEquity

    const equityDollars = equityAmount + cumulativePrincipal
    const equityPercent = equityDollars / purchasePrice

    projections.push({
      year,
      monthlyRent,
      yearlyRent,
      grossOperatingIncome,
      totalOperatingExpenses,
      expenseRatio,
      netOperatingIncome,
      noiRatio,
      annualDebtService,
      interest: yearlyInterest,
      depreciation: annualDepreciation,
      amortizationOfPoints: annualAmortizationOfPoints,
      btIncome,
      incomeTax,
      atIncome,
      btCashFlowYearly,
      btCashFlowMonthly,
      atCashFlowYearly,
      atCashFlowMonthly,
      cashOnCashBT,
      atCoCROE,
      rentToPurchaseRatio,
      capRate,
      btCashFlowPerUnit: btCashFlowMonthly / numUnits,
      atCashFlowPerUnit: atCashFlowMonthly / numUnits,
      principalPaydown: yearlyPrincipal,
      btCashPlusPrincipal,
      btROI,
      atCashPlusPrincipal,
      atROI,
      equityPercent,
      equityDollars,
    })
  }

  const effectiveEquityForPayback = totalEquityInvested > 0 ? totalEquityInvested : totalCashToClose
  const paybackPeriod = effectiveEquityForPayback / projections[0].btCashFlowYearly

  return {
    loanAmount,
    equityAmount,
    closingCosts,
    totalCashToClose,
    monthlyPayment,
    sumOfPayments,
    interestCost,
    paybackPeriod,
    totalEquityInvested,
    initialEquity,
    projections,
  }
}

export function fmt(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function fmtPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}
