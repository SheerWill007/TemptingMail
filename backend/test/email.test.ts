import { describe, expect, it } from 'vitest';
import {
  isOurDomain,
  isValidLocalPart,
  normalizeLocalPart,
  parseAddress,
  randomLocalPart,
  toAddress,
} from '../src/lib/email.js';
import { makePreview } from '../src/services/mailStore.js';

describe('local part validation', () => {
  it.each(['a', 'john', 'john.doe', 'john_doe-99', 'a1', '9'])('accepts %s', (value) => {
    expect(isValidLocalPart(value)).toBe(true);
  });

  it.each(['', '.john', 'john.', '-john', 'jo..hn', 'John', 'jo hn', 'jo+hn', 'a'.repeat(65), 'ünï'])(
    'rejects %j',
    (value) => {
      expect(isValidLocalPart(value)).toBe(false);
    },
  );

  it('normalizes case and whitespace', () => {
    expect(normalizeLocalPart('  JoHn ')).toBe('john');
  });

  it('generates valid random names', () => {
    for (let i = 0; i < 50; i++) expect(isValidLocalPart(randomLocalPart())).toBe(true);
  });
});

describe('addresses', () => {
  it('builds addresses on the configured domain', () => {
    expect(toAddress('john')).toBe('john@mail.test');
  });

  it('parses and normalizes addresses', () => {
    expect(parseAddress('<John@Mail.Test.>')).toEqual({ localPart: 'john', domain: 'mail.test' });
    expect(parseAddress('no-at-sign')).toBeNull();
    expect(parseAddress('@mail.test')).toBeNull();
    expect(parseAddress('john@')).toBeNull();
  });

  it('only accepts our domain', () => {
    expect(isOurDomain('mail.test')).toBe(true);
    expect(isOurDomain('MAIL.TEST.')).toBe(true);
    expect(isOurDomain('evil.test')).toBe(false);
    expect(isOurDomain('sub.mail.test')).toBe(false);
  });
});

describe('makePreview', () => {
  it('prefers plain text and collapses whitespace', () => {
    expect(makePreview({ text: 'Hello\n\n  world', html: '<p>ignored</p>' })).toBe('Hello world');
  });

  it('falls back to stripped html without styles', () => {
    expect(makePreview({ text: undefined, html: '<style>p{color:red}</style><p>Hi <b>there</b></p>' })).toBe(
      'Hi there',
    );
  });

  it('truncates long content', () => {
    const preview = makePreview({ text: 'x'.repeat(500), html: false });
    expect(preview).toHaveLength(201);
    expect(preview.endsWith('…')).toBe(true);
  });
});
