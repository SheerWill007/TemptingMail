import { randomInt } from 'node:crypto';
import { config } from '../config.js';

/**
 * Local parts we accept: 1-64 chars of [a-z0-9._-], starting and ending with a letter or digit,
 * with no consecutive dots.
 */
const LOCAL_PART_RE = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/;

export function normalizeLocalPart(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidLocalPart(localPart: string): boolean {
  return LOCAL_PART_RE.test(localPart) && !localPart.includes('..');
}

export function toAddress(localPart: string, domain = config.mailDomain): string {
  return `${localPart}@${domain}`;
}

/** Splits an address into normalized parts. Returns null for anything that isn't `local@domain`. */
export function parseAddress(address: string): { localPart: string; domain: string } | null {
  const cleaned = address.replace(/[<>]/g, '').trim().toLowerCase();
  const at = cleaned.lastIndexOf('@');
  if (at <= 0 || at === cleaned.length - 1) return null;
  return {
    localPart: cleaned.slice(0, at),
    domain: cleaned.slice(at + 1).replace(/\.$/, ''),
  };
}

export function isOurDomain(domain: string): boolean {
  return domain.toLowerCase().replace(/\.$/, '') === config.mailDomain;
}

const ADJECTIVES = [
  'amber', 'bold', 'brisk', 'calm', 'clever', 'cosmic', 'crisp', 'dusty', 'eager', 'fuzzy',
  'gentle', 'glossy', 'happy', 'hidden', 'jolly', 'lucky', 'mellow', 'misty', 'nimble', 'quiet',
  'rapid', 'rusty', 'shy', 'silent', 'snowy', 'sunny', 'swift', 'tidy', 'velvet', 'witty',
];
const NOUNS = [
  'badger', 'comet', 'falcon', 'fern', 'fox', 'galaxy', 'harbor', 'koala', 'lantern', 'maple',
  'meadow', 'otter', 'panda', 'pebble', 'pixel', 'puffin', 'raven', 'river', 'rocket', 'sparrow',
  'spruce', 'tiger', 'tulip', 'walrus', 'willow', 'yeti', 'zebra', 'cactus', 'orbit', 'quokka',
];

/** A readable random local part such as `swift-otter-4821`. */
export function randomLocalPart(): string {
  const adjective = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const noun = NOUNS[randomInt(NOUNS.length)];
  return `${adjective}-${noun}-${randomInt(1000, 10000)}`;
}
