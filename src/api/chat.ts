import apiClient from './client'
import type { ChatRequest, ChatResponse } from '@/types/chat'

export const chatApi = {
  send: (payload: ChatRequest) =>
    apiClient.post<ChatResponse>('/web/chat', payload).then((r) => r.data),
}
