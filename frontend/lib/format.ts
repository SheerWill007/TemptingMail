/** "Alice Smith <alice@example.com>" -> { name: "Alice Smith", email: "alice@example.com" } */
export function parseSender(from: string) {
  const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1]!.trim() || match[2]!, email: match[2]! }
  return { name: from, email: from }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return 'just now'
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour')
  return relative.format(Math.round(seconds / 86400), 'day')
}

/** "23h 14m" style countdown, or null once expired. */
export function timeLeft(iso: string, now = Date.now()) {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return null
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${Math.max(1, minutes)}m`
}
