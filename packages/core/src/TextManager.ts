import { EventEmitter } from './EventSystem.ts';

export interface SpeakerProfile {
  /** Unique speaker id (e.g. 'owl', 'fox', 'elder_tree', 'system'). */
  id: string;
  /** Display name of the speaker. */
  name: string;
  /** Optional avatar URL or sprite asset key. */
  avatar?: string;
  /** Primary theme color for name tags or speech bubbles (hex or CSS color). */
  color?: string;
  /** Associated procedural voice profile or preset name. */
  voice?: any;
  /** Additional custom metadata (role, faction, title). */
  metadata?: Record<string, any>;
}

export interface ParsedTextTag {
  name: string;
  value: string;
  charIndex: number;
}

export interface ParsedText {
  /** Original text with tags intact. */
  rawText: string;
  /** Clean text stripped of all `<tag>` control tokens. */
  cleanText: string;
  /** List of extracted control tags with character index offsets. */
  tags: ParsedTextTag[];
}

/**
 * 📜 TextManager
 * Internationalization (i18n), String Table lookup with variable interpolation,
 * speaker registry, rich dialogue tag parsing, and centralized text line management.
 */
export class TextManager extends EventEmitter {
  private currentLocale: string = 'en';
  private stringTables: Map<string, Map<string, string>> = new Map();
  private speakers: Map<string, SpeakerProfile> = new Map();
  private textLines: Map<string, string> = new Map();

  constructor(defaultLocale: string = 'en') {
    super();
    this.currentLocale = defaultLocale;
    this.stringTables.set(defaultLocale, new Map());
  }

  // --- Localization & String Tables ---

  /** Set current active language locale (e.g. 'en', 'ja', 'es', 'fr'). */
  public setLocale(locale: string): this {
    if (this.currentLocale !== locale) {
      const prev = this.currentLocale;
      this.currentLocale = locale;
      if (!this.stringTables.has(locale)) {
        this.stringTables.set(locale, new Map());
      }
      this.emit('locale_changed', { from: prev, to: locale });
    }
    return this;
  }

  /** Get current active language locale. */
  public getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Register localized key-value translations for a specific locale.
   * Supports flat or nested key maps (nested keys flattened as 'category.subKey').
   */
  public registerStrings(locale: string, table: Record<string, any>): this {
    if (!this.stringTables.has(locale)) {
      this.stringTables.set(locale, new Map());
    }
    const map = this.stringTables.get(locale)!;
    this.flattenObject(table, '', map);
    return this;
  }

  /**
   * Translate a key with variable interpolation ({name}, {count}).
   * Falls back to default locale or returns the key if not found.
   */
  public t(key: string, variables?: Record<string, any>): string {
    let text = this.stringTables.get(this.currentLocale)?.get(key);

    // Fallback to 'en' or first registered locale
    if (text === undefined && this.currentLocale !== 'en') {
      text = this.stringTables.get('en')?.get(key);
    }

    if (text === undefined) {
      text = this.textLines.get(key) ?? key;
    }

    if (variables) {
      return this.interpolate(text, variables);
    }

    return text;
  }

  /** Interpolate variables into text (e.g. "Hello {player}, you have {coins} coins"). */
  public interpolate(template: string, vars: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return vars[key] !== undefined ? String(vars[key]) : match;
    });
  }

  /** Simple pluralization formatter based on count (e.g. formatPlural(1, 'coin', 'coins')). */
  public formatPlural(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }

  // --- Speaker Management ---

  /** Register a character speaker profile. */
  public registerSpeaker(profile: SpeakerProfile): this {
    this.speakers.set(profile.id, profile);
    this.emit('speaker_registered', { profile });
    return this;
  }

  /** Register multiple speaker profiles at once. */
  public registerSpeakers(profiles: SpeakerProfile[]): this {
    for (const p of profiles) {
      this.registerSpeaker(p);
    }
    return this;
  }

  /** Retrieve a registered speaker profile. */
  public getSpeaker(id: string): SpeakerProfile | undefined {
    return this.speakers.get(id);
  }

  /** Check if a speaker exists. */
  public hasSpeaker(id: string): boolean {
    return this.speakers.has(id);
  }

  /** Get all registered speakers. */
  public getAllSpeakers(): SpeakerProfile[] {
    return Array.from(this.speakers.values());
  }

  // --- Text Line Repository ---

  /** Register a named text line. */
  public registerLine(id: string, text: string): this {
    this.textLines.set(id, text);
    return this;
  }

  /** Register multiple named text lines. */
  public registerLines(lines: Record<string, string>): this {
    for (const [k, v] of Object.entries(lines)) {
      this.registerLine(k, v);
    }
    return this;
  }

  /** Get a named text line. */
  public getLine(id: string, vars?: Record<string, any>): string | undefined {
    const raw = this.textLines.get(id);
    if (raw === undefined) return undefined;
    return vars ? this.interpolate(raw, vars) : raw;
  }

  // --- Rich Text Tag Parsing ---

  /**
   * Parse inline dialogue control tags (e.g. `<speed=50>`, `<pause=0.5>`, `<color=#ff0000>Hi</color>`, `<voice=owl>`).
   * Returns clean plain text and a list of tags with character positions.
   */
  public parseTags(rawText: string): ParsedText {
    const tagRegex = /<([a-zA-Z0-9_-]+)(?:=([^>/]+))?>(.*?)<\/\1>|<([a-zA-Z0-9_-]+)(?:=([^>/]+))?\s*\/?>/g;
    let cleanText = '';
    const tags: ParsedTextTag[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(rawText)) !== null) {
      // Append text before tag
      const precedingText = rawText.substring(lastIndex, match.index);
      cleanText += precedingText;

      const tagName = (match[1] || match[4]).toLowerCase();
      const rawValue = match[2] || match[5] || '';
      const tagValue = rawValue.replace(/\/$/, '').trim();
      const innerContent = match[3] || '';

      tags.push({
        name: tagName,
        value: tagValue,
        charIndex: cleanText.length
      });

      if (innerContent) {
        cleanText += innerContent;
      }

      lastIndex = match.index + match[0].length;
    }

    cleanText += rawText.substring(lastIndex);

    return {
      rawText,
      cleanText,
      tags
    };
  }

  /** Clear all loaded string tables and line registries. */
  public clear(): void {
    this.stringTables.clear();
    this.stringTables.set(this.currentLocale, new Map());
    this.speakers.clear();
    this.textLines.clear();
  }

  private flattenObject(obj: Record<string, any>, prefix: string, targetMap: Map<string, string>): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenObject(value, fullKey, targetMap);
      } else {
        targetMap.set(fullKey, String(value));
      }
    }
  }
}

export const GlobalText = new TextManager();
