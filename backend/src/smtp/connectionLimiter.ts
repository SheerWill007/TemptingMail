/** Fixed-window counter of SMTP connections per remote IP. */
export class ConnectionLimiter {
  private readonly counts = new Map<string, { windowStart: number; count: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs = 60_000,
  ) {}

  /** Records a connection attempt and reports whether it is within the limit. */
  allow(ip: string, now = Date.now()): boolean {
    const entry = this.counts.get(ip);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.counts.set(ip, { windowStart: now, count: 1 });
      this.prune(now);
      return true;
    }
    entry.count += 1;
    return entry.count <= this.limit;
  }

  private prune(now: number) {
    if (this.counts.size < 10_000) return;
    for (const [ip, entry] of this.counts) {
      if (now - entry.windowStart >= this.windowMs) this.counts.delete(ip);
    }
  }
}
