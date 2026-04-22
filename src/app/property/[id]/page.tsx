'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Property, FinancialSummary } from '@/lib/types'
import { calculateFinancials, fmtCurrency, fmtPercent } from '@/lib/calculations'
import {
  MapPin, Home, BedDouble, Bath, TrendingUp, DollarSign,
  BarChart3, Building2, ExternalLink, ChevronDown, ChevronUp,
  Calendar, Percent, CircleDollarSign, SlidersHorizontal, RotateCcw,
  Printer, Play, LineChart, ChevronLeft,
} from 'lucide-react'

const FinancialCharts = dynamic(() => import('@/components/FinancialCharts'), { ssr: false })
const InvestorFAQ = dynamic(() => import('@/components/InvestorFAQ'), { ssr: false })

type Lang = 'es' | 'en'

const T = {
  es: {
    loading: 'Cargando análisis...',
    notFound: 'Propiedad no encontrada.',
    exportPdf: 'Exportar PDF',
    units: 'unidades',
    bedUnit: 'hab/unidad',
    bathUnit: 'baños/unidad',
    built: 'Construido',
    viewProperty: 'Ver Propiedad',
    watchVideo: 'Ver Video',
    scenario: 'Escenario:',
    currentRent: 'Renta Actual',
    improvedRent: '✦ Renta Mejorada',
    renovCost: 'Costo est. renovación:',
    verifyContractor: '*verificar con contratista',
    calcTitle: 'Calculadora: Ajusta los parámetros',
    modifiedValues: 'Valores modificados',
    purchasePrice: 'Precio de Compra',
    downPaymentPct: 'Down Payment %',
    interestRate: 'Tasa de Interés %',
    monthlyRentY1: 'Renta Mensual Año 1',
    rentIncrease: 'Incremento de Renta %',
    vacancy: 'Vacancia %',
    closingCostsPct: 'Gastos de Cierre %',
    restoreValues: 'Restaurar valores originales',
    investmentSummary: 'Resumen de Inversión',
    downPayment: 'Down Payment',
    totalCashToClose: 'TOTAL CASH TO CLOSE',
    monthlyPaymentLabel: 'Pago Mensual (Hipoteca)',
    cashFlowY1: 'Cash Flow Mensual (Yr 1)',
    afterTax: 'After tax',
    paybackPeriod: 'Período de Retorno',
    paybackSub: 'Payback period',
    years: 'años',
    returnMetrics: 'Métricas de Retorno',
    year: 'Año',
    assetReturn: 'Retorno del activo',
    beforeTax: 'Antes de impuestos',
    afterTaxSub: 'Después de impuestos',
    inclAmort: 'Incluyendo amortización',
    perUnitMonth: 'Por unidad / mes',
    accumulatedEquity: 'Equity Acumulado',
    ofValue: 'del valor',
    projection5yr: 'Proyección a 5 Años',
    metric: 'Métrica',
    monthlyRent: 'Renta Mensual',
    yearlyRent: 'Renta Anual Total',
    grossOperating: 'Ingreso Bruto Operativo',
    operatingExpenses: 'Gastos Operativos',
    noi: 'NOI (Ingreso Neto Operativo)',
    capRate: 'Cap Rate',
    cfMonthlyBT: 'Cash Flow Mensual (BT)',
    cfMonthlyAT: 'Cash Flow Mensual (AT)',
    cocBT: 'Cash on Cash (BT)',
    cocAT: 'Cash on Cash (AT)',
    roiBT: 'ROI Total (BT)',
    roiAT: 'ROI Total (AT)',
    annualAmort: 'Amortización Anual',
    equityAccum: 'Equity Acumulado',
    equityPct: 'Equity %',
    graphicProjection: 'Proyección Gráfica a 5 Años',
    expenseBreakdown: 'Desglose de Gastos (Año 1)',
    grossOperatingIncome: 'Ingreso Bruto Operativo',
    noiYear1: 'NOI (Año 1)',
    expenseRatio: 'Ratio de gastos',
    ofGOI: 'del IGO',
    loanDetails: 'Detalles del Préstamo',
    loanAmount: 'Monto del Préstamo',
    annualInterestRate: 'Tasa de Interés Anual',
    loanTerm: 'Plazo del Préstamo',
    monthlyPayment: 'Pago Mensual',
    totalPayments: 'Total de Pagos',
    totalInterestCost: 'Costo Total de Intereses',
    initialEquity: 'Equity Inicial Invertido',
    disclaimerTitle: '⚠ Aviso Legal — Proyecciones Estimadas',
    disclaimerBody1: `Todos los escenarios presentados en este análisis — incluyendo cash flow, retorno sobre la inversión (ROI), cap rate, cash on cash return y proyecciones a 5 años — son estimaciones basadas en condiciones actuales del mercado y los datos ingresados. Los resultados reales pueden variar significativamente dependiendo de múltiples factores, incluyendo pero no limitados a: tasas de interés ofrecidas por el lender al momento del cierre, condiciones del mercado inmobiliario, niveles reales de vacancia, costos de mantenimiento y reparaciones inesperadas, cambios en impuestos a la propiedad, variaciones en el mercado de rentas, costos de administración, y factores macroeconómicos.`,
    disclaimerBody2: `Los costos de renovación son estimados y deben ser verificados con un contratista licenciado antes de tomar decisiones de inversión. Este análisis no constituye asesoramiento financiero, legal ni fiscal. Se recomienda consultar con un asesor financiero certificado, contador (CPA) y/o abogado especializado en bienes raíces antes de realizar cualquier inversión.`,
    disclaimerBody3: 'JP Legacy Group es un equipo de bienes raíces operando bajo eXp Realty, LLC — Licencia # CQ1062304, Estado de Florida.',
    showAmort: 'Ver tabla de amortización (primeros 24 meses)',
    hideAmort: 'Ocultar tabla de amortización (primeros 24 meses)',
    amortHeaders: ['#', 'Fecha', 'Pago', 'Interés', 'Principal', 'Balance'],
    insurance: 'Seguro',
    maintenance: 'Mantenimiento',
    propMgmt: 'Adm. Propiedad',
    utilities: 'Servicios',
    propTax: 'Impuesto Propiedad',
    hoa: 'HOA',
    footerSub: 'Powered by eXp Realty · Florida',
  },
  en: {
    loading: 'Loading analysis...',
    notFound: 'Property not found.',
    exportPdf: 'Export PDF',
    units: 'units',
    bedUnit: 'bed/unit',
    bathUnit: 'bath/unit',
    built: 'Built',
    viewProperty: 'View Property',
    watchVideo: 'Watch Video',
    scenario: 'Scenario:',
    currentRent: 'Current Rent',
    improvedRent: '✦ Improved Rent',
    renovCost: 'Est. renovation cost:',
    verifyContractor: '*verify with contractor',
    calcTitle: 'Calculator: Adjust Parameters',
    modifiedValues: 'Modified values',
    purchasePrice: 'Purchase Price',
    downPaymentPct: 'Down Payment %',
    interestRate: 'Interest Rate %',
    monthlyRentY1: 'Monthly Rent Year 1',
    rentIncrease: 'Rent Increase %',
    vacancy: 'Vacancy %',
    closingCostsPct: 'Closing Costs %',
    restoreValues: 'Restore original values',
    investmentSummary: 'Investment Summary',
    downPayment: 'Down Payment',
    totalCashToClose: 'TOTAL CASH TO CLOSE',
    monthlyPaymentLabel: 'Monthly Payment (Mortgage)',
    cashFlowY1: 'Monthly Cash Flow (Yr 1)',
    afterTax: 'After tax',
    paybackPeriod: 'Payback Period',
    paybackSub: 'Payback period',
    years: 'years',
    returnMetrics: 'Return Metrics',
    year: 'Year',
    assetReturn: 'Asset return',
    beforeTax: 'Before taxes',
    afterTaxSub: 'After taxes',
    inclAmort: 'Including amortization',
    perUnitMonth: 'Per unit / month',
    accumulatedEquity: 'Accumulated Equity',
    ofValue: 'of value',
    projection5yr: '5-Year Projection',
    metric: 'Metric',
    monthlyRent: 'Monthly Rent',
    yearlyRent: 'Annual Total Rent',
    grossOperating: 'Gross Operating Income',
    operatingExpenses: 'Operating Expenses',
    noi: 'NOI (Net Operating Income)',
    capRate: 'Cap Rate',
    cfMonthlyBT: 'Monthly Cash Flow (BT)',
    cfMonthlyAT: 'Monthly Cash Flow (AT)',
    cocBT: 'Cash on Cash (BT)',
    cocAT: 'Cash on Cash (AT)',
    roiBT: 'Total ROI (BT)',
    roiAT: 'Total ROI (AT)',
    annualAmort: 'Annual Amortization',
    equityAccum: 'Accumulated Equity',
    equityPct: 'Equity %',
    graphicProjection: '5-Year Graphical Projection',
    expenseBreakdown: 'Expense Breakdown (Year 1)',
    grossOperatingIncome: 'Gross Operating Income',
    noiYear1: 'NOI (Year 1)',
    expenseRatio: 'Expense ratio',
    ofGOI: 'of GOI',
    loanDetails: 'Loan Details',
    loanAmount: 'Loan Amount',
    annualInterestRate: 'Annual Interest Rate',
    loanTerm: 'Loan Term',
    monthlyPayment: 'Monthly Payment',
    totalPayments: 'Total Payments',
    totalInterestCost: 'Total Interest Cost',
    initialEquity: 'Initial Equity Invested',
    disclaimerTitle: '⚠ Legal Notice — Estimated Projections',
    disclaimerBody1: `All scenarios presented in this analysis — including cash flow, return on investment (ROI), cap rate, cash on cash return, and 5-year projections — are estimates based on current market conditions and the data provided. Actual results may vary significantly depending on multiple factors, including but not limited to: interest rates offered by the lender at closing, real estate market conditions, actual vacancy rates, maintenance costs and unexpected repairs, changes in property taxes, rental market fluctuations, management costs, and macroeconomic factors.`,
    disclaimerBody2: `Renovation costs are estimates and must be verified with a licensed contractor before making investment decisions. This analysis does not constitute financial, legal, or tax advice. It is recommended to consult with a certified financial advisor, CPA, and/or real estate attorney before making any investment.`,
    disclaimerBody3: 'JP Legacy Group is a real estate team operating under eXp Realty, LLC — License # CQ1062304, State of Florida.',
    showAmort: 'Show amortization table (first 24 months)',
    hideAmort: 'Hide amortization table (first 24 months)',
    amortHeaders: ['#', 'Date', 'Payment', 'Interest', 'Principal', 'Balance'],
    insurance: 'Insurance',
    maintenance: 'Maintenance',
    propMgmt: 'Property Mgmt',
    utilities: 'Utilities',
    propTax: 'Property Tax',
    hoa: 'HOA',
    footerSub: 'Powered by eXp Realty · Florida',
  },
}

function StatCard({ label, value, sub, highlight, color }: {
  label: string; value: string; sub?: string; highlight?: boolean
  color?: 'green' | 'gold' | 'navy' | 'default'
}) {
  const colors = { green: 'bg-green-50 border-green-200', gold: 'bg-amber-50 border-amber-200', navy: 'bg-[#0a1628] border-[#0a1628] text-white', default: 'bg-white border-gray-200' }
  const valueColors = { green: 'text-green-700', gold: 'text-amber-700', navy: 'text-[#C9A840]', default: 'text-[#0a1628]' }
  const bg = color ? colors[color] : colors.default
  const vc = color ? valueColors[color] : valueColors.default
  return (
    <div className={`rounded-xl p-5 border ${bg} ${highlight ? 'ring-2 ring-[#C9A840]' : ''}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${color === 'navy' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>{label}</p>
      <p className={`text-2xl font-bold ${vc}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${color === 'navy' ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#C9A840]" />
      </div>
      <h2 className="text-lg font-bold text-[#0a1628]">{title}</h2>
    </div>
  )
}

function CalcInput({ label, value, onChange, prefix, suffix, min, max, step }: {
  label: string; value: string; onChange: (v: string) => void
  prefix?: string; suffix?: string; min?: string; max?: string; step?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-300 mb-1">{label}</label>
      <div className="flex items-center bg-[#0a1628] border border-white/20 rounded-lg overflow-hidden focus-within:border-[#C9A840] transition-colors">
        {prefix && <span className="px-2 py-2 text-gray-400 text-sm border-r border-white/10">{prefix}</span>}
        <input
          type="number"
          step={step ?? 'any'}
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-2 py-2 text-sm text-white bg-transparent outline-none w-0"
        />
        {suffix && <span className="px-2 py-2 text-gray-400 text-sm border-l border-white/10">{suffix}</span>}
      </div>
    </div>
  )
}

type CalcFields = {
  purchase_price: string; equity_percent: string; annual_interest_rate: string
  monthly_rent_year1: string; rent_increase_percent: string; vacancy_rate: string
  closing_costs_percent: string
}

export default function PropertyPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAmort, setShowAmort] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [activeYear, setActiveYear] = useState(1)
  const [calcInputs, setCalcInputs] = useState<CalcFields | null>(null)
  const [scenario, setScenario] = useState<'actual' | 'mejorado'>('actual')
  const [lang, setLang] = useState<Lang>('es')

  const t = T[lang]

  useEffect(() => {
    if (!id) return
    fetch(`/api/properties/${id}`)
      .then(r => r.json())
      .then((p: Property) => { setProperty(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const defaults = useMemo<CalcFields | null>(() => {
    if (!property) return null
    const rent = scenario === 'mejorado' && property.monthly_rent_improved
      ? Number(property.monthly_rent_improved)
      : Number(property.monthly_rent_year1)
    return {
      purchase_price: String(Number(property.purchase_price)),
      equity_percent: String(Number(property.equity_percent)),
      annual_interest_rate: String(Number(property.annual_interest_rate)),
      monthly_rent_year1: String(rent),
      rent_increase_percent: String(Number(property.rent_increase_percent)),
      vacancy_rate: String(Number(property.vacancy_rate)),
      closing_costs_percent: String(Number(property.closing_costs_percent) || 4),
    }
  }, [property, scenario])

  const inputs = calcInputs ?? defaults
  const isDirty = calcInputs !== null

  const hasImprovedScenario = !!(property?.monthly_rent_improved && Number(property.monthly_rent_improved) > 0)

  const financials = useMemo<FinancialSummary | null>(() => {
    if (!property || !inputs) return null
    const pp = Number(inputs.purchase_price) || Number(property.purchase_price)
    const ep = Number(inputs.equity_percent) || Number(property.equity_percent)
    const air = Number(inputs.annual_interest_rate) || Number(property.annual_interest_rate)
    const mr = Number(inputs.monthly_rent_year1) || Number(property.monthly_rent_year1)
    const ri = Number(inputs.rent_increase_percent)
    const vr = Number(inputs.vacancy_rate)
    return calculateFinancials(
      pp, ep, air,
      Number(property.loan_term_years), mr, ri,
      vr, Number(property.insurance), Number(property.maintenance_percent),
      Number(property.property_mgmt_percent), Number(property.utilities_percent), Number(property.broker_fees),
      Number(property.hoa), Number(property.property_tax), Number(property.num_units), Number(property.tax_rate),
      Number(property.depreciation_years), Number(property.points_percent), Number(property.other_equity_spent),
      Number(property.total_equity_invested),
      Number(inputs.closing_costs_percent) || 4
    )
  }, [property, inputs])

  const updateInput = (field: keyof CalcFields) => (v: string) => {
    setCalcInputs(prev => ({ ...(prev ?? defaults!), [field]: v }))
  }

  const resetCalc = () => { setCalcInputs(null) }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C9A840] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!property || !financials || !inputs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t.notFound}</p>
      </div>
    )
  }

  const yr = financials.projections[activeYear - 1]

  const expenseBreakdown = [
    { label: t.insurance, value: Number(property.insurance) },
    { label: t.maintenance, value: yr.yearlyRent * Number(property.maintenance_percent) / 100 },
    { label: t.propMgmt, value: yr.yearlyRent * Number(property.property_mgmt_percent) / 100 },
    { label: t.utilities, value: yr.yearlyRent * Number(property.utilities_percent) / 100 },
    { label: t.propTax, value: Number(property.property_tax) },
    { label: t.hoa, value: Number(property.hoa) },
  ].filter(e => e.value > 0)

  const projectionRows = [
    { label: t.monthlyRent, fn: (p: typeof yr) => fmtCurrency(p.monthlyRent), section: 'income' },
    { label: t.yearlyRent, fn: (p: typeof yr) => fmtCurrency(p.yearlyRent), section: 'income' },
    { label: t.grossOperating, fn: (p: typeof yr) => fmtCurrency(p.grossOperatingIncome), section: 'income' },
    { label: t.operatingExpenses, fn: (p: typeof yr) => fmtCurrency(p.totalOperatingExpenses), section: 'expense' },
    { label: t.noi, fn: (p: typeof yr) => fmtCurrency(p.netOperatingIncome), section: 'noi' },
    { label: t.capRate, fn: (p: typeof yr) => fmtPercent(p.capRate), section: 'rate' },
    { label: t.cfMonthlyBT, fn: (p: typeof yr) => fmtCurrency(p.btCashFlowMonthly), section: 'cf' },
    { label: t.cfMonthlyAT, fn: (p: typeof yr) => fmtCurrency(p.atCashFlowMonthly), section: 'cf' },
    { label: t.cocBT, fn: (p: typeof yr) => fmtPercent(p.cashOnCashBT), section: 'rate' },
    { label: t.cocAT, fn: (p: typeof yr) => fmtPercent(p.atCoCROE), section: 'rate' },
    { label: t.roiBT, fn: (p: typeof yr) => fmtPercent(p.btROI), section: 'roi' },
    { label: t.roiAT, fn: (p: typeof yr) => fmtPercent(p.atROI), section: 'roi' },
    { label: t.annualAmort, fn: (p: typeof yr) => fmtCurrency(p.principalPaydown), section: 'equity' },
    { label: t.equityAccum, fn: (p: typeof yr) => fmtCurrency(p.equityDollars), section: 'equity' },
    { label: t.equityPct, fn: (p: typeof yr) => fmtPercent(p.equityPercent), section: 'equity' },
  ]

  const loanDetailRows = [
    { label: t.purchasePrice, value: fmtCurrency(Number(inputs.purchase_price)) },
    { label: t.downPayment, value: `${fmtCurrency(financials.equityAmount)} (${inputs.equity_percent}%)` },
    { label: t.loanAmount, value: fmtCurrency(financials.loanAmount) },
    { label: t.annualInterestRate, value: `${inputs.annual_interest_rate}%` },
    { label: t.loanTerm, value: `${property.loan_term_years} ${t.years}` },
    { label: t.monthlyPayment, value: fmtCurrency(financials.monthlyPayment) },
    { label: t.totalPayments, value: fmtCurrency(financials.sumOfPayments) },
    { label: t.totalInterestCost, value: fmtCurrency(financials.interestCost) },
    { label: t.initialEquity, value: fmtCurrency(Number(property.total_equity_invested)) },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#0a1628] text-white no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#C9A840] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#0a1628]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">JP Legacy Group</p>
              <p className="text-sm font-semibold text-[#C9A840]">Investor Portal</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <a href="/"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors border border-white/20 no-print">
              <ChevronLeft className="w-3.5 h-3.5" /> {lang === 'en' ? 'All Properties' : 'Ver Propiedades'}
            </a>
            {/* Language Toggle */}
            <div className="flex items-center border border-white/20 rounded-lg overflow-hidden text-xs font-bold">
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1.5 transition-colors ${lang === 'es' ? 'bg-[#C9A840] text-[#0a1628]' : 'text-gray-400 hover:text-white'}`}
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-[#C9A840] text-[#0a1628]' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#C9A840] transition-colors"
            >
              <Printer className="w-4 h-4" /> {t.exportPdf}
            </button>
            <a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-[#C9A840] flex items-center gap-1 transition-colors">
              jplegacygroup.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Property Hero */}
      <div className="bg-[#152238] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {(() => {
              const mainImage = property.image_urls?.[0] || property.image_url
              if (!mainImage) return null
              return (
                <div className="md:w-80 flex-shrink-0">
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mainImage} alt={property.address} className="w-full h-52 object-cover" />
                    {property.ylopo_link && (
                      <a href={property.ylopo_link} target="_blank" rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm">
                        <Home className="w-3 h-3" /> {lang === 'en' ? 'More Photos' : 'Ver más fotos'} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-[#C9A840] text-[#0a1628] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {property.property_type}
                </span>
                <span className="text-xs text-gray-400">{property.num_units} {t.units}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{property.address}</h1>
              <div className="flex items-center gap-1 text-gray-300 mb-4">
                <MapPin className="w-4 h-4 text-[#C9A840]" />
                <span>{property.city}, {property.state} {property.zip}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><BedDouble className="w-4 h-4 text-[#C9A840]" /> {property.beds_per_unit} {t.bedUnit}</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-[#C9A840]" /> {property.baths_per_unit} {t.bathUnit}</span>
                {property.sqft && <span className="flex items-center gap-1"><Home className="w-4 h-4 text-[#C9A840]" /> {property.sqft.toLocaleString()} sqft</span>}
                {property.year_built && <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#C9A840]" /> {t.built} {property.year_built}</span>}
              </div>
              {property.description && (
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{property.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {property.ylopo_link && (
                  <a href={property.ylopo_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#C9A840] hover:bg-[#e0c060] text-[#0a1628] font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                    {t.viewProperty} <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {property.video_url && (
                  <a href={property.video_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors border border-white/20">
                    <Play className="w-4 h-4 text-[#C9A840]" /> {t.watchVideo}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Toggle */}
      {hasImprovedScenario && (
        <div className="bg-white border-b border-gray-200 no-print">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.scenario}</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => { setScenario('actual'); setCalcInputs(null) }}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${scenario === 'actual' ? 'bg-[#0a1628] text-[#C9A840]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {t.currentRent}
              </button>
              <button onClick={() => { setScenario('mejorado'); setCalcInputs(null) }}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${scenario === 'mejorado' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-amber-50'}`}>
                {t.improvedRent}
              </button>
            </div>
            {scenario === 'mejorado' && property?.renovation_notes && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                {property.renovation_notes}
              </span>
            )}
            {scenario === 'mejorado' && property?.renovation_cost && Number(property.renovation_cost) > 0 && (
              <span className="text-xs text-gray-500">
                {t.renovCost} <strong className="text-amber-700">{fmtCurrency(Number(property.renovation_cost))}</strong>
                <span className="ml-1 text-gray-400">{t.verifyContractor}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">

        {/* Interactive Calculator */}
        <section className="no-print">
          <button
            onClick={() => setShowCalc(!showCalc)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
              isDirty
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-[#0a1628]/5 border-[#0a1628]/20 text-[#0a1628] hover:bg-[#0a1628]/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {t.calcTitle}
                {isDirty && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">{t.modifiedValues}</span>}
              </span>
            </div>
            {showCalc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCalc && (
            <div className="mt-3 bg-[#152238] rounded-xl p-5 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <CalcInput label={t.purchasePrice} value={inputs.purchase_price} onChange={updateInput('purchase_price')} prefix="$" min="0" />
                <CalcInput label={t.downPaymentPct} value={inputs.equity_percent} onChange={updateInput('equity_percent')} suffix="%" min="0" max="100" step="0.5" />
                <CalcInput label={t.interestRate} value={inputs.annual_interest_rate} onChange={updateInput('annual_interest_rate')} suffix="%" min="0" max="30" step="0.1" />
                <CalcInput label={t.monthlyRentY1} value={inputs.monthly_rent_year1} onChange={updateInput('monthly_rent_year1')} prefix="$" min="0" />
                <CalcInput label={t.rentIncrease} value={inputs.rent_increase_percent} onChange={updateInput('rent_increase_percent')} suffix="%" min="0" max="20" step="0.5" />
                <CalcInput label={t.vacancy} value={inputs.vacancy_rate} onChange={updateInput('vacancy_rate')} suffix="%" min="0" max="50" step="0.5" />
                <CalcInput label={t.closingCostsPct} value={inputs.closing_costs_percent} onChange={updateInput('closing_costs_percent')} suffix="%" min="2" max="6" step="0.25" />
              </div>
              {isDirty && (
                <button onClick={resetCalc}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors border border-white/20 rounded-lg px-3 py-1.5">
                  <RotateCcw className="w-3 h-3" /> {t.restoreValues}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Key Investment Numbers */}
        <section>
          <SectionTitle icon={DollarSign} title={t.investmentSummary} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label={t.purchasePrice} value={fmtCurrency(Number(inputs.purchase_price))} color="navy" />
            <StatCard label={t.downPayment} value={fmtCurrency(financials.equityAmount)}
              sub={`${inputs.equity_percent}% del precio`} color="gold" />
            <StatCard label={t.totalCashToClose} value={fmtCurrency(financials.totalCashToClose)}
              sub={`${fmtCurrency(financials.equityAmount)} down + ${fmtCurrency(financials.closingCosts)} cierre`}
              highlight color="gold" />
            <StatCard label={t.monthlyPaymentLabel} value={fmtCurrency(financials.monthlyPayment)}
              sub={`${inputs.annual_interest_rate}% · ${property.loan_term_years} ${t.years}`} />
            <StatCard label={t.cashFlowY1} value={fmtCurrency(financials.projections[0].atCashFlowMonthly)}
              sub={t.afterTax} color="green" />
            <StatCard label={t.paybackPeriod} value={`${financials.paybackPeriod.toFixed(1)} ${t.years}`} sub={t.paybackSub} />
          </div>
        </section>

        {/* Year Selector + Return Metrics */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#C9A840]" />
              </div>
              <h2 className="text-lg font-bold text-[#0a1628]">{t.returnMetrics}</h2>
            </div>
            <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
              {[1, 2, 3, 4, 5].map(y => (
                <button key={y} onClick={() => setActiveYear(y)}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    activeYear === y ? 'bg-[#0a1628] text-[#C9A840]' : 'text-gray-500 hover:text-[#0a1628]'
                  }`}>
                  {t.year} {y}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Cap Rate" value={fmtPercent(yr.capRate)} sub={t.assetReturn} color="green" />
            <StatCard label="Cash on Cash (BT)" value={fmtPercent(yr.cashOnCashBT)} sub={t.beforeTax} color="green" />
            <StatCard label="Cash on Cash (AT)" value={fmtPercent(yr.atCoCROE)} sub={t.afterTaxSub} color="green" />
            <StatCard label="ROI Total (BT)" value={fmtPercent(yr.btROI)} sub={t.inclAmort} color="gold" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard label={`${t.cfMonthlyBT.replace('Monthly ', '')}`} value={fmtCurrency(yr.btCashFlowMonthly)} sub={t.beforeTax} />
            <StatCard label={`${t.cfMonthlyAT.replace('Monthly ', '')}`} value={fmtCurrency(yr.atCashFlowMonthly)} sub={t.afterTaxSub} />
            <StatCard label={lang === 'en' ? 'Cash Flow / Unit' : 'Cash Flow / Unidad'} value={fmtCurrency(yr.atCashFlowPerUnit)} sub={t.perUnitMonth} />
            <StatCard label={t.accumulatedEquity} value={fmtCurrency(yr.equityDollars)}
              sub={`${fmtPercent(yr.equityPercent)} ${t.ofValue}`} color="gold" />
          </div>
        </section>

        {/* 5-Year Projection Table */}
        <section>
          <SectionTitle icon={BarChart3} title={t.projection5yr} />
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a1628] text-white">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300">{t.metric}</th>
                    {[1, 2, 3, 4, 5].map(y => (
                      <th key={y} className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[#C9A840]">{t.year} {y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectionRows.map((row, i) => {
                    const sectionColors: Record<string, string> = {
                      income: 'text-gray-800', expense: 'text-red-700', noi: 'text-green-700 font-semibold',
                      rate: 'text-blue-700 font-semibold', cf: 'text-green-700 font-semibold',
                      roi: 'text-amber-700 font-bold', equity: 'text-purple-700',
                    }
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-2.5 text-gray-600 font-medium text-xs">{row.label}</td>
                        {financials.projections.map((p, yi) => (
                          <td key={yi} className={`px-4 py-2.5 text-right font-mono text-xs ${sectionColors[row.section]}`}>
                            {row.fn(p)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Investor FAQ */}
        <InvestorFAQ
          purchasePrice={Number(inputs.purchase_price)}
          downPayment={financials.equityAmount}
          downPaymentPercent={Number(inputs.equity_percent)}
          closingCosts={financials.closingCosts}
          totalCashToClose={financials.totalCashToClose}
          monthlyMortgage={financials.monthlyPayment}
          monthlyCashFlowAT={financials.projections[0].atCashFlowMonthly}
          monthlyCashFlowBT={financials.projections[0].btCashFlowMonthly}
          cashFlowPerUnit={financials.projections[0].atCashFlowPerUnit}
          numUnits={Number(property.num_units)}
          capRate={financials.projections[0].capRate * 100}
          cashOnCashBT={financials.projections[0].cashOnCashBT * 100}
          roiTotalBT={financials.projections[0].btROI * 100}
          paybackYears={financials.paybackPeriod}
          equityAccumulated5yr={financials.projections[4].equityDollars}
          propertyType={Number(property.num_units) > 1 ? 'multi' : 'single'}
          city={property.city}
          propertyAddress={property.address}
        />

        {/* Charts Section */}
        <section>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2 mb-4 text-[#0a1628] hover:text-[#C9A840] transition-colors no-print"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center">
              <LineChart className="w-4 h-4 text-[#C9A840]" />
            </div>
            <h2 className="text-lg font-bold">{t.graphicProjection}</h2>
            {showCharts ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
          {showCharts && <FinancialCharts projections={financials.projections} />}
        </section>

        {/* Income vs Expenses + Loan Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <SectionTitle icon={Percent} title={t.expenseBreakdown} />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">{t.grossOperatingIncome}</span>
                <span className="font-bold text-green-700">{fmtCurrency(financials.projections[0].grossOperatingIncome)}</span>
              </div>
              <div className="space-y-2 mb-4">
                {expenseBreakdown.map((e, i) => {
                  const pct = e.value / financials.projections[0].grossOperatingIncome
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{e.label}</span>
                        <span className="font-semibold text-red-700">({fmtCurrency(e.value)})</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, pct * 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-800">{t.noiYear1}</span>
                <span className="font-bold text-green-700 text-lg">{fmtCurrency(financials.projections[0].netOperatingIncome)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{t.expenseRatio}</span>
                <span className="text-xs font-semibold text-gray-700">{fmtPercent(financials.projections[0].expenseRatio)} {t.ofGOI}</span>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle icon={CircleDollarSign} title={t.loanDetails} />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              {loanDetailRows.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-[#0a1628]">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Disclaimer */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-xs text-gray-500 leading-relaxed">
          <p className="font-bold text-gray-700 mb-2 uppercase tracking-wide text-xs">{t.disclaimerTitle}</p>
          <p>{t.disclaimerBody1}</p>
          <p className="mt-2">{t.disclaimerBody2}</p>
          <p className="mt-2 text-gray-400">{t.disclaimerBody3}</p>
        </section>

        {/* Amortization toggle */}
        <section>
          <button onClick={() => setShowAmort(!showAmort)}
            className="flex items-center gap-2 text-sm font-semibold text-[#0a1628] hover:text-[#C9A840] transition-colors no-print">
            {showAmort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAmort ? t.hideAmort : t.showAmort}
          </button>
          {showAmort && (
            <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      {t.amortHeaders.map(h => (
                        <th key={h} className="px-3 py-2 text-right first:text-left font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 24 }, (_, i) => {
                      const startDate = new Date(2026, 0, 1)
                      startDate.setMonth(startDate.getMonth() + i)
                      const locale = lang === 'en' ? 'en-US' : 'es-US'
                      const label = startDate.toLocaleDateString(locale, { month: 'short', year: '2-digit' })
                      const r = financials.loanAmount * (Number(inputs.annual_interest_rate) / 100 / 12)
                      const pmt = financials.monthlyPayment
                      let bal = financials.loanAmount
                      let interest = 0, principal = 0
                      for (let m = 0; m <= i; m++) {
                        interest = bal * r
                        principal = pmt - interest
                        if (m < i) bal -= principal
                      }
                      bal -= principal
                      return (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{label}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmtCurrency(pmt)}</td>
                          <td className="px-3 py-2 text-right font-mono text-red-600">{fmtCurrency(interest)}</td>
                          <td className="px-3 py-2 text-right font-mono text-green-600">{fmtCurrency(principal)}</td>
                          <td className="px-3 py-2 text-right font-mono text-gray-700">{fmtCurrency(Math.max(0, bal))}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A840] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#0a1628]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#C9A840]">JP Legacy Group</p>
              <p className="text-xs text-gray-400">{t.footerSub}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} JP Legacy Group · Powered by eXp Realty
          </p>
          <a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
            className="text-xs text-[#C9A840] hover:underline">
            www.jplegacygroup.com
          </a>
        </div>
      </footer>
    </div>
  )
}
