'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, LineChart, Line,
} from 'recharts'
import { YearlyProjection } from '@/lib/types'
import { fmtCurrency } from '@/lib/calculations'

interface Props {
  projections: YearlyProjection[]
}

const TOOLTIP_STYLE = {
  background: '#152238',
  border: '1px solid rgba(201,168,64,0.4)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
}

const TICK_STYLE = { fill: '#9ca3af', fontSize: 11 }

export default function FinancialCharts({ projections }: Props) {
  const data = projections.map((p, i) => ({
    año: `Año ${i + 1}`,
    cashFlowBT: Math.round(p.btCashFlowMonthly * 12),
    cashFlowAT: Math.round(p.atCashFlowMonthly * 12),
    equity: Math.round(p.equityDollars),
    capRate: parseFloat(p.capRate.toFixed(2)),
    cocBT: parseFloat(p.cashOnCashBT.toFixed(2)),
    cocAT: parseFloat(p.atCoCROE.toFixed(2)),
    roi: parseFloat(p.btROI.toFixed(2)),
  }))

  return (
    <div className="space-y-5">
      {/* Cash Flow Chart */}
      <div className="bg-[#0a1628] rounded-xl p-5 border border-white/10">
        <p className="text-xs font-bold text-[#C9A840] uppercase tracking-wider mb-4">Cash Flow Anual (BT vs AT)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={3} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
            <XAxis dataKey="año" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => fmtCurrency(Number(v))} contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff08' }} />
            <Legend iconType="circle" wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
            <Bar dataKey="cashFlowBT" name="BT (Antes Impuesto)" fill="#C9A840" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cashFlowAT" name="AT (Después Impuesto)" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Equity Growth */}
      <div className="bg-[#0a1628] rounded-xl p-5 border border-white/10">
        <p className="text-xs font-bold text-[#C9A840] uppercase tracking-wider mb-4">Crecimiento de Equity</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A840" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C9A840" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
            <XAxis dataKey="año" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => fmtCurrency(Number(v))} contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#C9A840', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="equity" name="Equity Acumulado" stroke="#C9A840" strokeWidth={2.5} fill="url(#equityGrad)" dot={{ r: 4, fill: '#C9A840', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Returns */}
      <div className="bg-[#0a1628] rounded-xl p-5 border border-white/10">
        <p className="text-xs font-bold text-[#C9A840] uppercase tracking-wider mb-4">Retornos por Año (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
            <XAxis dataKey="año" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${v}%`} tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#ffffff20' }} />
            <Legend iconType="circle" wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
            <Line type="monotone" dataKey="capRate" name="Cap Rate" stroke="#C9A840" strokeWidth={2} dot={{ r: 4, fill: '#C9A840', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="cocBT" name="CoC BT" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="cocAT" name="CoC AT" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="roi" name="ROI BT" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
