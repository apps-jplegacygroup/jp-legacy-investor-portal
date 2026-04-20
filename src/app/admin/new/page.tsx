'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ArrowLeft } from 'lucide-react'
import PropertyForm from '@/components/PropertyForm'

export default function NewPropertyPage() {
  const router = useRouter()
  const [adminKey, setAdminKey] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('adminKey')
    if (!stored) { router.push('/admin'); return }
    setAdminKey(stored)
  }, [router])

  if (!adminKey) return null

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
            <p className="text-sm font-bold text-[#C9A840]">Nueva Propiedad</p>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <PropertyForm adminKey={adminKey} />
      </main>
    </div>
  )
}
