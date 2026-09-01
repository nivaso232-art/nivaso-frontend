export interface ChatRequest {
  message: string
  user_id?: string
  business_slug?: string
  display_name?: string
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
}
