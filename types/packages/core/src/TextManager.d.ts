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
export declare class TextManager extends EventEmitter {
    private currentLocale;
    private stringTables;
    private speakers;
    private textLines;
    constructor(defaultLocale?: string);
    /** Set current active language locale (e.g. 'en', 'ja', 'es', 'fr'). */
    setLocale(locale: string): this;
    /** Get current active language locale. */
    getLocale(): string;
    /**
     * Register localized key-value translations for a specific locale.
     * Supports flat or nested key maps (nested keys flattened as 'category.subKey').
     */
    registerStrings(locale: string, table: Record<string, any>): this;
    /**
     * Translate a key with variable interpolation ({name}, {count}).
     * Falls back to default locale or returns the key if not found.
     */
    t(key: string, variables?: Record<string, any>): string;
    /** Interpolate variables into text (e.g. "Hello {player}, you have {coins} coins"). */
    interpolate(template: string, vars: Record<string, any>): string;
    /** Simple pluralization formatter based on count (e.g. formatPlural(1, 'coin', 'coins')). */
    formatPlural(count: number, singular: string, plural: string): string;
    /** Register a character speaker profile. */
    registerSpeaker(profile: SpeakerProfile): this;
    /** Register multiple speaker profiles at once. */
    registerSpeakers(profiles: SpeakerProfile[]): this;
    /** Retrieve a registered speaker profile. */
    getSpeaker(id: string): SpeakerProfile | undefined;
    /** Check if a speaker exists. */
    hasSpeaker(id: string): boolean;
    /** Get all registered speakers. */
    getAllSpeakers(): SpeakerProfile[];
    /** Register a named text line. */
    registerLine(id: string, text: string): this;
    /** Register multiple named text lines. */
    registerLines(lines: Record<string, string>): this;
    /** Get a named text line. */
    getLine(id: string, vars?: Record<string, any>): string | undefined;
    /**
     * Parse inline dialogue control tags (e.g. `<speed=50>`, `<pause=0.5>`, `<color=#ff0000>Hi</color>`, `<voice=owl>`).
     * Returns clean plain text and a list of tags with character positions.
     */
    parseTags(rawText: string): ParsedText;
    /** Clear all loaded string tables and line registries. */
    clear(): void;
    private flattenObject;
}
export declare const GlobalText: TextManager;
