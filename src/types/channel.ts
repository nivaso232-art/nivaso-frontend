export type ChannelType = 'telegram' | 'whatsapp'

export interface BusinessChannel {
  channel_type: ChannelType
  external_channel_id: string
  is_active: boolean
  configured: boolean
  webhook_url_path: string
}

export interface TelegramChannelPayload {
  bot_token: string
  webhook_secret?: string
}

export interface WhatsAppChannelPayload {
  phone_number_id: string
  access_token: string
  app_secret?: string
  verify_token?: string
}
