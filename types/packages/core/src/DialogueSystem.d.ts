import { EventEmitter } from './EventSystem.ts';
import { TextManager, SpeakerProfile, ParsedText } from './TextManager.ts';
export interface DialogueChoice {
    text: string;
    /** Target line id (or index) to jump to after selecting; omit to end the dialogue. */
    next?: string | number;
    onSelect?: () => void;
}
export interface DialogueLine {
    /** Optional unique id so choices can target this line. */
    id?: string;
    speaker?: string;
    speakerId?: string;
    avatar?: string;
    text: string;
    /** Voice preset name or custom VoiceProfile for typewriter blips / speech. */
    voice?: any;
    /** Audio clip file path for full voice acting playback. */
    audioClip?: string;
    /** Typewriter speed override for this line (chars per second). */
    typewriterCps?: number;
    choices?: DialogueChoice[];
    onStart?: () => void;
    onEnd?: () => void;
}
export interface DialogueLineEvent {
    line: DialogueLine;
    index: number;
    speakerProfile?: SpeakerProfile;
    parsedText?: ParsedText;
}
/**
 * 💬 DialogueSystem
 * Sequential & branching dialogue with a typewriter effect, procedural voice blips,
 * speaker/avatar metadata, choices, and event hooks.
 *
 * Events:
 *  - 'dialogue_started' ({ id, length })
 *  - 'dialogue_line'    ({ line, index, speakerProfile, parsedText })
 *  - 'dialogue_char'    ({ char, charIndex, line })
 *  - 'dialogue_ended'   ({ id })
 *  - 'dialogue_choice_selected' ({ choice, line })
 *  - 'dialogue_skipped' ()       – play() called while already playing
 */
export declare class DialogueSystem extends EventEmitter {
    private dialogues;
    /** The full script being played (authoritative source for choice jumps). */
    private script;
    private queue;
    private current;
    private currentIndex;
    private currentId;
    private lastRevealedChars;
    textManager?: TextManager;
    voiceManager?: any;
    voiceBlipsEnabled: boolean;
    /** Default typewriter speed in characters per second (0 disables typing). */
    typewriterCps: number;
    private typingTime;
    /** Register a named dialogue script. */
    register(id: string, lines: DialogueLine[]): this;
    /** Register several dialogues at once. */
    registerAll(map: Record<string, DialogueLine[]>): this;
    /** Start (or restart) a named dialogue, or play raw lines directly. */
    play(idOrLines: string | DialogueLine[]): void;
    /** Attach a TextManager for speaker profiles and localization. */
    setTextManager(tm: TextManager): this;
    /** Attach a VoiceManager for procedural typewriter blips. */
    setVoiceManager(vm: any): this;
    /**
     * Advance to the next line. If the current line is still typing, this first
     * finishes the typewriter effect instead.
     */
    advance(): void;
    /** Finish the typewriter effect instantly for the current line. */
    skipTyping(): void;
    /** Select a choice by index. Jumps to the targeted line or ends the dialogue. */
    selectChoice(index: number): void;
    /** Stop the dialogue immediately. */
    stop(): void;
    /** Advance the typewriter effect. Call every frame while playing. */
    update(dt: number): void;
    get isPlaying(): boolean;
    get currentLine(): DialogueLine | null;
    get currentDialogueId(): string | null;
    get isTyping(): boolean;
    /** Number of characters revealed by the typewriter effect. */
    get typedCharacters(): number;
    get choices(): DialogueChoice[] | undefined;
    private finishTyping;
    private finish;
    /** Resolve a choice target (line id or index) to an index in the active script. */
    private indexOfLine;
}
