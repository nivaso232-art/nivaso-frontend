import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { chatApi } from '@/api/chat'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { ChatResponse } from '@/types/chat'

interface Message {
  role: 'user' | 'assistant'
  text: string
  meta?: ChatResponse
}

export function ChatTest() {
  const { selectedBusinessSlug } = useAppStore()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const { mutate: send, isPending } = useMutation({
    mutationFn: chatApi.send,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply, meta: data }])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || isPending) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    send({ message: text, business_slug: selectedBusinessSlug })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
        Talking to business: <strong>{selectedBusinessSlug || 'none selected'}</strong> — uses the same AI pipeline as WhatsApp/Telegram.
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">Send a message to start chatting with the AI agent.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn('mb-4 flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', m.role === 'user' ? 'bg-blue-600' : 'bg-gray-200')}>
              {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-gray-600" />}
            </div>
            <div className="max-w-[75%]">
              <div className={cn('rounded-2xl px-4 py-2.5 text-sm', m.role === 'user' ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm bg-gray-100 text-gray-800')}>
                {m.text}
              </div>
              {m.meta && m.meta.tools_used.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Tools: {m.meta.tools_used.map((t) => t.tool).join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Button onClick={handleSend} loading={isPending} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  )
}
