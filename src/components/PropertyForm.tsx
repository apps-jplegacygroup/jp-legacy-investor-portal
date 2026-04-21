'use client'

import { useState, useRef, useCallback } from 'react'
import { upload } from '@vercel/blob/client'
import { PropertyFormData } from '@/lib/types'
import { Upload, X, Loader2, ImagePlus, Star } from 'lucide-react'

const defaultValues: PropertyFormData = {
  address: '',
  city: 'Tampa Metro',
  state: 'FL',
  zip: '',
  property_type: 'Multifamily',
  num_units: 4,
  beds_per_unit: 2,
  baths_per_unit: 1,
  year_built: null,
  sqft: null,
  image_url: null,
  image_urls: null,
  ylopo_link: null,
  video_url: null,
  description: null,
  purchase_price: 1000000,
  equity_percent: 5,
  annual_interest_rate: 6.5,
  loan_term_years: 30,
  monthly_rent_year1: 11000,
  rent_increase_percent: 5,
  vacancy_rate: 5,
  insurance: 0,
  maintenance_percent: 3,
  property_mgmt_percent: 10,
  utilities_percent: 0,
  broker_fees: 0,
  hoa: 0,
  property_tax: 0,
  tax_rate: 28,
  depreciation_years: 27.5,
  points_percent: 0,
  other_equity_spent: 0,
  total_equity_invested: 165000,
  monthly_rent_improved: null,
  renovation_cost: null,
  renovation_notes: null,
}

interface Props {
  initial?: Partial<PropertyFormData>
  propertyId?: string
  adminKey: string
}

function Field({ label, name, type = 'text', prefix, suffix, help, value, onChange, required }: {
  label: string; name: string; type?: string; prefix?: string; suffix?: string
  help?: string; value: string | number | null; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#C9A840] focus-within:border-[#C9A840] bg-white">
        {prefix && <span className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-500 text-sm">{prefix}</span>}
        <input
          type={type}
          step={type === 'number' ? 'any' : undefined}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="flex-1 px-3 py-2 text-sm outline-none bg-white"
        />
        {suffix && <span className="px-3 py-2 bg-gray-50 border-l border-gray-200 text-gray-500 text-sm">{suffix}</span>}
      </div>
      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
    </div>
  )
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 shadow-sm ${accent ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b ${accent ? 'text-amber-800 border-amber-200' : 'text-[#0a1628] border-gray-100'}`}>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export default function PropertyForm({ initial, propertyId, adminKey }: Props) {
  const [form, setForm] = useState<PropertyFormData>({ ...defaultValues, ...initial })
  const [loading, setLoading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    const isReal = (url: string) => url.startsWith('http://') || url.startsWith('https://')
    if (initial?.image_urls && initial.image_urls.length > 0) return initial.image_urls.filter(isReal)
    if (initial?.image_url && isReal(initial.image_url)) return [initial.image_url]
    return []
  })

  const set = (field: keyof PropertyFormData) => (v: string) => {
    setForm(prev => {
      const next = {
        ...prev,
        [field]: v === '' ? null
          : (typeof defaultValues[field] === 'number' ? Number(v) : v),
      }
      // Auto-calculate insurance and property_tax when purchase_price changes
      if (field === 'purchase_price' && v) {
        const price = Number(v)
        if (price > 0) {
          if (!prev.insurance || prev.insurance === 0) next.insurance = Math.round(price * 0.01)
          if (!prev.property_tax || prev.property_tax === 0) next.property_tax = Math.round(price * 0.015)
        }
      }
      return next
    })
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: `/api/upload-image?adminKey=${encodeURIComponent(adminKey)}`,
    })
    return blob.url
  }

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    setUploadError('')
    setUploadingCount(c => c + imageFiles.length)
    let failed = 0
    // Upload one at a time to avoid overwhelming the server
    for (const file of imageFiles) {
      try {
        const url = await uploadFile(file)
        if (url) setImageUrls(prev => [...prev, url])
        else failed++
      } catch (err) {
        failed++
        console.error('Upload failed for', file.name, err)
        if (failed === 1) setUploadError(`Error subiendo "${file.name}": ${err instanceof Error ? err.message : 'Error desconocido'}`)
      }
      setUploadingCount(c => c - 1)
    }
    if (failed > 1) setUploadError(`${failed} fotos no se pudieron subir. Intenta de nuevo.`)
  }, [adminKey])

  const removeImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx))
  }

  const setPrimary = (idx: number) => {
    setImageUrls(prev => {
      const next = [...prev]
      const [item] = next.splice(idx, 1)
      return [item, ...next]
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFilesSelected(Array.from(e.dataTransfer.files))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties'
      const method = propertyId ? 'PUT' : 'POST'
      const submitData = {
        ...form,
        image_url: imageUrls[0] || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(submitData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error guardando propiedad')
      }
      await res.json()
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <Section title="Información de la Propiedad">
        <div className="sm:col-span-2">
          <Field label="Dirección" name="address" value={form.address} onChange={set('address')} required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ciudad <span className="text-red-500">*</span></label>
          <select value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A840] bg-white">
            <option value="Tampa Metro">Tampa Metro</option>
            <option value="Orlando Metro">Orlando Metro</option>
            <option value="Miami Metro">Miami Metro</option>
          </select>
        </div>
        <Field label="Estado" name="state" value={form.state} onChange={set('state')} required />
        <Field label="Zip Code" name="zip" value={form.zip} onChange={set('zip')} />
        <Field label="Tipo de Propiedad" name="property_type" value={form.property_type} onChange={set('property_type')} />
        <Field label="Número de Unidades" name="num_units" type="number" value={form.num_units} onChange={set('num_units')} required />
        <Field label="Habitaciones por Unidad" name="beds_per_unit" type="number" value={form.beds_per_unit} onChange={set('beds_per_unit')} />
        <Field label="Baños por Unidad" name="baths_per_unit" type="number" value={form.baths_per_unit} onChange={set('baths_per_unit')} />
        <Field label="Año de Construcción" name="year_built" type="number" value={form.year_built} onChange={set('year_built')} />
        <Field label="Pies Cuadrados (sqft)" name="sqft" type="number" value={form.sqft} onChange={set('sqft')} />

        {/* Photo Upload */}
        <div className="sm:col-span-2">
          {(() => {
            const MAX_PHOTOS = 15
            const atMax = imageUrls.length >= MAX_PHOTOS
            return (
              <>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Fotos de la Propiedad
                  <span className={`ml-2 font-normal ${atMax ? 'text-amber-600' : 'text-gray-400'}`}>
                    ({imageUrls.length}/{MAX_PHOTOS} fotos{imageUrls.length > 0 ? ' · la primera es la principal' : ''})
                  </span>
                </label>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => { if (e.target.files) { handleFilesSelected(Array.from(e.target.files).slice(0, MAX_PHOTOS - imageUrls.length)); e.target.value = '' } }} />

                {/* Drop zone — only show when not at max */}
                {!atMax && (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-xl px-6 py-5 text-center transition-all ${
                      dragOver
                        ? 'border-[#C9A840] bg-amber-50'
                        : 'border-gray-300 hover:border-[#C9A840] hover:bg-gray-50'
                    }`}
                  >
                    {uploadingCount > 0 ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo {uploadingCount} foto{uploadingCount !== 1 ? 's' : ''}...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <ImagePlus className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Arrastra fotos aquí o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-400">Puedes subir hasta {MAX_PHOTOS} fotos · JPG, PNG, WEBP · 20MB máx c/u</p>
                        {imageUrls.length > 0 && (
                          <p className="text-xs text-[#C9A840] font-semibold mt-1">
                            {MAX_PHOTOS - imageUrls.length} espacio{MAX_PHOTOS - imageUrls.length !== 1 ? 's' : ''} disponible{MAX_PHOTOS - imageUrls.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {atMax && (
                  <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-amber-700">Límite de {MAX_PHOTOS} fotos alcanzado</p>
                    <p className="text-xs text-amber-600 mt-0.5">Elimina alguna foto para poder agregar más</p>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                    {uploadError}
                  </div>
                )}

                {/* Gallery preview */}
                {imageUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {imageUrls.map((url, idx) => (
                      <div key={url + idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`foto ${idx + 1}`} className="w-full h-24 object-cover" />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-[#C9A840] text-[#0a1628] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5" /> Principal
                          </div>
                        )}
                        <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">
                          {idx + 1}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          {idx !== 0 && (
                            <button type="button" onClick={() => setPrimary(idx)}
                              title="Hacer principal"
                              className="bg-[#C9A840] text-[#0a1628] rounded-full p-1 hover:bg-yellow-400">
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(idx)}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Add more button within grid */}
                    {!atMax && uploadingCount === 0 && (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="rounded-lg border-2 border-dashed border-gray-300 hover:border-[#C9A840] hover:bg-gray-50 h-24 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#C9A840] transition-all">
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-[10px] font-semibold">Agregar</span>
                      </button>
                    )}
                    {uploadingCount > 0 && (
                      <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 h-24 flex flex-col items-center justify-center gap-1 text-amber-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[10px] font-semibold">{uploadingCount} subiendo...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )
          })()}

          <div className="mt-2">
            <Field label="O pega URL de imagen" name="image_url" value={imageUrls[0] ?? form.image_url} onChange={v => { if (v) setImageUrls(prev => prev.length ? [v, ...prev.slice(1)] : [v]); else setImageUrls(prev => prev.slice(1)) }} help="URL directa de la imagen principal (jpg, png, webp)" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <Field label="Link de Ylopo / MLS" name="ylopo_link" value={form.ylopo_link} onChange={set('ylopo_link')} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Link de Video (Instagram, YouTube, etc.)" name="video_url" value={form.video_url} onChange={set('video_url')} help="URL del video de Instagram, YouTube o cualquier plataforma" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
          <textarea value={form.description ?? ''} onChange={e => setForm(prev => ({ ...prev, description: e.target.value || null }))}
            rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A840]" />
        </div>
      </Section>

      <Section title="Variables del Préstamo">
        <Field label="Precio de Compra" name="purchase_price" type="number" prefix="$" value={form.purchase_price} onChange={set('purchase_price')} required />
        <Field label="Down Payment %" name="equity_percent" type="number" suffix="%" value={form.equity_percent} onChange={set('equity_percent')} help="Ej: 25 = 25%" required />
        <Field label="Tasa de Interés Anual" name="annual_interest_rate" type="number" suffix="%" value={form.annual_interest_rate} onChange={set('annual_interest_rate')} required />
        <Field label="Plazo del Préstamo (años)" name="loan_term_years" type="number" value={form.loan_term_years} onChange={set('loan_term_years')} required />
        <Field label="Puntos del Préstamo (%)" name="points_percent" type="number" suffix="%" value={form.points_percent} onChange={set('points_percent')} />
        <Field label="Equity Total Invertido" name="total_equity_invested" type="number" prefix="$" value={form.total_equity_invested} onChange={set('total_equity_invested')} help="Down payment + costos adicionales" required />
      </Section>

      <Section title="Escenario Actual — Renta Actual">
        <Field label="Renta Mensual Año 1 (todas las unidades)" name="monthly_rent_year1" type="number" prefix="$" value={form.monthly_rent_year1} onChange={set('monthly_rent_year1')} required />
        <Field label="Incremento Anual de Renta" name="rent_increase_percent" type="number" suffix="%" value={form.rent_increase_percent} onChange={set('rent_increase_percent')} />
        <Field label="Tasa de Vacancia" name="vacancy_rate" type="number" suffix="%" value={form.vacancy_rate} onChange={set('vacancy_rate')} />
      </Section>

      <Section title="Escenario Mejorado — Renta con Renovación Cosmética" accent>
        <div className="sm:col-span-2">
          <p className="text-xs text-amber-700 mb-3">
            Define el escenario después de una mejora cosmética que lleva las rentas al mercado actual.
          </p>
        </div>
        <Field label="Renta Mensual Mejorada (todas las unidades)" name="monthly_rent_improved" type="number" prefix="$"
          value={form.monthly_rent_improved} onChange={set('monthly_rent_improved')}
          help="Renta estimada después de renovación cosmética" />
        <Field label="Costo de Renovación Estimado *" name="renovation_cost" type="number" prefix="$"
          value={form.renovation_cost} onChange={set('renovation_cost')}
          help="* Estimado — verificar con su contratista antes de tomar decisiones" />
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción de Mejoras</label>
          <textarea value={form.renovation_notes ?? ''} onChange={e => setForm(prev => ({ ...prev, renovation_notes: e.target.value || null }))}
            rows={2} placeholder="Ej: Pintura, pisos, cocina, baños — llevar rentas de $1,200 a $1,500/unidad"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A840]" />
        </div>
      </Section>

      <Section title="Variables de Gastos">
        <Field label="Seguro Anual" name="insurance" type="number" prefix="$" value={form.insurance} onChange={set('insurance')} required />
        <Field label="Mantenimiento (% de renta anual)" name="maintenance_percent" type="number" suffix="%" value={form.maintenance_percent} onChange={set('maintenance_percent')} />
        <Field label="Administración de Propiedad (% de renta)" name="property_mgmt_percent" type="number" suffix="%" value={form.property_mgmt_percent} onChange={set('property_mgmt_percent')} />
        <Field label="Servicios / Utilities (% de renta)" name="utilities_percent" type="number" suffix="%" value={form.utilities_percent} onChange={set('utilities_percent')} />
        <Field label="Comisión de Broker ($)" name="broker_fees" type="number" prefix="$" value={form.broker_fees} onChange={set('broker_fees')} />
        <Field label="HOA Anual" name="hoa" type="number" prefix="$" value={form.hoa} onChange={set('hoa')} />
        <Field label="Impuesto a la Propiedad (anual)" name="property_tax" type="number" prefix="$" value={form.property_tax} onChange={set('property_tax')} required />
      </Section>

      <Section title="Variables de Impuestos y Depreciación">
        <Field label="Tasa de Impuesto sobre la Renta" name="tax_rate" type="number" suffix="%" value={form.tax_rate} onChange={set('tax_rate')} required />
        <Field label="Años de Depreciación" name="depreciation_years" type="number" value={form.depreciation_years} onChange={set('depreciation_years')} help="Residencial: 27.5 años" />
        <Field label="Otros Gastos Iniciales de Equity" name="other_equity_spent" type="number" prefix="$" value={form.other_equity_spent} onChange={set('other_equity_spent')} />
      </Section>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 bg-[#0a1628] hover:bg-[#152238] text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50">
          {loading ? 'Guardando...' : propertyId ? 'Guardar Cambios' : 'Crear Propiedad'}
        </button>
        <button type="button" onClick={() => { window.location.href = '/admin' }}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
          Cancelar
        </button>
      </div>
    </form>
  )
}
