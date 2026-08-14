'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { ChatContext as ChatCtx, ChatMessage } from '@/types/chat'

/**
 * Conversation state for the Connex panel.
 *
 * Holds messages, open/closed state, and the current page context so the
 * assistant knows which patient the user is looking at without being told.
 */

interface ChatState {
  messages: ChatMessage[]
  open: boolean
  busy: boolean
  patientId?: string
  setOpen: (open: boolean) => void
  send: (text: string) => Promise<void>
  act: (action: NonNullable<ChatCtx['action']>, label?: string) => Promise<void>
  clear: () => void
}

const Ctx = createContext<ChatState | null>(null)

const SESSION_ID = `sess_${Math.random().toString(36).slice(2, 10)}`

function localMessage(role: 'user', text: string): ChatMessage {
  return {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role,
    text,
    createdAt: new Date().toISOString(),
  }
}

/** Derives the patient in view from the URL, e.g. /patients/DEMO-P-1042/... */
function patientIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/patients\/([^/]+)/)
  return match?.[1]
}

export function ChatProvider({
  children,
  patientId: explicitPatientId,
}: {
  children: React.ReactNode
  patientId?: string
}) {
  const pathname = usePathname()
  // Route context wins unless a patient is passed explicitly.
  const patientId = explicitPatientId ?? patientIdFromPath(pathname)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const post = useCallback(
    async (message: string, action?: ChatCtx['action']) => {
      setBusy(true)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId: SESSION_ID,
            context: { route: pathname, patientId, action },
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setMessages((m) => [
            ...m,
            {
              id: `err_${Date.now()}`,
              role: 'assistant',
              text: json?.error?.message ?? 'Something went wrong.',
              provenance: 'mock',
              createdAt: new Date().toISOString(),
            },
          ])
          return
        }
        setMessages((m) => [...m, json.message as ChatMessage])
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            text: 'I could not reach the assistant service.',
            provenance: 'mock',
            createdAt: new Date().toISOString(),
          },
        ])
      } finally {
        setBusy(false)
      }
    },
    [pathname, patientId]
  )

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      setMessages((m) => [...m, localMessage('user', trimmed)])
      await post(trimmed)
    },
    [busy, post]
  )

  const act = useCallback(
    async (action: NonNullable<ChatCtx['action']>, label?: string) => {
      if (busy) return
      if (label) setMessages((m) => [...m, localMessage('user', label)])
      await post(label ?? '', action)
    },
    [busy, post]
  )

  const clear = useCallback(() => setMessages([]), [])

  const value = useMemo(
    () => ({ messages, open, busy, patientId, setOpen, send, act, clear }),
    [messages, open, busy, patientId, send, act, clear]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useChat(): ChatState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>')
  return ctx
}
