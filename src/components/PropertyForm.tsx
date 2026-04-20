'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyFormData } from '@/lib/types'

const defaultValues: PropertyFormData = {
  address: '',
  city: 'Tampa',
  state: 'FL',
  zip: '',
  property_type: 'Multifamily',
  num_units: 4,
  beds_per_unit: 2,
  baths_per_unit: 1,
  year_built: null,
  sqft: null,
  image_url: null,
  ylopo_link: null,
  description: null,
  purchase_price: 1000000,
  equity_percent: 5,
  annual_interest_rate: 6.5,
  loan_term_years: 30,
  monthly_rent_year1: 11000,
  rent_increase_percent: 5,
  vacancy_rate: 5,
  insurance: 14000,
  maintenance_percent: 3,
  property_mgmt_percent: 3,
  utilities_percent: 2,
  broker_fees: 0,
  hoa: 0,
  property_tax: 15000,
  tax_rate: 28,
  depreciation_years: 27.5,
  points_percent: 0,
  other_equity_spent: 0,
  total_equity_invested: 165000,
}

interface Props {
  initial?: Partial<PropertyFormData>
  propertyId?: string
  adminKey: string
}

function Field({ label, name, type = 'text', prefix, suffix, help, value, onChange, required }: {
  label: string
  name: string
  type?: string
  prefix?: string
  suffix?: string
  help?: string
  value: string | number | null
  onChange: (v: string) => void
  required?: boolean
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-[#0a1628] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export default function PropertyForm({ initial, propertyId, adminKey }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<PropertyFormData>({ ...defaultValues, ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof PropertyFormData) => (v: string) => {
    setForm(prev => ({
      ...prev,
      [field]: v === '' ? null
        : (typeof defaultValues[field] === 'number' ? Number(v) : v),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties'
      const method = propertyId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error guardando propiedad')
      }
      const property = await res.json()
      router.push(`/property/${property.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Section title="Información de la Propiedad">
        <div className="sm:col-span-2">
          <Field label="Dirección" name="address" value={form.address} onChange={set('address')} required />
        </div>
        <Field label="Ciudad" name="city" value={form.city} onChange={set('city')} required />
        <Field label="Estado" name="state" value={form.state} onChange={set('state')} required />
        <Field label="Zip Code" name="zip" value={form.zip} onChange={set('zip')} />
        <Field label="Tipo de Propiedad" name="property_type" value={form.property_type} onChange={set('property_type')} />
        <Field label="Número de Unidades" name="num_units" type="number" value={form.num_units} onChange={set('num_units')} required />
        <Field label="Habitaciones por Unidad" name="beds_per_unit" type="number" value={form.beds_per_unit} onChange={set('beds_per_unit')} />
        <Field label="Baños por Unidad" name="baths_per_unit" type="number" value={form.baths_per_unit} onChange={set('baths_per_unit')} />
        <Field label="Año de Construcción" name="year_built" type="number" value={form.year_built} onChange={set('year_built')} />
        <Field label="Pies Cuadrados (sqft)" name="sqft" type="number" value={form.sqft} onChange={set('sqft')} />
        <div className="sm:col-span-2">
          <Field label="URL de Imagen" name="image_url" value={form.image_url} onChange={set('image_url')} help="URL directa de la imagen (jpg, png, webp)" />
        </div>
        <div className="sm:col-span-2">
          <Field label="Link de Ylopo / MLS" name="ylopo_link" value={form.ylopo_link} onChange={set('ylopo_link')} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.description ?? ''}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value || null }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A840] focus:border-[#C9A840]"
          />
        </div>
      </Section>

      <Section title="Variables del Préstamo">
        <Field label="Precio de Compra" name="purchase_price" type="number" prefix="$" value={form.purchase_price} onChange={set('purchase_price')} required />
        <Field label="Down Payment %" name="equity_percent" type="number" suffix="%" value={form.equity_percent} onChange={set('equity_percent')} help="Ej: 5 = 5%" required />
        <Field label="Tasa de Interés Anual" name="annual_interest_rate" type="number" suffix="%" value={form.annual_interest_rate} onChange={set('annual_interest_rate')} required />
        <Field label="Plazo del Préstamo (años)" name="loan_term_years" type="number" value={form.loan_term_years} onChange={set('loan_term_years')} required />
        <Field label="Puntos del Préstamo (%)" name="points_percent" type="number" suffix="%" value={form.points_percent} onChange={set('points_percent')} />
        <Field label="Equity Total Invertido" name="total_equity_invested" type="number" prefix="$" value={form.total_equity_invested} onChange={set('total_equity_invested')} help="Down payment + costos adicionales" required />
      </Section>

      <Section title="Variables de Ingresos">
        <Field label="Renta Mensual Año 1 (todas las unidades)" name="monthly_rent_year1" type="number" prefix="$" value={form.monthly_rent_year1} onChange={set('monthly_rent_year1')} required />
        <Field label="Incremento Anual de Renta" name="rent_increase_percent" type="number" suffix="%" value={form.rent_increase_percent} onChange={set('rent_increase_percent')} />
        <Field label="Tasa de Vacancia" name="vacancy_rate" type="number" suffix="%" value={form.vacancy_rate} onChange={set('vacancy_rate')} />
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
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0a1628] hover:bg-[#152238] text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : propertyId ? 'Guardar Cambios' : 'Crear Propiedad'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
