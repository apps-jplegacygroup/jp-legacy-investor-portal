'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Property, FinancialSummary } from '@/lib/types'
import { calculateFinancials, fmtCurrency, fmtPercent } from '@/lib/calculations'
import {
  MapPin, Home, BedDouble, Bath, TrendingUp, DollarSign,
  BarChart3, Building2, ExternalLink, ChevronDown, ChevronUp,
  Calendar, Percent, CircleDollarSign
} from 'lucide-react'

function StatCard({
  label, value, sub, highlight, color
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  color?: 'green' | 'gold' | 'navy' | 'default'
}) {
  const colors = {
    green: 'bg-green-50 border-green-200',
    gold: 'bg-amber-50 border-amber-200',
    navy: 'bg-[#0a1628] border-[#0a1628] text-white',
    default: 'bg-white border-gray-200',
  }
  const valueColors = {
    green: 'text-green-700',
    gold: 'text-amber-700',
    navy: 'text-[#C9A840]',
    default: 'text-[#0a1628]',
  }
  const bg = color ? colors[color] : colors.default
  const vc = color ? valueColors[color] : valueColors.default
  return (
    <div className={`rounded-xl p-5 border ${bg} ${highlight ? 'ring-2 ring-[#C9A840]' : ''}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${color === 'navy' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
        {label}
      </p>
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

export default function PropertyPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [financials, setFinancials] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAmort, setShowAmort] = useState(false)
  const [activeYear, setActiveYear] = useState(1)

  useEffect(() => {
    if (!id) return
    fetch(`/api/properties/${id}`)
      .then(r => r.json())
      .then((p: Property) => {
        setProperty(p)
        const f = calculateFinancials(
          Number(p.purchase_price), Number(p.equity_percent), Number(p.annual_interest_rate),
          Number(p.loan_term_years), Number(p.monthly_rent_year1), Number(p.rent_increase_percent),
          Number(p.vacancy_rate), Number(p.insurance), Number(p.maintenance_percent),
          Number(p.property_mgmt_percent), Number(p.utilities_percent), Number(p.broker_fees),
          Number(p.hoa), Number(p.property_tax), Number(p.num_units), Number(p.tax_rate),
          Number(p.depreciation_years), Number(p.points_percent), Number(p.other_equity_spent),
          Number(p.total_equity_invested)
        )
        setFinancials(f)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C9A840] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  if (!property || !financials) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Propiedad no encontrada.</p>
      </div>
    )
  }

  const yr = financials.projections[activeYear - 1]

  const expenseBreakdown = [
    { label: 'Seguro', value: Number(property.insurance) },
    { label: 'Mantenimiento', value: yr.totalOperatingExpenses - Number(property.insurance) - Number(property.property_tax) - Number(property.hoa) - Number(property.broker_fees) - (yr.totalOperatingExpenses - Number(property.insurance) - Number(property.property_tax) - Number(property.hoa) - Number(property.broker_fees) - (yr.yearlyRent * Number(property.utilities_percent) / 100) - (yr.yearlyRent * Number(property.property_mgmt_percent) / 100)) },
    { label: 'Adm. Propiedad', value: yr.yearlyRent * Number(property.property_mgmt_percent) / 100 },
    { label: 'Servicios', value: yr.yearlyRent * Number(property.utilities_percent) / 100 },
    { label: 'Impuesto Propiedad', value: Number(property.property_tax) },
    { label: 'HOA', value: Number(property.hoa) },
  ].filter(e => e.value > 0)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#0a1628] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A840] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#0a1628]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">JP Legacy Group</p>
              <p className="text-sm font-semibold text-[#C9A840]">Investor Portal</p>
            </div>
          </div>
          <a
            href="https://www.jplegacygroup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-[#C9A840] flex items-center gap-1 transition-colors"
          >
            jplegacygroup.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Property Hero */}
      <div className="bg-[#152238] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {property.image_url && (
              <div className="md:w-80 flex-shrink-0">
                <img
                  src={property.image_url}
                  alt={property.address}
                  className="w-full h-52 object-cover rounded-xl border border-white/10"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-[#C9A840] text-[#0a1628] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {property.property_type}
                </span>
                <span className="text-xs text-gray-400">{property.num_units} unidades</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{property.address}</h1>
              <div className="flex items-center gap-1 text-gray-300 mb-4">
                <MapPin className="w-4 h-4 text-[#C9A840]" />
                <span>{property.city}, {property.state} {property.zip}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><BedDouble className="w-4 h-4 text-[#C9A840]" /> {property.beds_per_unit} hab/unidad</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-[#C9A840]" /> {property.baths_per_unit} baños/unidad</span>
                {property.sqft && <span className="flex items-center gap-1"><Home className="w-4 h-4 text-[#C9A840]" /> {property.sqft.toLocaleString()} sqft</span>}
                {property.year_built && <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#C9A840]" /> Construido {property.year_built}</span>}
              </div>
              {property.description && (
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{property.description}</p>
              )}
              {property.ylopo_link && (
                <a
                  href={property.ylopo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-[#C9A840] hover:bg-[#e0c060] text-[#0a1628] font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Ver Propiedad <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">

        {/* Key Investment Numbers */}
        <section>
          <SectionTitle icon={DollarSign} title="Resumen de Inversión" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              label="Precio de Compra"
              value={fmtCurrency(Number(property.purchase_price))}
              color="navy"
            />
            <StatCard
              label="Down Payment"
              value={fmtCurrency(financials.equityAmount)}
              sub={`${property.equity_percent}% del precio`}
              highlight
              color="gold"
            />
            <StatCard
              label="Pago Mensual (Hipoteca)"
              value={fmtCurrency(financials.monthlyPayment)}
              sub={`${property.annual_interest_rate}% · ${property.loan_term_years} años`}
            />
            <StatCard
              label="Cash Flow Mensual (Yr 1)"
              value={fmtCurrency(financials.projections[0].atCashFlowMonthly)}
              sub="After tax"
              color="green"
            />
            <StatCard
              label="Período de Retorno"
              value={`${financials.paybackPeriod.toFixed(1)} años`}
              sub="Payback period"
            />
          </div>
        </section>

        {/* Year Selector + Return Metrics */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#C9A840]" />
              </div>
              <h2 className="text-lg font-bold text-[#0a1628]">Métricas de Retorno</h2>
            </div>
            <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
              {[1, 2, 3, 4, 5].map(y => (
                <button
                  key={y}
                  onClick={() => setActiveYear(y)}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    activeYear === y
                      ? 'bg-[#0a1628] text-[#C9A840]'
                      : 'text-gray-500 hover:text-[#0a1628]'
                  }`}
                >
                  Año {y}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Cap Rate"
              value={fmtPercent(yr.capRate)}
              sub="Retorno del activo"
              color="green"
            />
            <StatCard
              label="Cash on Cash (BT)"
              value={fmtPercent(yr.cashOnCashBT)}
              sub="Antes de impuestos"
              color="green"
            />
            <StatCard
              label="Cash on Cash (AT)"
              value={fmtPercent(yr.atCoCROE)}
              sub="Después de impuestos"
              color="green"
            />
            <StatCard
              label="ROI Total (BT)"
              value={fmtPercent(yr.btROI)}
              sub="Incluyendo amortización"
              color="gold"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard
              label="Cash Flow Mensual (BT)"
              value={fmtCurrency(yr.btCashFlowMonthly)}
              sub="Antes de impuestos"
            />
            <StatCard
              label="Cash Flow Mensual (AT)"
              value={fmtCurrency(yr.atCashFlowMonthly)}
              sub="Después de impuestos"
            />
            <StatCard
              label="Cash Flow / Unidad"
              value={fmtCurrency(yr.atCashFlowPerUnit)}
              sub="Por unidad / mes"
            />
            <StatCard
              label="Equity Acumulado"
              value={fmtCurrency(yr.equityDollars)}
              sub={`${fmtPercent(yr.equityPercent)} del valor`}
              color="gold"
            />
          </div>
        </section>

        {/* 5-Year Projection Table */}
        <section>
          <SectionTitle icon={BarChart3} title="Proyección a 5 Años" />
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a1628] text-white">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300">Métrica</th>
                    {[1, 2, 3, 4, 5].map(y => (
                      <th key={y} className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[#C9A840]">
                        Año {y}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { label: 'Renta Mensual', fn: (p: typeof yr) => fmtCurrency(p.monthlyRent), section: 'income' },
                    { label: 'Renta Anual Total', fn: (p: typeof yr) => fmtCurrency(p.yearlyRent), section: 'income' },
                    { label: 'Ingreso Bruto Operativo', fn: (p: typeof yr) => fmtCurrency(p.grossOperatingIncome), section: 'income' },
                    { label: 'Gastos Operativos', fn: (p: typeof yr) => fmtCurrency(p.totalOperatingExpenses), section: 'expense' },
                    { label: 'NOI (Ingreso Neto Operativo)', fn: (p: typeof yr) => fmtCurrency(p.netOperatingIncome), section: 'noi' },
                    { label: 'Cap Rate', fn: (p: typeof yr) => fmtPercent(p.capRate), section: 'rate' },
                    { label: 'Cash Flow Mensual (BT)', fn: (p: typeof yr) => fmtCurrency(p.btCashFlowMonthly), section: 'cf' },
                    { label: 'Cash Flow Mensual (AT)', fn: (p: typeof yr) => fmtCurrency(p.atCashFlowMonthly), section: 'cf' },
                    { label: 'Cash on Cash (BT)', fn: (p: typeof yr) => fmtPercent(p.cashOnCashBT), section: 'rate' },
                    { label: 'Cash on Cash (AT)', fn: (p: typeof yr) => fmtPercent(p.atCoCROE), section: 'rate' },
                    { label: 'ROI Total (BT)', fn: (p: typeof yr) => fmtPercent(p.btROI), section: 'roi' },
                    { label: 'ROI Total (AT)', fn: (p: typeof yr) => fmtPercent(p.atROI), section: 'roi' },
                    { label: 'Amortización Anual', fn: (p: typeof yr) => fmtCurrency(p.principalPaydown), section: 'equity' },
                    { label: 'Equity Acumulado', fn: (p: typeof yr) => fmtCurrency(p.equityDollars), section: 'equity' },
                    { label: 'Equity %', fn: (p: typeof yr) => fmtPercent(p.equityPercent), section: 'equity' },
                  ].map((row, i) => {
                    const sectionColors: Record<string, string> = {
                      income: 'text-gray-800',
                      expense: 'text-red-700',
                      noi: 'text-green-700 font-semibold',
                      rate: 'text-blue-700 font-semibold',
                      cf: 'text-green-700 font-semibold',
                      roi: 'text-amber-700 font-bold',
                      equity: 'text-purple-700',
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

        {/* Income vs Expenses + Loan Details side by side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Income & Expenses Breakdown */}
          <section>
            <SectionTitle icon={Percent} title="Desglose de Gastos (Año 1)" />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Ingreso Bruto Operativo</span>
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
                <span className="text-sm font-bold text-gray-800">NOI (Año 1)</span>
                <span className="font-bold text-green-700 text-lg">{fmtCurrency(financials.projections[0].netOperatingIncome)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">Ratio de gastos</span>
                <span className="text-xs font-semibold text-gray-700">
                  {fmtPercent(financials.projections[0].expenseRatio)} del IGO
                </span>
              </div>
            </div>
          </section>

          {/* Loan Details */}
          <section>
            <SectionTitle icon={CircleDollarSign} title="Detalles del Préstamo" />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              {[
                { label: 'Precio de Compra', value: fmtCurrency(Number(property.purchase_price)) },
                { label: 'Down Payment', value: `${fmtCurrency(financials.equityAmount)} (${property.equity_percent}%)` },
                { label: 'Monto del Préstamo', value: fmtCurrency(financials.loanAmount) },
                { label: 'Tasa de Interés Anual', value: `${property.annual_interest_rate}%` },
                { label: 'Plazo del Préstamo', value: `${property.loan_term_years} años` },
                { label: 'Pago Mensual', value: fmtCurrency(financials.monthlyPayment) },
                { label: 'Total de Pagos', value: fmtCurrency(financials.sumOfPayments) },
                { label: 'Costo Total de Intereses', value: fmtCurrency(financials.interestCost) },
                { label: 'Equity Inicial Invertido', value: fmtCurrency(Number(property.total_equity_invested)) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-[#0a1628]">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Amortization toggle */}
        <section>
          <button
            onClick={() => setShowAmort(!showAmort)}
            className="flex items-center gap-2 text-sm font-semibold text-[#0a1628] hover:text-[#C9A840] transition-colors"
          >
            {showAmort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAmort ? 'Ocultar' : 'Ver'} tabla de amortización (primeros 24 meses)
          </button>
          {showAmort && (
            <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      {['#', 'Fecha', 'Pago', 'Interés', 'Principal', 'Balance'].map(h => (
                        <th key={h} className="px-3 py-2 text-right first:text-left font-semibold text-gray-300 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 24 }, (_, i) => {
                      const startDate = new Date(2026, 0, 1)
                      startDate.setMonth(startDate.getMonth() + i)
                      const label = startDate.toLocaleDateString('es-US', { month: 'short', year: '2-digit' })
                      const r = financials.loanAmount * (Number(property.annual_interest_rate) / 100 / 12)
                      const n = Number(property.loan_term_years) * 12
                      const pmt = financials.monthlyPayment
                      let bal = financials.loanAmount
                      let interest = 0
                      let principal = 0
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
              <p className="text-xs text-gray-400">Powered by eXp Realty · Florida</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Este análisis es informativo. Los números proyectados son estimaciones basadas en los datos ingresados.
            Consulta con un asesor financiero antes de invertir.
          </p>
          <a
            href="https://www.jplegacygroup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#C9A840] hover:underline"
          >
            www.jplegacygroup.com
          </a>
        </div>
      </footer>
    </div>
  )
}
