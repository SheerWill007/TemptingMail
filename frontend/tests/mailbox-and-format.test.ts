import { describe, expect, it } from 'vitest'
import { formatBytes, parseSender, timeAgo, timeLeft } from '@/lib/format'
import { cleanUsernameInput, isValidUsername, safeDecode } from '@/lib/mailbox'

describe('username helpers', () => {
  it.each(['a', 'john.doe', 'john_doe-99'])('accepts %s', (v) => expect(isValidUsername(v)).toBe(true))
  it.each(['', '.a', 'a.', 'a..b', 'A', 'a b', 'x'.repeat(65)])('rejects %j', (v) =>
    expect(isValidUsername(v)).toBe(false),
  )

  it('cleans typed input', () => {
    expect(cleanUsernameInput('John.Doe@gmail.com')).toBe('john.doe')
    expect(cleanUsernameInput('hé llo!')).toBe('hllo')
    expect(cleanUsernameInput('x'.repeat(80))).toHaveLength(64)
  })

  it('decodes route params without throwing', () => {
    expect(safeDecode('john%2Edoe')).toBe('john.doe')
    expect(safeDecode('%E0%A4%A')).toBe('%E0%A4%A')
  })
})

describe('format helpers', () => {
  it('parses senders', () => {
    expect(parseSender('"Alice Smith" <alice@example.com>')).toEqual({
      name: 'Alice Smith',
      email: 'alice@example.com',
    })
    expect(parseSender('<bob@example.com>')).toEqual({ name: 'bob@example.com', email: 'bob@example.com' })
    expect(parseSender('carol@example.com')).toEqual({ name: 'carol@example.com', email: 'carol@example.com' })
  })

  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })

  it('formats relative and remaining time', () => {
    const now = Date.parse('2026-01-01T12:00:00Z')
    expect(timeAgo('2026-01-01T11:59:50Z', now)).toBe('just now')
    expect(timeLeft('2026-01-01T13:30:00Z', now)).toBe('1h 30m')
    expect(timeLeft('2026-01-03T13:00:00Z', now)).toBe('2d 1h')
    expect(timeLeft('2026-01-01T11:00:00Z', now)).toBeNull()
  })
})
