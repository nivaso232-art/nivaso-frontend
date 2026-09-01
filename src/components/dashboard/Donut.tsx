import { useState } from 'react'
import type { ChannelSlice } from '@/types/analytics'
import { formatNumber, formatPercent } from '@/utils/formatters'

// Validated all-pairs trio on the dark surface (blue / orange / aqua).
const CHANNEL_META: Record<
  ChannelSlice['channel'],
  { label: string; color: string }
> = {
  whatsapp: { label: 'WhatsApp', color: '#199e70' },
  telegram: { label: 'Telegram', color: '#3987e5' },
  web: { label: 'Web', color: '#d95926' },
}

export function Donut({ channels }: { channels: ChannelSlice[] }) {
  const [active, setActive] = useState<number | null>(null)
  const total = channels.reduce((s, c) => s + c.conversations, 0) || 1
  const gap = 1.6 // dash units of surface showing between arcs

  let cumulative = 0
  const segments = channels.map((c, i) => {
    const pct = (c.conversations / total) * 100
    const seg = { c, i, pct, offset: -cumulative }
    cumulative += pct
    return seg
  })

  const focus = active != null ? channels[active] : null

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0">
        <svg viewBox="0 0 120 120" width={128} height={128} role="img" aria-label="Chats by channel">
          <g transform="rotate(-90 60 60)">
            {segments.map(({ c, i, pct, offset }) => {
              const meta = CHANNEL_META[c.channel]
              const on = active === i
              return (
                <circle
                  key={c.channel}
                  cx={60}
                  cy={60}
                  r={44}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth={on ? 18 : 15}
                  pathLength={100}
                  strokeDasharray={`${Math.max(0, pct - gap)} ${100 - Math.max(0, pct - gap)}`}
                  strokeDashoffset={offset}
                  opacity={active == null || on ? 1 : 0.4}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className="cursor-pointer transition-all"
                />
              )
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-2xl font-semibold text-dash-ink">
            {formatNumber(focus ? focus.conversations : total)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-dash-ink3">
            {focus ? CHANNEL_META[focus.channel].label : 'chats'}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {channels.map((c, i) => {
          const meta = CHANNEL_META[c.channel]
          const pct = c.conversations / total
          return (
            <li
              key={c.channel}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
              <span className="text-sm text-dash-ink2">{meta.label}</span>
              <span className="ml-auto text-sm font-medium text-dash-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatPercent(pct)}
              </span>
              <span className="w-12 text-right text-xs text-dash-ink3" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatNumber(c.conversations)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
