import type { Inbox, MailConfig, Mailbox, MessageDetail } from './types'

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

/**
 * JSON requests always go to the same-origin /api proxy (a Nuxt server route), so the browser
 * never needs CORS for them and inline email images resolve against this site.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
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

export const mailboxPath = (username: string) => `/api/mailboxes/${encodeURIComponent(username)}`

export const api = {
  config: () => request<MailConfig>('/api/config'),

  /** Creates (or re-opens) a mailbox. Omit the username for a random one. */
  createMailbox: (username?: string) =>
    request<Mailbox>('/api/mailboxes', { method: 'POST', body: JSON.stringify(username ? { username } : {}) }),

  inbox: (username: string) => request<Inbox>(mailboxPath(username)),

  deleteMailbox: (username: string) => request<undefined>(mailboxPath(username), { method: 'DELETE' }),

  message: (username: string, id: string) =>
    request<MessageDetail>(`${mailboxPath(username)}/messages/${encodeURIComponent(id)}`),

  deleteMessage: (username: string, id: string) =>
    request<undefined>(`${mailboxPath(username)}/messages/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
