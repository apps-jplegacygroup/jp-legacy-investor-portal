import { query } from '@/lib/db'
import { Property } from '@/lib/types'
import { Building2, ExternalLink } from 'lucide-react'
import PropertyGrid from '@/components/PropertyGrid'

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
    <div className="min-h-screen flex flex-col bg-white">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* JP Logo mark */}
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
              <Building2 className="w-6 h-6 text-[#0a1628]" />
            </div>
            <div className="border-l border-white/30 pl-3">
              <p className="text-white font-bold text-base leading-tight tracking-wide">JP Legacy Group</p>
              <p className="text-white/60 text-xs">eXp Realty</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Compra', 'Vende', 'Inversiones', 'Contacto'].map(item => (
              <a key={item} href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
                className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 bg-[#C9A840] hover:bg-[#e0c060] text-[#0a1628] font-bold text-sm px-4 py-2 rounded-lg transition-colors">
            jplegacygroup.com <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1800&q=80')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-[#C9A840] text-xs font-bold uppercase tracking-[0.3em] mb-6">
            Investor Portal · Florida
          </p>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none tracking-tight">
            JP Legacy Group
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-3 text-white/90">
            Real Estate Team in Florida{' '}
            <span className="text-white/50">|</span>{' '}
            <span className="text-[#C9A840]">Powered by eXp Realty</span>
          </p>
          <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10">
            Analiza propiedades multifamiliares con claridad total — down payment, cash flow y retorno de inversión.
          </p>

          {/* CTA Scroll */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#propiedades"
              className="bg-[#C9A840] hover:bg-[#e0c060] text-[#0a1628] font-black text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#C9A840]/30">
              Ver Oportunidades de Inversión
            </a>
            <a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
              className="border border-white/30 hover:border-white/60 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors">
              Conocer JP Legacy
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#0a1628] text-white">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Mercados activos', value: '3' },
            { label: 'Años de experiencia', value: '10+' },
            { label: 'Transacciones cerradas', value: '200+' },
            { label: 'Powered by', value: 'eXp Realty' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl font-black text-[#C9A840]">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      <main id="propiedades" className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-[#C9A840] uppercase tracking-widest mb-2">Portafolio Activo</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#0a1628]">Oportunidades de Inversión</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            Selecciona una ciudad y explora el análisis financiero completo de cada propiedad.
          </p>
        </div>
        <PropertyGrid properties={properties} />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white mt-8">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#C9A840] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#0a1628]" />
                </div>
                <div>
                  <p className="font-black text-white">JP Legacy Group</p>
                  <p className="text-xs text-gray-400">Powered by eXp Realty · Florida</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Helping clients buy, sell, and invest in residential real estate across Florida.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <p className="font-bold text-[#C9A840] mb-3 text-xs uppercase tracking-wider">Portal</p>
                <div className="space-y-2 text-gray-400">
                  <p><a href="/" className="hover:text-white transition-colors">Propiedades</a></p>
                  <p><a href="/admin" className="hover:text-white transition-colors">Admin</a></p>
                </div>
              </div>
              <div>
                <p className="font-bold text-[#C9A840] mb-3 text-xs uppercase tracking-wider">Contacto</p>
                <div className="space-y-2 text-gray-400">
                  <p><a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">jplegacygroup.com</a></p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} JP Legacy Group. Los números son proyecciones estimadas.
            </p>
            <p className="text-xs text-gray-600">
              Este análisis es informativo. Consulta con un asesor financiero antes de invertir.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
