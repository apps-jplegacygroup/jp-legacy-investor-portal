'use client'

import { useState } from 'react'
import { DollarSign, Wallet, Home, TrendingUp, Repeat2, Shield, ChevronDown, ChevronUp, MessageCircle, Phone } from 'lucide-react'
import {
  formatCurrency,
  calculateRefiAvailable,
  calculateAnnualCashFlow,
  calculateEquityRecoveryPercent,
} from '@/lib/faq-helpers'

interface InvestorFAQProps {
  purchasePrice: number
  downPayment: number
  downPaymentPercent: number
  closingCosts: number
  totalCashToClose: number
  monthlyMortgage: number
  monthlyCashFlowAT: number
  monthlyCashFlowBT: number
  cashFlowPerUnit: number
  numUnits: number
  capRate: number
  cashOnCashBT: number
  roiTotalBT: number
  paybackYears: number
  equityAccumulated5yr: number
  propertyType: 'single' | 'multi'
  city: string
  propertyAddress: string
  calendlyUrl?: string
  whatsappNumber?: string
}

function Au({ children }: { children: React.ReactNode }) {
  return <strong className="text-amber-400">{children}</strong>
}
function Em({ children }: { children: React.ReactNode }) {
  return <strong className="text-emerald-400">{children}</strong>
}

export default function InvestorFAQ({
  purchasePrice, closingCosts, totalCashToClose,
  monthlyMortgage, monthlyCashFlowAT, numUnits,
  equityAccumulated5yr, propertyType, propertyAddress,
  calendlyUrl, whatsappNumber,
}: InvestorFAQProps) {
  const [openQ, setOpenQ] = useState<string>('q1')

  const isMulti = propertyType === 'multi'
  const minDown = Math.round(purchasePrice * 0.20)
  const minTotalCash = minDown + closingCosts
  const refiAvailable = calculateRefiAvailable(equityAccumulated5yr)
  const annualCashFlow = calculateAnnualCashFlow(monthlyCashFlowAT)
  const equityRecoveryPct = calculateEquityRecoveryPercent(equityAccumulated5yr, totalCashToClose)
  const coverageRemaining = 100 - Math.round(100 / numUnits)

  const toggle = (id: string) => setOpenQ(prev => prev === id ? '' : id)

  const q1Answer = monthlyCashFlowAT > 0
    ? isMulti
      ? (
        <p>
          Si, y los numeros hablan solos. <Au>{numUnits} inquilinos</Au> pagando renta al mismo tiempo.
          Despues de cubrir la hipoteca de <Em>{formatCurrency(monthlyMortgage)}/mes</Em> y los gastos,
          te quedan <Em>{formatCurrency(monthlyCashFlowAT)} limpios cada mes</Em> —{' '}
          <Em>{formatCurrency(annualCashFlow)} al año</Em> entrando a tu cuenta sin hacer nada extra.
          Mientras tu lo piensas, alguien mas esta cobrando esa renta.
        </p>
      )
      : (
        <p>
          Si. Despues de cubrir la hipoteca de <Em>{formatCurrency(monthlyMortgage)}/mes</Em>,
          te quedan <Em>{formatCurrency(monthlyCashFlowAT)} limpios cada mes</Em> —{' '}
          <Em>{formatCurrency(annualCashFlow)} al año</Em>. Es renta pasiva real, no proyeccion optimista.
        </p>
      )
    : (
      <p>
        En esta propiedad el juego no es el cash flow mensual — es la apreciacion y el equity.
        En 5 anos tu patrimonio crece a <Au>{formatCurrency(equityAccumulated5yr)}</Au> mientras
        los inquilinos pagan el prestamo. El cash llega, pero llega en forma de patrimonio.
      </p>
    )

  const q2Answer = isMulti
    ? (
      <p>
        La inversion minima para entrar como inversionista es{' '}
        <Au>20% de inicial ({formatCurrency(minDown)})</Au> mas los gastos de cierre{' '}
        (<Em>{formatCurrency(closingCosts)}</Em>) — en total{' '}
        <Em>{formatCurrency(minTotalCash)} en efectivo</Em> para entrar a un activo de{' '}
        <Au>{formatCurrency(purchasePrice)}</Au>. Si decides ocupar una unidad, puedes calificar
        para financiamiento con menos entrada y reducir ese numero.
        La herramienta correcta depende de tu estrategia, no de tu presupuesto.
      </p>
    )
    : (
      <p>
        La inversion minima es <Au>20% de inicial ({formatCurrency(minDown)})</Au> mas
        los gastos de cierre (<Em>{formatCurrency(closingCosts)}</Em>) — en total{' '}
        <Em>{formatCurrency(minTotalCash)} en efectivo</Em> para entrar a un activo de{' '}
        <Au>{formatCurrency(purchasePrice)}</Au>. Siempre te muestro el numero completo:
        no solo el down payment, sino todo lo que necesitas tener en la cuenta el dia del cierre.
      </p>
    )

  const q4Answer = equityRecoveryPct >= 50
    ? (
      <p>
        El "payback" solo por cash flow te cuenta media historia. La otra mitad — la que realmente
        construye riqueza — es el equity. En <Au>5 años</Au> esta propiedad te suma{' '}
        <Au>{formatCurrency(equityAccumulated5yr)}</Au> de patrimonio. Eso es el{' '}
        <Au>{equityRecoveryPct}%</Au> del cash total que invertiste (incluyendo gastos de cierre),
        recuperado solo en equity — sin contar el cash flow que sigue entrando todos los meses.
      </p>
    )
    : (
      <p>
        En 5 anos esta propiedad construye <Au>{formatCurrency(equityAccumulated5yr)}</Au> de
        patrimonio mientras sigues recibiendo cash flow mensual. La recuperacion no viene de un solo
        numero — viene de la suma de equity + renta + apreciacion.
      </p>
    )

  const questions = [
    {
      id: 'q1',
      icon: DollarSign,
      question: '¿Esta propiedad realmente da dinero?',
      answer: q1Answer,
    },
    {
      id: 'q2',
      icon: Wallet,
      question: '¿Cuánto dinero necesito para empezar?',
      answer: q2Answer,
    },
    ...(isMulti ? [{
      id: 'q3',
      icon: Home,
      question: '¿Puedo vivir en una y rentar las demás?',
      answer: (
        <p>
          Si, y probablemente es la estrategia que mas sentido hace hoy. Tu ocupas una unidad,
          el inquilino de la otra cubre tu hipoteca. En la practica:{' '}
          <Au>dejas de pagar renta y empiezas a construir patrimonio al mismo tiempo.</Au> Dos cosas
          que la mayoria piensa que son incompatibles, pero aqui si se pueden hacer juntas.
        </p>
      ),
    }] : []),
    {
      id: 'q4',
      icon: TrendingUp,
      question: '¿En cuánto tiempo recupero lo que invertí?',
      answer: q4Answer,
    },
    {
      id: 'q5',
      icon: Repeat2,
      question: '¿Después puedo comprar otra?',
      answer: (
        <p>
          Esa es justamente la jugada completa. En 5 anos esta propiedad construye{' '}
          <Au>{formatCurrency(equityAccumulated5yr)}</Au> de equity. De ahi puedes sacar hasta{' '}
          <Em>{formatCurrency(refiAvailable)}</Em> con un cash-out refi y usarlo como inicial
          (y closing costs) de la siguiente propiedad —{' '}
          <Au>sin tocar tus ahorros</Au>. La primera propiedad es la mas dificil de cerrar.
          Las siguientes las financia la anterior.
        </p>
      ),
    },
    ...(isMulti ? [{
      id: 'q6',
      icon: Shield,
      question: '¿Y si los inquilinos no pagan o se desocupa una?',
      answer: (
        <p>
          Esa es la ventaja real de tener <Au>{numUnits} unidades</Au> en vez de una casa sola.
          Si un inquilino no paga, las otras unidades siguen cubriendo el{' '}
          <Em>{coverageRemaining}%</Em> de la hipoteca — no pierdes el 100% del ingreso como
          pasaria en un single-family. Es el mismo principio que aplica en cualquier inversion solida:
          no dependes de una sola fuente.
        </p>
      ),
    }] : []),
  ]

  const hasCTA = !!(calendlyUrl || whatsappNumber)

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0a1628] flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageCircle className="w-5 h-5 text-[#C9A840]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0a1628]">Resuelve tus dudas antes de invertir</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Las mismas preguntas que todo inversionista inteligente se hace antes de dar el paso.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
        {questions.map(({ id, icon: Icon, question, answer }) => {
          const isOpen = openQ === id
          return (
            <div key={id} className={`transition-colors ${isOpen ? 'bg-[#0a1628]' : 'bg-white hover:bg-gray-50'}`}>
              <button
                onClick={() => toggle(id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isOpen ? 'bg-[#C9A840]/20' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isOpen ? 'text-[#C9A840]' : 'text-gray-500'}`} />
                </div>
                <span className={`flex-1 font-semibold text-sm ${isOpen ? 'text-[#C9A840]' : 'text-[#0a1628]'}`}>
                  {question}
                </span>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-[#C9A840] flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
              </button>
              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="ml-11 text-sm text-gray-200 leading-relaxed">
                    {answer}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasCTA && (
        <div className="bg-gradient-to-br from-[#0a1628] to-[#152238] rounded-xl p-6 border border-white/10 text-center">
          <h3 className="text-base font-bold text-white mb-1">
            ¿Quieres revisar estos números con alguien que ya los conoce?
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Agenda 15 minutos con Jorge y te explica cómo entrar a{' '}
            <span className="text-[#C9A840] font-semibold">{propertyAddress}</span> con tu presupuesto real.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {calendlyUrl && (
              <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#C9A840] hover:bg-[#e0c060] text-[#0a1628] font-bold text-sm px-6 py-3 rounded-xl transition-colors">
                <Phone className="w-4 h-4" /> Agendar llamada
              </a>
            )}
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Me interesa ' + propertyAddress)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors border border-white/20">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
