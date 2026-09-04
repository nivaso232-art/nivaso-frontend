export interface ChatRequest {
  message: string
  user_id?: string
  business_slug?: string
  display_name?: string
  provider?: 'anthropic' | 'gemini'
  model?: string
  admin_mode?: boolean
}

export interface ToolUsed {
  tool: string
  arguments: Record<string, unknown>
}

export interface ChatResponse {
  reply: string
  business_slug: string
  conversation_id: string
  customer_id: string
  conversation_state: string
  tools_used: ToolUsed[]
  model_used: string
}

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ModelOption {
  provider: 'anthropic' | 'gemini'
  model: string
  label: string
}

export interface SessionOut {
  user_id: string
  customer_name: string | null
  conversation_id: string | null
  last_message_at: string | null
}

// Mirrors AVAILABLE_MODELS in app/agent/models_registry.py — keep in sync.
// Used by the super-admin chat (unrestricted model picker); the client-admin
// chat (ChatTest) fetches from /admin/models and filters by plan entitlement.
export const MODEL_OPTIONS: ModelOption[] = [
  { provider: 'anthropic', model: 'claude-opus-4-7',          label: 'Claude Opus 4' },
  { provider: 'anthropic', model: 'claude-sonnet-4-6',        label: 'Claude Sonnet 4' },
  { provider: 'anthropic', model: 'claude-haiku-4-5-20251001',label: 'Claude Haiku 4' },
  { provider: 'gemini',    model: 'gemini-3.1-pro-preview',   label: 'Gemini 3.1 Pro' },
  { provider: 'gemini',    model: 'gemini-3.6-flash',         label: 'Gemini 3.6 Flash' },
  { provider: 'gemini',    model: 'gemini-3.5-flash-lite',    label: 'Gemini 3.5 Flash Lite' },
]
