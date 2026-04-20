import { query } from '@/lib/db'
import { Property } from '@/lib/types'
import Link from 'next/link'
import { Building2, MapPin, BedDouble, Bath, TrendingUp, ExternalLink, ArrowRight } from 'lucide-react'
import { calculateFinancials, fmtCurrency, fmtPercent } from '@/lib/calculations'

async function getProperties(): Promise<Property[]> {
  try {
    return await query<Property>(
      'SELECT * FROM properties WHERE is_active = true ORDER BY created_at DESC'
    )
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function HomePage() {
  const properties = await getProperties()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#0a1628]">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A840] rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#0a1628]" />
            </div>
            <div>
              <p className="text-[#C9A840] font-bold text-base leading-tight">JP Legacy Group</p>
              <p className="text-gray-400 text-xs">Investor Portal · Powered by eXp Realty</p>
            </div>
          </div>
          <a
            href="https://www.jplegacygroup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#C9A840] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> jplegacygroup.com
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#0a1628] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs bg-[#C9A840]/20 text-[#C9A840] border border-[#C9A840]/30 px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-4">
            Análisis Financiero Profesional
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Invierte en Multifamiliares<br />
            <span className="text-[#C9A840]">con Total Claridad</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl mx-auto">
            Analiza cada propiedad: down payment, cash flow, retorno de inversión y más.
            Todo calculado para que tomes decisiones informadas.
          </p>
        </div>
      </div>

      {/* Properties */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {properties.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">Próximamente</h2>
            <p className="text-gray-500 text-sm">Estamos preparando las oportunidades de inversión.</p>
            <a
              href="https://www.jplegacygroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#C9A840] text-[#0a1628] font-bold px-5 py-2.5 rounded-xl text-sm"
            >
              Contactar a JP Legacy <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0a1628]">
                Oportunidades de Inversión
                <span className="ml-2 text-sm font-normal text-gray-500">({properties.length} disponibles)</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => {
                const f = calculateFinancials(
                  Number(p.purchase_price), Number(p.equity_percent), Number(p.annual_interest_rate),
                  Number(p.loan_term_years), Number(p.monthly_rent_year1), Number(p.rent_increase_percent),
                  Number(p.vacancy_rate), Number(p.insurance), Number(p.maintenance_percent),
                  Number(p.property_mgmt_percent), Number(p.utilities_percent), Number(p.broker_fees),
                  Number(p.hoa), Number(p.property_tax), Number(p.num_units), Number(p.tax_rate),
                  Number(p.depreciation_years), Number(p.points_percent), Number(p.other_equity_spent),
                  Number(p.total_equity_invested)
                )
                const y1 = f.projections[0]
                return (
                  <Link key={p.id} href={`/property/${p.id}`} className="group">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-[#C9A840]/50 transition-all duration-200">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.address} className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-[#0a1628] to-[#152238] flex items-center justify-center">
                          <Building2 className="w-14 h-14 text-[#C9A840]/40" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-[#0a1628] text-[#C9A840] font-semibold px-2.5 py-1 rounded-full">
                            {p.num_units} unidades
                          </span>
                          <span className="text-xs text-gray-500">{p.property_type}</span>
                        </div>
                        <h3 className="font-bold text-[#0a1628] text-base mb-1 leading-tight">{p.address}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-4">
                          <MapPin className="w-3.5 h-3.5 text-[#C9A840]" />
                          {p.city}, {p.state}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {p.beds_per_unit} hab</span>
                          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.baths_per_unit} baños</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-[#0a1628] rounded-lg p-2.5 text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Precio</p>
                            <p className="text-sm font-bold text-[#C9A840]">{fmtCurrency(Number(p.purchase_price))}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2.5 text-center border border-green-100">
                            <p className="text-xs text-gray-500 mb-0.5">Down Payment</p>
                            <p className="text-sm font-bold text-green-700">{fmtCurrency(f.equityAmount)}</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-2.5 text-center border border-amber-100">
                            <p className="text-xs text-gray-500 mb-0.5">Cash Flow/mes</p>
                            <p className="text-sm font-bold text-amber-700">{fmtCurrency(y1.atCashFlowMonthly)}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2.5 text-center border border-blue-100">
                            <p className="text-xs text-gray-500 mb-0.5">Cap Rate</p>
                            <p className="text-sm font-bold text-blue-700">{fmtPercent(y1.capRate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#0a1628] group-hover:text-[#C9A840] font-semibold transition-colors">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Ver análisis completo
                          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
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
            © {new Date().getFullYear()} JP Legacy Group. Los números son proyecciones estimadas.
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
