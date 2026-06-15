import { Injectable, Logger } from '@nestjs/common';

/**
 * In-memory Redis stub — drop-in replacement for Redis.
 * Implements the contract needed by the User Service per FRD §8 & §6.6.
 *
 * Swap for real Redis (ioredis) when Redis is available.
 * All pub/sub events are logged to console (DPDP: no PII in payloads).
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly store = new Map<string, { value: string; expiresAt: number | null }>();

  /** GET — returns null if key missing or expired */
  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  /** SET with optional TTL in seconds */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  /** DEL */
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  /** Delete all keys matching a prefix pattern */
  async delByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /** INCR — atomically increment a counter; creates if not exists */
  async incr(key: string): Promise<number> {
    const entry = this.store.get(key);
    let current = 0;
    let expiresAt: number | null = null;

    if (entry) {
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.store.delete(key);
      } else {
        current = parseInt(entry.value, 10) || 0;
        expiresAt = entry.expiresAt;
      }
    }

    current += 1;
    this.store.set(key, { value: current.toString(), expiresAt });
    return current;
  }

  /** EXPIRE — set TTL on existing key */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  /**
   * PUBLISH — fire-and-forget event per FRD §8.
   * In-memory stub: logs the event. Real Redis: publishes to channel.
   * All payloads use user_id (uuid) — never email or mobile (DPDP §7.3).
   */
  async publish(channel: string, payload: Record<string, unknown>): Promise<void> {
    this.logger.log(`[PUB] ${channel} → ${JSON.stringify(payload)}`);
  }
}
