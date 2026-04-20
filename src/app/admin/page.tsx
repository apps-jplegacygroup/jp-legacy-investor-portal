'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Property } from '@/lib/types'
import { Building2, Plus, Eye, Pencil, Trash2, Copy, ExternalLink } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminKey.trim()) { setAuthError('Ingresa la clave'); return }
    setAuthenticated(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adminKey', adminKey)
    }
  }

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('adminKey') : null
    if (stored) { setAdminKey(stored); setAuthenticated(true) }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    fetch('/api/properties')
      .then(r => r.json())
      .then(data => { setProperties(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authenticated])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta propiedad?')) return
    setDeleting(id)
    await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    })
    setProperties(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/property/${id}`
    navigator.clipboard.writeText(url)
    alert('¡Link copiado al portapapeles!')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-[#C9A840] rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-[#0a1628]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-[#0a1628] text-center mb-1">Admin Panel</h1>
          <p className="text-sm text-gray-500 text-center mb-6">JP Legacy · Investor Portal</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Clave de Acceso</label>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A840]"
                placeholder="••••••••"
              />
              {authError && <p className="text-red-500 text-xs mt-1">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#0a1628] hover:bg-[#152238] text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0a1628] text-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C9A840] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#0a1628]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">JP Legacy Group</p>
              <p className="text-sm font-bold text-[#C9A840]">Admin · Propiedades</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Portal público
            </a>
            <button
              onClick={() => { setAuthenticated(false); sessionStorage.removeItem('adminKey') }}
              className="text-xs text-gray-400 hover:text-white ml-4"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0a1628]">Propiedades</h1>
            <p className="text-sm text-gray-500">{properties.length} propiedades activas</p>
          </div>
          <button
            onClick={() => router.push('/admin/new')}
            className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#152238] text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva Propiedad
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#C9A840] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay propiedades aún.</p>
            <button
              onClick={() => router.push('/admin/new')}
              className="bg-[#C9A840] text-[#0a1628] font-bold px-6 py-2.5 rounded-xl"
            >
              Agregar primera propiedad
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.address} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-[#0a1628] flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-[#C9A840]/50" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[#0a1628] text-sm leading-tight">{p.address}</h3>
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {p.num_units} uni.
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{p.city}, {p.state} · ${Number(p.purchase_price).toLocaleString()}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => router.push(`/property/${p.id}`)}
                      className="flex items-center gap-1 text-xs bg-[#0a1628] text-white px-3 py-1.5 rounded-lg hover:bg-[#152238] transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                    <button
                      onClick={() => copyLink(p.id)}
                      className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copiar link
                    </button>
                    <button
                      onClick={() => router.push(`/admin/${p.id}/edit`)}
                      className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> {deleting === p.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
