import { ChevronDown } from 'lucide-react'
import type { FunnelStage } from '@/types/analytics'
import { formatNumber, formatPercent } from '@/utils/formatters'

// Ordinal blue ramp (light → dark), deepest step still ≥2:1 on the dark surface.
const RAMP = ['#86b6ef', '#5598e7', '#3987e5', '#256abf', '#184f95']

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  if (!stages.length) return null
  const top = stages[0].count || 1
  const overall = stages[stages.length - 1].count / top

  return (
    <div>
      <ul className="space-y-3.5">
        {stages.map((s, i) => {
          const widthPct = Math.max(3, (s.count / top) * 100)
          const stepConv = i === 0 ? 1 : s.count / (stages[i - 1].count || 1)
          const drop = 1 - stepConv
          const color = RAMP[i] ?? RAMP[RAMP.length - 1]
          return (
            <li key={s.key}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-dash-ink2">{s.label}</span>
                <span className="text-sm font-semibold text-dash-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumber(s.count)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-white/[0.04]">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{ width: `${widthPct}%`, background: color }}
                    title={`${s.label}: ${formatNumber(s.count)} (${formatPercent(s.count / top)} of chats)`}
                  />
                </div>
                {i > 0 && (
                  <span
                    className="flex w-16 shrink-0 items-center justify-end gap-0.5 text-xs"
                    style={{ color: drop > 0.4 ? '#ec835a' : '#aab2c5', fontVariantNumeric: 'tabular-nums' }}
                    title={`${formatPercent(drop)} drop from previous step`}
                  >
                    <ChevronDown className="h-3 w-3" />
                    {formatPercent(stepConv)}
                  </span>
                )}
                {i === 0 && <span className="w-16 shrink-0" />}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-dash-line pt-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-dash-ink3">Chat → delivery</span>
        <span className="text-sm font-semibold text-dash-violetlt" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatPercent(overall, 1)} convert
        </span>
      </div>
    </div>
  )
}
