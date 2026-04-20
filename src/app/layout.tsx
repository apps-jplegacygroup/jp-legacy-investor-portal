import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JP Legacy Group – Investor Portal',
  description: 'Analiza propiedades multifamiliares con proyecciones financieras detalladas.',
  openGraph: {
    title: 'JP Legacy Group – Investor Portal',
    description: 'Análisis financiero completo para inversionistas de bienes raíces multifamiliares en Florida.',
    siteName: 'JP Legacy Group',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-[#0a1628]">
        {children}
      </body>
    </html>
  )
}
