import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Connex — Clinical Monitoring Portal',
  description:
    'AI-assisted HCP portal for oncology treatment monitoring. Prototype using synthetic data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
