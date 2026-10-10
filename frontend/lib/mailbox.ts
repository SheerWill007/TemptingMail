'use client'

import { useEffect, useState } from 'react'
import { api } from './api'
import type { MailConfig } from './types'

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

const FALLBACK_CONFIG: MailConfig = {
  domain: process.env.NEXT_PUBLIC_MAIL_DOMAIN || 'localhost',
  ttlHours: 24,
  maxMessageBytes: 10 * 1024 * 1024,
}

let configPromise: Promise<MailConfig> | null = null

/** Public service config (mail domain, TTL) from the API, fetched once per page load. */
export function useMailConfig() {
  const [config, setConfig] = useState<MailConfig | null>(null)

  useEffect(() => {
    configPromise ??= api.config().catch(() => {
      configPromise = null
      return FALLBACK_CONFIG
    })
    let active = true
    configPromise.then((c) => active && setConfig(c))
    return () => {
      active = false
    }
  }, [])

  return config
}

const RECENT_KEY = 'temp-mail:recent'

export function getRecentMailboxes(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && isValidUsername(v)).slice(0, 5) : []
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
