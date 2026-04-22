'use client'

import { useState } from 'react'
import { DollarSign, Wallet, Home, TrendingUp, Repeat2, Shield, ChevronDown, ChevronUp, MessageCircle, Phone } from 'lucide-react'
import {
  formatCurrency,
  calculateFHADown,
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
  purchasePrice, downPayment, closingCosts, totalCashToClose,
  monthlyMortgage, monthlyCashFlowAT, numUnits,
  equityAccumulated5yr, propertyType, propertyAddress,
  calendlyUrl, whatsappNumber,
}: InvestorFAQProps) {
  const [openQ, setOpenQ] = useState<string>('q1')

  const isMulti = propertyType === 'multi'
  const fhaDown = calculateFHADown(purchasePrice)
  const fhaClosingCosts = Math.round(purchasePrice * 0.04)
  const fhaTotalCash = fhaDown + fhaClosingCosts
  const refiAvailable = calculateRefiAvailable(equityAccumulated5yr)
  const annualCashFlow = calculateAnnualCashFlow(monthlyCashFlowAT)
  const equityRecoveryPct = calculateEquityRecoveryPercent(equityAccumulated5yr, totalCashToClose)
  const coverageRemaining = 100 - Math.round(100 / numUnits)

  const toggle = (id: string) => setOpenQ(prev => prev === id ? '' : id)

  const q1Answer = monthlyCashFlowAT > 0
    ? isMulti
      ? <>
          Sí, y los números hablan solos. <Au>{numUnits} inquilinos</Au> pagando renta al mismo tiempo.
          Después de cubrir la hipoteca de <Em>{formatCurrency(monthlyMortgage)}/mes</Em> y los gastos, te quedan{' '}
          <Em>{formatCurrency(monthlyCashFlowAT)} limpios cada mes</Em> —{' '}
          <Em>{formatCurrency(annualCashFlow)} al año</Em> entrando a tu cuenta sin hacer nada extra.
          Mientras tú lo piensas, alguien más está cobrando esa renta.
        </>
      : <>
          Sí. Después de cubrir la hipoteca de <Em>{formatCurrency(monthlyMortgage)}/mes</Em>, te quedan{' '}
          <Em>{formatCurrency(monthlyCashFlowAT)} limpios cada mes</Em> —{' '}
          <Em>{formatCurrency(annualCashFlow)} al año</Em>. Es renta pasiva real, no proyección optimista.
        </>
    : <>
        En esta propiedad el juego no es el cash flow mensual — es la apreciación y el equity.
        En 5 años tu patrimonio crece a <Au>{formatCurrency(equityAccumulated5yr)}</Au> mientras
        los inquilinos pagan el préstamo. El cash llega, pero llega en forma de patrimonio.
      </>

  const q2Answer = isMulti
    ? <>
        Depende de cómo entres. Si te mudas a una unidad, usas financiamiento FHA con{' '}
        <Em>3.5% de inicial ({formatCurrency(fhaDown)})</Em> más los gastos de cierre
        (aprox. <Em>{formatCurrency(fhaClosingCosts)}</Em>) — en total{' '}
        <Em>{formatCurrency(fhaTotalCash)} en efectivo</Em> para entrar a un activo de{' '}
        <Au>{formatCurrency(purchasePrice)}</Au>. Como inversión pura (sin ocuparla),
        el cash-to-close total es <Au>{formatCurrency(totalCashToClose)}</Au>.
        La diferencia es grande — pero la herramienta correcta depende de tu estrategia, no de tu presupuesto.
      </>
    : <>
        El cash total que necesitas en la cuenta el día del cierre es{' '}
        <Au>{formatCurrency(totalCashToClose)}</Au> — eso incluye los{' '}
        <Au>{formatCurrency(downPayment)}</Au> de inicial más los{' '}
        <Em>{formatCurrency(closingCosts)}</Em> de gastos de cierre. Si la ocupas primero con FHA,
        el número baja a aproximadamente <Em>{formatCurrency(fhaTotalCash)}</Em>.
        Siempre te muestro el número completo, no solo el down payment.
      </>

  const q4Answer = equityRecoveryPct >= 50
    ? <>
        El "payback" solo por cash flow te cuenta media historia. La otra mitad — la que realmente
        construye riqueza — es el equity. En <Au>5 años</Au> esta propiedad te suma{' '}
        <Au>{formatCurrency(equityAccumulated5yr)}</Au> de patrimonio. Eso es el{' '}
        <Au>{equityRecoveryPct}%</Au> del cash total que invertiste (incluyendo gastos de cierre),
        recuperado solo en equity — sin contar el cash flow que sigue entrando todos los meses.
      </>
    : <>
        En 5 años esta propiedad construye <Au>{formatCurrency(equityAccumulated5yr)}</Au> de
        patrimonio mientras sigues recibiendo cash flow mensual. La recuperación no viene de un solo
        número — viene de la suma de equity + renta + apreciación.
      </>

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
        <>
          Sí, y probablemente es la estrategia que más sentido hace hoy. Tú ocupas una unidad,
          el inquilino de la otra cubre tu hipoteca. En la práctica:{' '}
          <Au>dejas de pagar renta y empiezas a construir patrimonio al mismo tiempo.</Au> Dos cosas
          que la mayoría piensa que son incompatibles, pero aquí sí se pueden hacer juntas.
        </>
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
        <>
          Esa es justamente la jugada completa. En 5 años esta propiedad construye{' '}
          <Au>{formatCurrency(equityAccumulated5yr)}</Au> de equity. De ahí puedes sacar hasta{' '}
          <Em>{formatCurrency(refiAvailable)}</Em> con un cash-out refi y usarlo como inicial
          (y closing costs) de la siguiente propiedad —{' '}
          <Au>sin tocar tus ahorros</Au>. La primera propiedad es la más difícil de cerrar.
          Las siguientes las financia la anterior.
        </>
      ),
    },
    ...(isMulti ? [{
      id: 'q6',
      icon: Shield,
      question: '¿Y si los inquilinos no pagan o se desocupa una?',
      answer: (
        <>
          Esa es la ventaja real de tener <Au>{numUnits} unidades</Au> en vez de una casa sola.
          Si un inquilino no paga, las otras unidades siguen cubriendo el{' '}
          <Em>{coverageRemaining}%</Em> de la hipoteca — no pierdes el 100% del ingreso como
          pasaría en un single-family. Es el mismo principio que aplica en cualquier inversión sólida:
          no dependes de una sola fuente.
        </>
      ),
    }] : []),
  ]

  const hasCTA = !!(calendlyUrl || whatsappNumber)

  return (
    <section className="space-y-4">
      {/* Section header */}
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

      {/* Accordion */}
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
                <div className="px-5 pb-5 transition-all duration-300 ease-in-out">
                  <div className="ml-11 text-sm text-gray-200 leading-relaxed">
                    {answer}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CTA */}
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
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#C9A840] hover:bg-[#e0c060] text-[#0a1628] font-bold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" /> Agendar llamada
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Me interesa ${propertyAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors border border-white/20"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
