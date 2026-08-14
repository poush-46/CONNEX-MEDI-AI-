'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { ChatMessage } from '@/types/chat'
import { CloseIcon, SendIcon, SparkIcon } from '@/components/common/icons'
import { cn } from '@/lib/utils/cn'
import { ChatPayloadRenderer } from './payloads'
import { useChat } from './ChatProvider'

/**
 * The Connex assistant panel.
 *
 * Right-docked, closable, present on every portal screen — matching the
 * product mockup. Renders structured card payloads rather than plain text.
 */
export function ConnexPanel() {
  const { messages, open, busy, setOpen, send, act } = useChat()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return <Launcher onClick={() => setOpen(true)} />

  const handlers = {
    busy,
    onReschedule: (eventId: string) => act({ kind: 'reschedule', eventId }, 'Reschedule'),
    onSelectSlot: (eventId: string, slotId: string) =>
      act({ kind: 'select-slot', eventId, slotId }),
    onConfirm: (commit: Record<string, string>) => act({ kind: 'confirm', commit }, 'Confirm'),
    onCancel: () => act({ kind: 'cancel' }, 'Cancel'),
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-l border-hairline bg-panel shadow-panel',
        // Overlay on small screens, docked column from md up.
        'fixed inset-y-0 right-0 z-50 w-full max-w-[400px]',
        'md:static md:z-auto md:h-full md:w-[400px] md:shrink-0 md:max-w-none'
      )}
      aria-label="Connex assistant"
    >
      {/* Header */}
      <header className="flex items-center gap-2.5 bg-gradient-to-r from-plum-900 to-plum-800 px-3.5 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold text-white">
          C
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight text-white">Connex</p>
          <p className="flex items-center gap-1.5 text-[10.5px] leading-tight text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-online" aria-hidden="true" />
            Your AI Assistant
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Close assistant"
        >
          <CloseIcon />
        </button>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-3.5 py-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 && <EmptyState onPrompt={send} />}
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} handlers={handlers} onPrompt={send} />
        ))}
        {busy && <TypingIndicator />}
      </div>

      {/* Composer */}
      <form
        className="border-t border-hairline bg-white px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
          setDraft('')
        }}
      >
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a follow-up question..."
            aria-label="Ask a follow-up question"
            className="min-w-0 flex-1 rounded-full border border-hairline bg-white px-3.5 py-2 text-[12px] text-ink-900 placeholder:text-ink-400 focus:border-magenta-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta-600 text-white transition hover:bg-magenta-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-ink-400">
          Demo assistant · synthetic data · no live AI model connected
        </p>
      </form>
    </aside>
  )
}

function Launcher({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-plum-900 to-magenta-600 text-white shadow-launcher transition hover:scale-105"
      aria-label="Open Connex assistant"
    >
      <span className="text-[17px] font-bold">C</span>
    </button>
  )
}

function MessageRow({
  message,
  handlers,
  onPrompt,
}: {
  message: ChatMessage
  handlers: Parameters<typeof ChatPayloadRenderer>[0]['handlers']
  onPrompt: (text: string) => void
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-magenta-600 px-3 py-2 text-[12px] text-white">
          {message.text}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-2">
      {message.actionBar && message.actionBar.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          {message.actionBar.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full bg-magenta-600 px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-magenta-700"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">
          C
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          {message.text && (
            <div className="whitespace-pre-line rounded-card border border-hairline bg-white px-3 py-2 text-[12px] leading-relaxed text-ink-700 shadow-card">
              {message.text}
            </div>
          )}
          {message.payload && (
            <ChatPayloadRenderer payload={message.payload} handlers={handlers} />
          )}
          {message.followUps && message.followUps.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {message.followUps.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onPrompt(f)}
                  className="rounded-full border border-hairline bg-white px-2.5 py-1 text-[10.5px] font-medium text-ink-700 transition hover:border-magenta-600 hover:text-magenta-600"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">
        C
      </span>
      <div className="flex items-center gap-1 rounded-card border border-hairline bg-white px-3 py-2.5 shadow-card">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-ink-400"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
        <span className="sr-only">Connex is thinking</span>
      </div>
    </div>
  )
}

function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  const prompts = [
    'Show the latest blood count',
    'Show hemoglobin over time',
    'Any new side effects?',
    'Who has flagged results?',
  ]
  return (
    <div className="pt-2">
      <div className="flex gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">
          C
        </span>
        <div className="rounded-card border border-hairline bg-white px-3 py-2.5 text-[12px] leading-relaxed text-ink-700 shadow-card">
          <p className="flex items-center gap-1.5 font-semibold text-ink-900">
            <SparkIcon className="h-3.5 w-3.5 text-magenta-600" />
            Hello
          </p>
          <p className="mt-1">
            I can pull up monitoring results, show trends across cycles, review side effects, and
            reschedule appointments.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPrompt(p)}
            className="rounded-full border border-hairline bg-white px-2.5 py-1 text-[10.5px] font-medium text-ink-700 transition hover:border-magenta-600 hover:text-magenta-600"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
