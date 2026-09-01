export interface ChatRequest {
  message: string
  user_id?: string
  business_slug?: string
  display_name?: string
  provider?: 'anthropic' | 'gemini'
  model?: string
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

export const MODEL_OPTIONS: ModelOption[] = [
  { provider: 'anthropic', model: 'claude-opus-4-5',    label: 'Claude Opus 4.5' },
  { provider: 'anthropic', model: 'claude-sonnet-4-6',  label: 'Claude Sonnet 4.6' },
  { provider: 'anthropic', model: 'claude-haiku-4-5',   label: 'Claude Haiku 4.5' },
  { provider: 'gemini',    model: 'gemini-2.5-flash',   label: 'Gemini 2.5 Flash' },
  { provider: 'gemini',    model: 'gemini-2.5-pro',     label: 'Gemini 2.5 Pro' },
]
