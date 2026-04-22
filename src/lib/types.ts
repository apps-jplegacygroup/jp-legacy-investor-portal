export interface Property {
  id: string
  address: string
  city: string
  state: string
  zip: string
  property_type: string
  num_units: number
  beds_per_unit: number
  baths_per_unit: number
  year_built: number | null
  sqft: number | null
  closing_costs_percent: number
  image_url: string | null
  image_urls: string[] | null
  ylopo_link: string | null
  video_url: string | null
  description: string | null

  // Financial inputs
  purchase_price: number
  equity_percent: number
  annual_interest_rate: number
  loan_term_years: number
  monthly_rent_year1: number
  rent_increase_percent: number
  vacancy_rate: number
  insurance: number
  maintenance_percent: number
  property_mgmt_percent: number
  utilities_percent: number
  broker_fees: number
  hoa: number
  property_tax: number
  tax_rate: number
  depreciation_years: number
  points_percent: number
  other_equity_spent: number
  total_equity_invested: number

  // Improved scenario
  monthly_rent_improved: number | null
  renovation_cost: number | null
  renovation_notes: string | null

  status: 'available' | 'sold'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface YearlyProjection {
  year: number
  monthlyRent: number
  yearlyRent: number
  grossOperatingIncome: number
  totalOperatingExpenses: number
  expenseRatio: number
  netOperatingIncome: number
  noiRatio: number
  annualDebtService: number
  interest: number
  depreciation: number
  amortizationOfPoints: number
  btIncome: number
  incomeTax: number
  atIncome: number
  btCashFlowYearly: number
  btCashFlowMonthly: number
  atCashFlowYearly: number
  atCashFlowMonthly: number
  cashOnCashBT: number
  atCoCROE: number
  rentToPurchaseRatio: number
  capRate: number
  btCashFlowPerUnit: number
  atCashFlowPerUnit: number
  principalPaydown: number
  btCashPlusPrincipal: number
  btROI: number
  atCashPlusPrincipal: number
  atROI: number
  equityPercent: number
  equityDollars: number
}

export interface FinancialSummary {
  loanAmount: number
  equityAmount: number
  closingCosts: number
  totalCashToClose: number
  monthlyPayment: number
  sumOfPayments: number
  interestCost: number
  paybackPeriod: number
  totalEquityInvested: number
  initialEquity: number
  projections: YearlyProjection[]
}

export interface PropertyFormData {
  address: string
  city: string
  state: string
  zip: string
  property_type: string
  num_units: number
  beds_per_unit: number
  baths_per_unit: number
  year_built: number | null
  sqft: number | null
  closing_costs_percent: number
  image_url: string | null
  image_urls: string[] | null
  ylopo_link: string | null
  video_url: string | null
  description: string | null
  purchase_price: number
  equity_percent: number
  annual_interest_rate: number
  loan_term_years: number
  monthly_rent_year1: number
  rent_increase_percent: number
  vacancy_rate: number
  insurance: number
  maintenance_percent: number
  property_mgmt_percent: number
  utilities_percent: number
  broker_fees: number
  hoa: number
  property_tax: number
  tax_rate: number
  depreciation_years: number
  points_percent: number
  other_equity_spent: number
  total_equity_invested: number

  // Improved scenario
  monthly_rent_improved: number | null
  renovation_cost: number | null
  renovation_notes: string | null
}
