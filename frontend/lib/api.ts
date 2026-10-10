import type { Inbox, MailConfig, Mailbox, MessageDetail } from './types'

/**
 * Relative by default: requests go through the Next.js /api proxy (or the reverse proxy in front
 * of it). Set NEXT_PUBLIC_API_URL only if browsers should call the API on another origin.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Machine-readable code from the API, e.g. RESERVED_USERNAME. */
    readonly code?: string,
    /** Include in bug reports; matches the server logs. */
    readonly requestId?: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(0, 'Network error. Check your connection and try again.')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string; code?: string; requestId?: string } | null
    throw new ApiError(
      res.status,
      body?.error || `Request failed (${res.status})`,
      body?.code,
      body?.requestId ?? res.headers.get('x-request-id') ?? undefined,
    )
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

const mailboxPath = (username: string) => `/api/mailboxes/${encodeURIComponent(username)}`

export const api = {
  config: () => request<MailConfig>('/api/config'),

  /** Creates (or re-opens) a mailbox. Omit the username for a random one. */
  createMailbox: (username?: string) =>
    request<Mailbox>('/api/mailboxes', { method: 'POST', body: JSON.stringify(username ? { username } : {}) }),

  inbox: (username: string) => request<Inbox>(mailboxPath(username)),

  deleteMailbox: (username: string) => request<void>(mailboxPath(username), { method: 'DELETE' }),

  message: (username: string, id: string) =>
    request<MessageDetail>(`${mailboxPath(username)}/messages/${encodeURIComponent(id)}`),

  deleteMessage: (username: string, id: string) =>
    request<void>(`${mailboxPath(username)}/messages/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

/** URL of the mailbox's Server-Sent Events stream (new-mail notifications). */
export function mailboxEventsUrl(username: string) {
  return `${API_BASE}${mailboxPath(username)}/events`
}

/** Resolves API-relative URLs returned by the backend (attachments, raw downloads). */
export function apiUrl(path: string) {
  return `${API_BASE}${path}`
}
