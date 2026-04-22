'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Property } from '@/lib/types'
import { Building2, Plus, Eye, Pencil, Trash2, Copy, ExternalLink, Upload, X, CheckCircle, AlertCircle, Loader2, Tag } from 'lucide-react'

interface ImportResult {
  uid: string
  filename: string
  status: 'pending' | 'processing' | 'done' | 'error'
  data?: Partial<Property>
  error?: string
  savedId?: string
  saving?: boolean
  saveError?: string
}

const IMPORT_DEFAULTS = {
  city: 'Miami Metro', state: 'FL', zip: '', property_type: 'Multifamily',
  num_units: 4, beds_per_unit: 2, baths_per_unit: 1,
  year_built: null, sqft: null, image_url: null, ylopo_link: null, video_url: null, description: null,
  equity_percent: 25, annual_interest_rate: 7.0, loan_term_years: 30,
  monthly_rent_year1: 0, rent_increase_percent: 3, vacancy_rate: 5,
  maintenance_percent: 3, property_mgmt_percent: 10,
  utilities_percent: 0, broker_fees: 0, hoa: 0,
  tax_rate: 28, depreciation_years: 27.5, points_percent: 0,
  other_equity_spent: 0, total_equity_invested: 0,
}

function withEstimatedExpenses(data: Partial<Property>): Partial<Property> {
  const price = Number(data.purchase_price || 0)
  return {
    ...data,
    insurance: data.insurance || (price > 0 ? Math.round(price * 0.008) : 4000),
    property_tax: data.property_tax || (price > 0 ? Math.round(price * 0.015) : 6000),
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [showImport, setShowImport] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminKey.trim()) { setAuthError('Ingresa la clave'); return }
    setAuthenticated(true)
    if (typeof window !== 'undefined') sessionStorage.setItem('adminKey', adminKey)
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
    await fetch(`/api/properties/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } })
    setProperties(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handleToggleStatus = async (p: Property) => {
    const newStatus = p.status === 'sold' ? 'available' : 'sold'
    const label = newStatus === 'sold' ? '¿Marcar esta propiedad como VENDIDA?' : '¿Marcar esta propiedad como Disponible?'
    if (!confirm(label)) return
    setTogglingStatus(p.id)
    const res = await fetch(`/api/properties/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setProperties(prev => prev.map(prop => prop.id === p.id ? { ...prop, status: newStatus } : prop))
    }
    setTogglingStatus(null)
  }

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/property/${id}`)
    alert('¡Link copiado al portapapeles!')
  }

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files)
    const newResults: ImportResult[] = fileArray.map(f => ({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      filename: f.name,
      status: 'pending' as const,
    }))
    setImportResults(prev => [...prev, ...newResults])
    setShowImport(true)

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const uid = newResults[i].uid

      setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, status: 'processing' } : r))

      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('adminKey', adminKey)
        const res = await fetch('/api/import-pdf', {
          method: 'POST',
          headers: { 'x-admin-key': adminKey },
          body: fd,
        })
        const json = await res.json()
        if (json.success && json.properties?.length > 0) {
          const props: Partial<Property>[] = json.properties
          if (props.length === 1) {
            setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, status: 'done', data: props[0] } : r))
          } else {
            // Multiple properties found — expand into separate results
            const extras: ImportResult[] = props.slice(1).map((p, idx) => ({
              uid: `${uid}-${idx + 1}`,
              filename: `${file.name} (${idx + 2}/${props.length})`,
              status: 'done' as const,
              data: p,
            }))
            setImportResults(prev => {
              const updated = prev.map(r => r.uid === uid
                ? { ...r, status: 'done' as const, data: props[0], filename: `${file.name} (1/${props.length})` }
                : r)
              return [...updated, ...extras]
            })
          }
        } else {
          setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, status: 'error', error: json.error || 'No se encontraron propiedades' } : r))
        }
      } catch {
        setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, status: 'error', error: 'Error de conexión' } : r))
      }
    }
  }

  const saveOne = async (uid: string, data: Partial<Property>) => {
    setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, saving: true, saveError: undefined } : r))
    try {
      const body = withEstimatedExpenses({ ...IMPORT_DEFAULTS, ...data })
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) {
        setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, saving: false, savedId: json.id } : r))
        setProperties(prev => [json, ...prev])
        return json.id as string
      } else {
        setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, saving: false, saveError: json.error || 'Error al guardar' } : r))
        return null
      }
    } catch (e) {
      setImportResults(prev => prev.map(r => r.uid === uid ? { ...r, saving: false, saveError: 'Error de conexión' } : r))
      return null
    }
  }

  const saveAllImported = async () => {
    setSavingAll(true)
    const pending = importResults.filter(r => r.status === 'done' && !r.savedId && r.data)
    for (const r of pending) {
      await saveOne(r.uid, r.data!)
    }
    setSavingAll(false)
  }

  const pendingCount = importResults.filter(r => r.status === 'done' && !r.savedId).length
  const processingCount = importResults.filter(r => r.status === 'processing' || r.status === 'pending').length

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
              <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A840]"
                placeholder="••••••••" />
              {authError && <p className="text-red-500 text-xs mt-1">{authError}</p>}
            </div>
            <button type="submit"
              className="w-full bg-[#0a1628] hover:bg-[#152238] text-white font-bold py-2.5 rounded-lg transition-colors">
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
          <div className="flex gap-3 items-center">
            <a href="/" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Portal público
            </a>
            <button onClick={() => { setAuthenticated(false); sessionStorage.removeItem('adminKey') }}
              className="text-xs text-gray-400 hover:text-white">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0a1628]">Propiedades</h1>
            <p className="text-sm text-gray-500">
              {properties.filter(p => p.status !== 'sold').length} disponibles
              {properties.filter(p => p.status === 'sold').length > 0 && ` · ${properties.filter(p => p.status === 'sold').length} vendidas`}
            </p>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden"
              onChange={e => { if (e.target.files) { handleFilesSelected(e.target.files); e.target.value = '' } }} />
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <Upload className="w-4 h-4" /> Importar PDFs
            </button>
            <button onClick={() => router.push('/admin/new')}
              className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#152238] text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <Plus className="w-4 h-4" /> Nueva Propiedad
            </button>
          </div>
        </div>

        {/* Import Results Panel */}
        {showImport && importResults.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-amber-800">
                  Importación de PDFs
                  {processingCount > 0 && <span className="ml-2 text-xs font-normal">Procesando {processingCount}...</span>}
                </p>
                {pendingCount > 0 && processingCount === 0 && (
                  <button
                    onClick={saveAllImported}
                    disabled={savingAll}
                    className="flex items-center gap-1.5 bg-[#0a1628] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#152238] disabled:opacity-50 transition-colors"
                  >
                    {savingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                    Guardar todas ({pendingCount})
                  </button>
                )}
              </div>
              <button onClick={() => { setShowImport(false); setImportResults([]) }}>
                <X className="w-4 h-4 text-amber-600 hover:text-amber-800" />
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {importResults.map((r) => (
                <div key={r.uid} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {r.status === 'processing' && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                    {r.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                    {r.status === 'done' && !r.savedId && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {r.status === 'done' && r.savedId && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    {r.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{r.filename}</p>
                    {r.status === 'processing' && <p className="text-xs text-amber-600">Analizando con Claude AI...</p>}
                    {r.status === 'error' && <p className="text-xs text-red-500">{r.error}</p>}
                    {r.status === 'done' && r.data && (
                      <p className="text-xs text-gray-500">{r.data.address}, {r.data.city} · ${Number(r.data.purchase_price || 0).toLocaleString()}</p>
                    )}
                  {r.saveError && <p className="text-xs text-red-500">{r.saveError}</p>}
                  </div>
                  {r.status === 'done' && r.savedId && (
                    <button onClick={() => router.push(`/admin/${r.savedId}/edit`)}
                      className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap">
                      Editar detalles →
                    </button>
                  )}
                  {r.status === 'done' && !r.savedId && (
                    <button onClick={() => saveOne(r.uid, r.data!)} disabled={r.saving}
                      className="flex-shrink-0 flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 font-semibold whitespace-nowrap disabled:opacity-50">
                      {r.saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</> : 'Guardar'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#C9A840] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay propiedades aún.</p>
            <button onClick={() => router.push('/admin/new')}
              className="bg-[#C9A840] text-[#0a1628] font-bold px-6 py-2.5 rounded-xl">
              Agregar primera propiedad
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => (
              <div key={p.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${p.status === 'sold' ? 'border-red-200 opacity-80' : 'border-gray-200'}`}>
                <div className="relative">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.address} className="w-full h-40 object-cover" />
                    : <div className="w-full h-40 bg-[#0a1628] flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-[#C9A840]/50" />
                      </div>
                  }
                  {p.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full tracking-wider">VENDIDA</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[#0a1628] text-sm leading-tight">{p.address}</h3>
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {p.num_units} uni.
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{p.city}, {p.state} · ${Number(p.purchase_price).toLocaleString()}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => router.push(`/property/${p.id}`)}
                      className="flex items-center gap-1 text-xs bg-[#0a1628] text-white px-3 py-1.5 rounded-lg hover:bg-[#152238] transition-colors">
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                    <button onClick={() => copyLink(p.id)}
                      className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                      <Copy className="w-3 h-3" /> Copiar link
                    </button>
                    <button onClick={() => router.push(`/admin/${p.id}/edit`)}
                      className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => handleToggleStatus(p)} disabled={togglingStatus === p.id}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        p.status === 'sold'
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      }`}>
                      <Tag className="w-3 h-3" />
                      {togglingStatus === p.id ? '...' : p.status === 'sold' ? 'Disponible' : 'Vendida'}
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                      className="flex items-center gap-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
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
