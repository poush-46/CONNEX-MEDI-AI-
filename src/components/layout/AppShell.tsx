'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChatProvider } from '@/components/connex/ChatProvider'
import { ConnexPanel } from '@/components/connex/ConnexPanel'
import { PERSONAS, DEFAULT_PERSONA_ID } from '@/data/personas'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/patients', label: 'Patients' },
  { href: '/about', label: 'About' },
]

/**
 * Portal frame: top bar, left nav, content, and the docked Connex panel.
 *
 * `patientId` is threaded into ChatProvider so the assistant inherits the
 * patient the user is currently viewing.
 */
export function AppShell({
  children,
  patientId,
}: {
  children: React.ReactNode
  patientId?: string
}) {
  const pathname = usePathname()
  const persona = PERSONAS.find((p) => p.id === DEFAULT_PERSONA_ID)!

  return (
    <ChatProvider patientId={patientId}>
      <div className="flex h-full flex-col">
        <div className="bg-warning-500 px-4 py-1 text-center text-[11px] font-medium text-white">
          Prototype — all patient data is synthetic. Not for clinical use.
        </div>

        <header className="flex items-center gap-4 border-b border-hairline bg-white px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-plum-900 to-magenta-600 text-[13px] font-bold text-white">
              C
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink-900">Connex</span>
          </Link>

          <nav className="ml-4 hidden gap-1 sm:flex">
            {NAV.map((item) => {
              const active =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[12.5px] font-medium transition',
                    active
                      ? 'bg-magenta-600/10 text-magenta-600'
                      : 'text-ink-700 hover:bg-panel hover:text-ink-900'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-semibold leading-tight text-ink-900">
                {persona.name}
              </p>
              <p className="text-[10.5px] leading-tight text-ink-500">{persona.specialty}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-[11px] font-semibold text-white">
              {persona.initials}
            </span>
          </div>
        </header>

        {/*
          One panel instance, responsive: docked beside the content from md up,
          overlaid full-height on small screens.
        */}
        <div className="flex min-h-0 flex-1">
          <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto">{children}</main>
          <ConnexPanel />
        </div>
      </div>
    </ChatProvider>
  )
}
