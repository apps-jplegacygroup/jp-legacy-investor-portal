import { query } from '@/lib/db'
import { Property } from '@/lib/types'
import Link from 'next/link'
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
          <a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#C9A840] transition-colors">
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
        <PropertyGrid properties={properties} />
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
          <a href="https://www.jplegacygroup.com" target="_blank" rel="noopener noreferrer"
            className="text-xs text-[#C9A840] hover:underline">
            www.jplegacygroup.com
          </a>
        </div>
      </footer>
    </div>
  )
}
