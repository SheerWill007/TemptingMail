/** Mirrors the backend rule: 1-64 of [a-z0-9._-], starting/ending alphanumeric, no "..". */
const USERNAME_RE = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/

export function isValidUsername(value: string) {
  return USERNAME_RE.test(value) && !value.includes('..')
}

/** Route params may or may not arrive percent-encoded; never throw on malformed input. */
export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Cleans what the user types: lowercase, drop anything after "@", strip disallowed characters. */
export function cleanUsernameInput(value: string) {
  return value
    .split('@')[0]!
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 64)
}

const RECENT_KEY = 'temp-mail:recent'

export function getRecentMailboxes(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === 'string' && isValidUsername(v)).slice(0, 5)
      : []
  } catch {
    return []
  }
}

export function rememberMailbox(username: string) {
  try {
    const next = [username, ...getRecentMailboxes().filter((u) => u !== username)].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable (private mode); not important
  }
}

export function forgetMailbox(username: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(getRecentMailboxes().filter((u) => u !== username)))
  } catch {
    // ignore
  }
}
