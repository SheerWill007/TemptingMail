export interface MailConfig {
  domain: string
  ttlHours: number
  maxMessageBytes: number
}

export interface Mailbox {
  username: string
  address: string
  createdAt: string
  expiresAt: string
}

export interface MessageSummary {
  id: string
  from: string
  subject: string | null
  preview: string
  size: number
  hasAttachments: boolean
  isRead: boolean
  createdAt: string
}

export interface Inbox {
  address: string
  exists: boolean
  createdAt: string | null
  expiresAt: string | null
  messages: MessageSummary[]
}

export interface Attachment {
  index: number
  filename: string
  contentType: string
  size: number
  inline: boolean
  url: string
}

export interface MessageDetail {
  id: string
  to: string
  from: string
  subject: string | null
  createdAt: string
  date: string
  size: number
  html: string | null
  text: string | null
  attachments: Attachment[]
  rawUrl: string
}
