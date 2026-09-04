import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Copy, Check, Bot, MessageSquare, Globe, Trash2, Cpu } from 'lucide-react'
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusinesses'
import { channelsApi } from '@/api/channels'
import { modelsApi } from '@/api/models'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useEntitlementStore } from '@/store/entitlementStore'
import { BUSINESS_STATUS_COLORS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { BusinessStatus } from '@/types/business'
import type { ModelInfo } from '@/types/models'
import { Flag } from '@/types/entitlements'

const STATUS_OPTIONS: { value: BusinessStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
]

type Tab = 'overview' | 'settings' | 'channels'

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

// ── Channel card ──────────────────────────────────────────────────────────────

function ChannelStatus({ configured }: { configured: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      configured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', configured ? 'bg-green-500' : 'bg-gray-400')} />
      {configured ? 'Connected' : 'Not configured'}
    </span>
  )
}

// ── Channels tab ──────────────────────────────────────────────────────────────

function ChannelsTab({ slug }: { slug: string }) {
  const qc = useQueryClient()
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels', slug],
    queryFn: () => channelsApi.list(slug),
  })

  const tgChannel = channels.find((c) => c.channel_type === 'telegram')
  const waChannel = channels.find((c) => c.channel_type === 'whatsapp')
  const rzpChannel = channels.find((c) => c.channel_type === 'razorpay')

  // Telegram form
  const [tgToken, setTgToken] = useState('')
  const [tgSecret, setTgSecret] = useState('')
  const [tgSaved, setTgSaved] = useState(false)

  // WhatsApp form
  const [waPhoneId, setWaPhoneId] = useState('')
  const [waToken, setWaToken] = useState('')
  const [waAppSecret, setWaAppSecret] = useState('')
  const [waVerifyToken, setWaVerifyToken] = useState('')
  const [waSaved, setWaSaved] = useState(false)

  // Razorpay form
  const [rzpKeyId, setRzpKeyId] = useState('')
  const [rzpKeySecret, setRzpKeySecret] = useState('')
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState('')
  const [rzpSaved, setRzpSaved] = useState(false)

  const { mutate: saveTelegram, isPending: savingTg } = useMutation({
    mutationFn: (payload: { bot_token: string; webhook_secret: string }) =>
      channelsApi.configureTelegram(slug, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels', slug] })
      setTgSaved(true); setTimeout(() => setTgSaved(false), 2000)
    },
  })

  const { mutate: saveWhatsApp, isPending: savingWa } = useMutation({
    mutationFn: (payload: { phone_number_id: string; access_token: string; app_secret: string; verify_token: string }) =>
      channelsApi.configureWhatsApp(slug, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels', slug] })
      setWaSaved(true); setTimeout(() => setWaSaved(false), 2000)
    },
  })

  const { mutate: saveRazorpay, isPending: savingRzp } = useMutation({
    mutationFn: (payload: { key_id: string; key_secret: string; webhook_secret: string }) =>
      channelsApi.configureRazorpay(slug, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels', slug] })
      setRzpSaved(true); setTimeout(() => setRzpSaved(false), 2000)
    },
  })

  const { mutate: removeChannel } = useMutation({
    mutationFn: (type: string) => channelsApi.remove(slug, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels', slug] }),
  })

  const backendHost = window.location.origin.replace('5173', '8000').replace('3000', '8000')

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading channels…</div>

  return (
    <div className="space-y-4">

      {/* ── Telegram ── */}
      <FeatureGate flag={Flag.CHANNEL_TELEGRAM} label="Telegram Channel">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Telegram Bot</h3>
          </div>
          <div className="flex items-center gap-2">
            <ChannelStatus configured={tgChannel?.configured ?? false} />
            {tgChannel && (
              <button
                onClick={() => removeChannel('telegram')}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Remove Telegram config"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {tgChannel && (
          <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            <span className="font-medium">Webhook URL to register:</span>
            <span className="ml-1 font-mono break-all">{backendHost}/webhooks/telegram/{slug}</span>
            <CopyButton text={`${backendHost}/webhooks/telegram/${slug}`} />
          </div>
        )}

        <div className="space-y-3">
          <Input
            label="Bot Token"
            type="password"
            value={tgToken}
            onChange={(e) => setTgToken(e.target.value)}
            placeholder={tgChannel ? '••••••• (leave blank to keep current)' : '123456789:AAHdq…'}
          />
          <Input
            label="Webhook Secret"
            type="password"
            value={tgSecret}
            onChange={(e) => setTgSecret(e.target.value)}
            placeholder="Optional secret used in setWebhook"
          />
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => saveTelegram({ bot_token: tgToken, webhook_secret: tgSecret })}
              loading={savingTg}
              disabled={!tgToken}
            >
              <Save className="h-4 w-4" />
              {tgChannel ? 'Update' : 'Connect'} Telegram
            </Button>
            {tgSaved && <span className="text-xs font-medium text-green-600">Saved!</span>}
          </div>
          {!tgChannel && (
            <p className="text-xs text-gray-400">
              After saving, register the webhook on your phone:
              <br />
              <code className="text-gray-600 break-all">
                https://api.telegram.org/bot{'<TOKEN>'}/setWebhook?url={backendHost}/webhooks/telegram/{slug}&secret_token={'<SECRET>'}
              </code>
            </p>
          )}
        </div>
      </div>
      </FeatureGate>

      {/* ── WhatsApp ── */}
      <FeatureGate flag={Flag.CHANNEL_WHATSAPP} label="WhatsApp Channel">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-800">WhatsApp Business</h3>
          </div>
          <div className="flex items-center gap-2">
            <ChannelStatus configured={waChannel?.configured ?? false} />
            {waChannel && (
              <button
                onClick={() => removeChannel('whatsapp')}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Remove WhatsApp config"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
          <span className="font-medium">Webhook URL (register in Meta dashboard):</span>
          <span className="ml-1 font-mono">{backendHost}/webhooks/whatsapp</span>
          <CopyButton text={`${backendHost}/webhooks/whatsapp`} />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number ID"
              value={waPhoneId}
              onChange={(e) => setWaPhoneId(e.target.value)}
              placeholder={waChannel ? '(current)' : '104xxxx'}
            />
            <Input
              label="Access Token"
              type="password"
              value={waToken}
              onChange={(e) => setWaToken(e.target.value)}
              placeholder={waChannel ? '•••••' : 'EAAx…'}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="App Secret"
              type="password"
              value={waAppSecret}
              onChange={(e) => setWaAppSecret(e.target.value)}
              placeholder="Optional HMAC signing secret"
            />
            <Input
              label="Verify Token"
              value={waVerifyToken}
              onChange={(e) => setWaVerifyToken(e.target.value)}
              placeholder="Meta verification token"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => saveWhatsApp({
                phone_number_id: waPhoneId,
                access_token: waToken,
                app_secret: waAppSecret,
                verify_token: waVerifyToken,
              })}
              loading={savingWa}
              disabled={!waPhoneId || !waToken}
            >
              <Save className="h-4 w-4" />
              {waChannel ? 'Update' : 'Connect'} WhatsApp
            </Button>
            {waSaved && <span className="text-xs font-medium text-green-600">Saved!</span>}
          </div>
        </div>
      </div>
      </FeatureGate>

      {/* ── Razorpay ── */}
      <FeatureGate flag={Flag.CHANNEL_PAYMENTS} label="Razorpay Payments">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">₹</span>
            <h3 className="text-sm font-semibold text-gray-800">Razorpay Payments</h3>
          </div>
          <div className="flex items-center gap-2">
            <ChannelStatus configured={rzpChannel?.configured ?? false} />
            {rzpChannel && (
              <button
                onClick={() => removeChannel('razorpay')}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Remove Razorpay config"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {rzpChannel && (
          <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            <span className="font-medium">Webhook URL for Razorpay dashboard:</span>
            <span className="ml-1 font-mono break-all">{backendHost}/webhooks/razorpay/{slug}</span>
            <CopyButton text={`${backendHost}/webhooks/razorpay/${slug}`} />
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Key ID"
              value={rzpKeyId}
              onChange={(e) => setRzpKeyId(e.target.value)}
              placeholder={rzpChannel ? '(current)' : 'rzp_test_…'}
            />
            <Input
              label="Key Secret"
              type="password"
              value={rzpKeySecret}
              onChange={(e) => setRzpKeySecret(e.target.value)}
              placeholder={rzpChannel ? '•••••' : 'your-secret'}
            />
          </div>
          <Input
            label="Webhook Secret"
            type="password"
            value={rzpWebhookSecret}
            onChange={(e) => setRzpWebhookSecret(e.target.value)}
            placeholder="Secret set in Razorpay dashboard webhook config"
          />
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => saveRazorpay({ key_id: rzpKeyId, key_secret: rzpKeySecret, webhook_secret: rzpWebhookSecret })}
              loading={savingRzp}
              disabled={!rzpKeyId || !rzpKeySecret}
            >
              <Save className="h-4 w-4" />
              {rzpChannel ? 'Update' : 'Connect'} Razorpay
            </Button>
            {rzpSaved && <span className="text-xs font-medium text-green-600">Saved!</span>}
          </div>
        </div>
      </div>
      </FeatureGate>

      {/* ── Web chat ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Web Chat</h3>
          </div>
          <ChannelStatus configured={true} />
        </div>

        {/* Business slug — the unique identity for this business's web channel */}
        <div className="mb-3 space-y-1">
          <p className="text-xs font-medium text-gray-500">Business Slug</p>
          <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
            <code className="flex-1 text-sm font-bold text-indigo-700">{slug}</code>
            <CopyButton text={slug} />
          </div>
          <p className="text-xs text-gray-400">This slug uniquely identifies this business across all channels.</p>
        </div>

        {/* Customer chat URL — share with customers */}
        <div className="mb-3 space-y-1">
          <p className="text-xs font-medium text-gray-500">Customer Chat URL</p>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <code className="flex-1 break-all text-xs text-gray-700">
              {window.location.origin}/chat/{slug}
            </code>
            <CopyButton text={`${window.location.origin}/chat/${slug}`} />
          </div>
          <p className="text-xs text-gray-400">
            Open this URL to chat as a customer. Share it or embed it on your website.
          </p>
        </div>

        {/* API endpoint for custom integrations */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">API Endpoint (custom embed)</p>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <code className="flex-1 text-xs text-gray-700">POST {backendHost}/web/chat</code>
            <CopyButton text={`${backendHost}/web/chat`} />
          </div>
          <p className="text-xs text-gray-400">
            Pass <code className="rounded bg-gray-100 px-1 text-gray-600">"business_slug": "{slug}"</code> in the JSON body.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Model picker ──────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  powerful: 'Powerful',
  balanced: 'Balanced',
  fast: 'Fast',
}

const TIER_COLORS: Record<string, string> = {
  powerful: 'text-purple-600',
  balanced: 'text-blue-600',
  fast: 'text-green-600',
}

interface ModelPickerProps {
  label: string
  description: string
  provider: string
  model: string
  availableModels: ModelInfo[]
  onProviderChange: (p: string) => void
  onModelChange: (m: string) => void
  disabled?: boolean
}

function ModelPicker({
  label,
  description,
  provider,
  model,
  availableModels,
  onProviderChange,
  onModelChange,
  disabled = false,
}: ModelPickerProps) {
  const providers = [...new Set(availableModels.map((m) => m.provider))]
  const filtered = availableModels.filter((m) => m.provider === provider)
  const selected = availableModels.find((m) => m.provider === provider && m.model === model)

  return (
    <div className={cn('space-y-2', disabled && 'opacity-40 pointer-events-none')}>
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Server default</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p === 'anthropic' ? 'Anthropic (Claude)' : 'Google (Gemini)'}
            </option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={!provider}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select model…</option>
          {filtered.map((m) => (
            <option key={m.model} value={m.model}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      {selected && (
        <p className="text-xs">
          <span className={cn('font-medium', TIER_COLORS[selected.tier])}>
            {TIER_LABELS[selected.tier]}
          </span>
          <span className="ml-1 text-gray-400">· {selected.model}</span>
        </p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: business, isLoading } = useBusiness(slug ?? '')
  const { mutate: update, isPending: saving } = useUpdateBusiness(slug ?? '')

  const [tab, setTab] = useState<Tab>('overview')
  const [saved, setSaved] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState<BusinessStatus | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [timezone, setTimezone] = useState('')
  const [agentTone, setAgentTone] = useState('')
  const [startHour, setStartHour] = useState('')
  const [endHour, setEndHour] = useState('')
  const [razorpayEnabled, setRazorpayEnabled] = useState(false)
  const [agentProvider, setAgentProvider] = useState('')
  const [agentModel, setAgentModel] = useState('')
  const [fallbackProvider, setFallbackProvider] = useState('')
  const [fallbackModel, setFallbackModel] = useState('')

  const { data: availableModels = [] } = useQuery<ModelInfo[]>({
    queryKey: ['admin-models'],
    queryFn: modelsApi.list,
    staleTime: Infinity,
  })

  const entitlements = useEntitlementStore((s) => s.entitlements)
  const allowedModelIds = (entitlements?.flags[Flag.AI_MODELS] as string[] | null) ?? null
  const permittedModels = allowedModelIds
    ? availableModels.filter((m) => allowedModelIds.includes(m.model))
    : availableModels

  useEffect(() => {
    if (!business) return
    setName(business.name)
    setDescription(business.description ?? '')
    setTimezone(business.timezone)
    const s = business.settings as Record<string, unknown>
    setAgentTone((s.agent_tone as string) ?? '')
    const bh = s.business_hours as Record<string, string> | undefined
    setStartHour(bh?.start ?? '')
    setEndHour(bh?.end ?? '')
    setRazorpayEnabled((s.razorpay_enabled as boolean) ?? false)
    const ac = (s.agent as Record<string, string>) ?? {}
    setAgentProvider(ac.provider ?? '')
    setAgentModel(ac.model ?? '')
    setFallbackProvider(ac.fallback_provider ?? '')
    setFallbackModel(ac.fallback_model ?? '')
  }, [business])

  if (isLoading) return <Spinner />
  if (!business) return <p className="text-gray-500">Business not found.</p>

  const doSave = (payload: object) => {
    update(payload as any, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) },
    })
  }

  const handleSaveOverview = () => {
    doSave({
      name: name.trim() || business.name,
      description: description.trim() || undefined,
      timezone: timezone.trim() || business.timezone,
    })
  }

  const handleSaveSettings = () => {
    const existing = business.settings as Record<string, unknown>
    const agentCfg =
      agentProvider && agentModel
        ? {
            provider: agentProvider,
            model: agentModel,
            ...(fallbackProvider && fallbackModel
              ? { fallback_provider: fallbackProvider, fallback_model: fallbackModel }
              : {}),
          }
        : undefined
    doSave({
      settings: {
        ...existing,
        agent_tone: agentTone.trim() || undefined,
        razorpay_enabled: razorpayEnabled,
        business_hours:
          startHour || endHour
            ? { ...((existing.business_hours as object) ?? {}), start: startHour, end: endHour }
            : existing.business_hours,
        agent: agentCfg,
      },
    })
  }

  const handleStatusChange = (newStatus: BusinessStatus) => {
    if (newStatus === 'active') {
      update({ status: newStatus })
    } else {
      setConfirmStatus(newStatus)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'settings', 'channels'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm text-gray-500">{business.slug}</p>
              <h2 className="text-xl font-semibold text-gray-900">{business.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge colorClass={BUSINESS_STATUS_COLORS[business.status]}>{business.status}</Badge>
              <Select
                value=""
                onChange={(e) => handleStatusChange(e.target.value as BusinessStatus)}
                options={STATUS_OPTIONS.filter((o) => o.value !== business.status)}
                placeholder="Change status…"
                className="text-xs"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveOverview} loading={saving}><Save className="h-4 w-4" /> Save</Button>
            {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Agent Settings</h3>
          <Input label="Agent Tone" value={agentTone} onChange={(e) => setAgentTone(e.target.value)} placeholder="friendly_casual" />
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Business Hours</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Open" value={startHour} onChange={(e) => setStartHour(e.target.value)} placeholder="09:00" />
              <Input label="Close" value={endHour} onChange={(e) => setEndHour(e.target.value)} placeholder="22:00" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Razorpay Payments</p>
              <p className="text-xs text-gray-500">Enable Razorpay payment links for orders</p>
            </div>
            <button
              onClick={() => setRazorpayEnabled((v) => !v)}
              className={cn('relative h-6 w-11 rounded-full transition-colors', razorpayEnabled ? 'bg-blue-600' : 'bg-gray-300')}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', razorpayEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>
          {/* ── AI Model Selection — shown whenever the plan allows 2+ models ── */}
          {permittedModels.length > 1 && (
          <div className="rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold text-gray-700">AI Model</p>
            </div>

            <ModelPicker
              label="Primary model"
              description="Model used for every customer conversation."
              provider={agentProvider}
              model={agentModel}
              availableModels={permittedModels}
              onProviderChange={(p) => { setAgentProvider(p); setAgentModel('') }}
              onModelChange={setAgentModel}
            />

            <ModelPicker
              label="Fallback model"
              description="Used automatically when the primary model is rate-limited or overloaded."
              provider={fallbackProvider}
              model={fallbackModel}
              availableModels={permittedModels}
              onProviderChange={(p) => { setFallbackProvider(p); setFallbackModel('') }}
              onModelChange={setFallbackModel}
              disabled={!agentProvider || !agentModel}
            />
          </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">All Settings (raw)</p>
            <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 overflow-auto max-h-40">
              {JSON.stringify(business.settings, null, 2)}
            </pre>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveSettings} loading={saving}><Save className="h-4 w-4" /> Save Settings</Button>
            {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
          </div>
        </div>
      )}

      {tab === 'channels' && <ChannelsTab slug={business.slug} />}

      <Modal open={!!confirmStatus} onClose={() => setConfirmStatus(null)} title={`Set business to ${confirmStatus}?`}>
        <p className="mb-4 text-sm text-gray-600">
          This will change <strong>{business.name}</strong> to <strong>{confirmStatus}</strong>.
          {confirmStatus === 'suspended' && ' The AI agent will stop accepting orders.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmStatus(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => { if (confirmStatus) update({ status: confirmStatus }, { onSuccess: () => setConfirmStatus(null) }) }}
            loading={saving}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  )
}
