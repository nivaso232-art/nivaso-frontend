/**
 * Customer-facing chat page — one URL per business.
 *
 * Route: /chat/:slug
 * Example: /chat/nivaso-gaming
 *
 * - No X-Internal-Key (public endpoint)
 * - User identity stored in localStorage per slug (conversation persists on refresh)
 * - Loads history from GET /web/history
 * - Sends via POST /web/chat
 * - Business name loaded from GET /web/config/:slug
 */

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Bot } from 'lucide-react'

// ── Stable customer identity ──────────────────────────────────────────────────

function getOrCreateUserId(slug: string): string {
  const key = `chat-uid-${slug}`
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const uid = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  localStorage.setItem(key, uid)
  return uid
}

// ── API (no auth header — web endpoints are public for customers) ─────────────

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function fetchConfig(slug: string) {
  const r = await fetch(`${BASE}/web/config/${slug}`)
  if (!r.ok) throw new Error('Business not found')
  return r.json() as Promise<{ slug: string; name: string; razorpay_enabled: boolean; agent_tone: string }>
}

async function fetchHistory(userId: string, slug: string) {
  const r = await fetch(`${BASE}/web/history?user_id=${userId}&business_slug=${slug}`)
  if (!r.ok) return []
  return r.json() as Promise<{ role: 'user' | 'assistant'; content: string }[]>
}

async function sendMessage(message: string, userId: string, slug: string) {
  const r = await fetch(`${BASE}/web/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, user_id: userId, business_slug: slug }),
  })
  if (!r.ok) throw new Error('Failed to send message')
  return r.json() as Promise<{ reply: string }>
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <span className="flex gap-1">
          {[0, 75, 150].map((d) => (
            <span
              key={d}
              style={{ animationDelay: `${d}ms` }}
              className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
            />
          ))}
        </span>
      </div>
    </div>
  )
}

// ── Main chat page ────────────────────────────────────────────────────────────

export function CustomerChat() {
  const { slug } = useParams<{ slug: string }>()
  const userId = getOrCreateUserId(slug ?? 'unknown')
  const qc = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [localMessages, setLocalMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  // Business config (name, settings)
  const { data: config, isError: configError } = useQuery({
    queryKey: ['biz-config', slug],
    queryFn: () => fetchConfig(slug!),
    enabled: !!slug,
    retry: 1,
  })

  // Conversation history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['cust-history', slug, userId],
    queryFn: () => fetchHistory(userId, slug!),
    enabled: !!slug,
    staleTime: 0,
  })

  // Sync history into local messages on load
  useEffect(() => {
    if (history.length > 0) setLocalMessages(history)
  }, [history])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const { mutate: send, isPending } = useMutation({
    mutationFn: (text: string) => sendMessage(text, userId, slug!),
    onSuccess: (data) => {
      setLocalMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      qc.invalidateQueries({ queryKey: ['cust-history', slug, userId] })
    },
    onError: () => {
      setLocalMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    },
  })

  const handleSend = () => {
    const text = input.trim()
    if (!text || isPending) return
    setLocalMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    send(text)
  }

  if (configError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-center">
        <div>
          <p className="text-lg font-semibold text-gray-700">Business not found</p>
          <p className="mt-1 text-sm text-gray-400">
            The link you followed may be incorrect. Check the business slug in the URL.
          </p>
        </div>
      </div>
    )
  }

  const displayMessages = localMessages.length > 0 ? localMessages : history

  return (
    <div className="flex h-screen flex-col bg-gray-50">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {config?.name ?? slug ?? 'Chat'}
          </p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {historyLoading && (
          <p className="py-4 text-center text-xs text-gray-400">Loading conversation…</p>
        )}

        {!historyLoading && displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Hi! How can I help you today?
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Ask about products, orders, or anything else.
            </p>
          </div>
        )}

        {displayMessages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-tr-sm bg-blue-600 text-white'
                  : 'rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isPending && <TypingDots />}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            disabled={isPending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Powered by <span className="font-medium text-gray-500">Nivaso</span>
        </p>
      </div>
    </div>
  )
}
