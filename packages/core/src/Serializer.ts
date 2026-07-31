/**
 * Kairo Engine Serialization & Persistence System
 * Provides structured JSON serialization, state versioning, deep cloning, and base64 compression.
 */

export interface SaveStateEnvelope<T = any> {
  version: number;
  timestamp: number;
  checksum: number;
  payload: T;
}

export class Serializer {
  public static readonly VERSION = 1;

  public static serialize<T>(data: T, indent: boolean = false): string {
    return JSON.stringify(data, (key, value) => {
      // Custom serialization handlers for Set and Map
      if (value instanceof Set) {
        return { __type: 'Set', values: Array.from(value) };
      }
      if (value instanceof Map) {
        return { __type: 'Map', entries: Array.from(value.entries()) };
      }
      return value;
    }, indent ? 2 : undefined);
  }

  public static deserialize<T>(jsonStr: string): T {
    return JSON.parse(jsonStr, (key, value) => {
      if (value && typeof value === 'object') {
        if (value.__type === 'Set' && Array.isArray(value.values)) {
          return new Set(value.values);
        }
        if (value.__type === 'Map' && Array.isArray(value.entries)) {
          return new Map(value.entries);
        }
      }
      return value;
    });
  }

  public static createSaveEnvelope<T>(payload: T): SaveStateEnvelope<T> {
    const serializedPayload = this.serialize(payload);
    const checksum = this.hashString(serializedPayload);
    return {
      version: this.VERSION,
      timestamp: Date.now(),
      checksum,
      payload
    };
  }

  public static verifyAndUnwrapSave<T>(envelope: SaveStateEnvelope<T>): { valid: boolean; payload?: T; error?: string } {
    if (!envelope || typeof envelope !== 'object') {
      return { valid: false, error: 'Invalid save data format' };
    }
    const serializedPayload = this.serialize(envelope.payload);
    const calculatedChecksum = this.hashString(serializedPayload);
    if (calculatedChecksum !== envelope.checksum) {
      return { valid: false, error: 'Save data checksum mismatch - corrupted save' };
    }
    return { valid: true, payload: envelope.payload };
  }

  public static compressToBase64(jsonStr: string): string {
    if (typeof btoa !== 'undefined') {
      return btoa(encodeURIComponent(jsonStr));
    }
    return (globalThis as any).Buffer ? (globalThis as any).Buffer.from(jsonStr, 'utf-8').toString('base64') : jsonStr;
  }

  public static decompressFromBase64(encoded: string): string {
    if (typeof atob !== 'undefined') {
      return decodeURIComponent(atob(encoded));
    }
    return (globalThis as any).Buffer ? (globalThis as any).Buffer.from(encoded, 'base64').toString('utf-8') : encoded;
  }

  public static cloneDeep<T>(obj: T): T {
    return this.deserialize<T>(this.serialize(obj));
  }

  public static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
