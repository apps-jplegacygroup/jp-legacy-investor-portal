'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Building2, ArrowLeft } from 'lucide-react'
import PropertyForm from '@/components/PropertyForm'
import { Property } from '@/lib/types'

export default function EditPropertyPage() {
  const router = useRouter()
  const { id } = useParams()
  const [adminKey, setAdminKey] = useState('')
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('adminKey')
    if (!stored) { router.push('/admin'); return }
    setAdminKey(stored)
    fetch(`/api/properties/${id}`)
      .then(r => r.json())
      .then(p => { setProperty(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id, router])

  if (loading || !adminKey) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#C9A840] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Propiedad no encontrada.</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0a1628] text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-[#C9A840] rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#0a1628]" />
          </div>
          <div>
            <p className="text-xs text-gray-400">JP Legacy Group · Admin</p>
            <p className="text-sm font-bold text-[#C9A840]">Editar: {property.address}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <PropertyForm adminKey={adminKey} propertyId={property.id} initial={property} />
      </main>
    </div>
  )
}
