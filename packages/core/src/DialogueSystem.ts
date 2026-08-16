import { EventEmitter } from './EventSystem.ts';

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
  avatar?: string;
  text: string;
  /** Typewriter speed override for this line (chars per second). */
  typewriterCps?: number;
  choices?: DialogueChoice[];
  onStart?: () => void;
  onEnd?: () => void;
}

export interface DialogueLineEvent {
  line: DialogueLine;
  index: number;
}

/**
 * 💬 DialogueSystem
 * Sequential & branching dialogue with a typewriter effect, speaker/avatar
 * metadata, choices, and event hooks. Engine-agnostic (no DOM) — pair it with
 * your own UI layer via the emitted events.
 *
 * Events:
 *  - 'dialogue_started' ({ id, length })
 *  - 'dialogue_line'    ({ line, index })
 *  - 'dialogue_ended'   ({ id })
 *  - 'dialogue_choice_selected' ({ choice, line })
 *  - 'dialogue_skipped' ()       – play() called while already playing
 */
export class DialogueSystem extends EventEmitter {
  private dialogues: Map<string, DialogueLine[]> = new Map();
  /** The full script being played (authoritative source for choice jumps). */
  private script: DialogueLine[] | null = null;
  private queue: DialogueLine[] = [];
  private current: DialogueLine | null = null;
  private currentIndex: number = 0;
  private currentId: string | null = null;

  /** Default typewriter speed in characters per second (0 disables typing). */
  public typewriterCps: number = 40;
  private typingTime: number = 0;

  /** Register a named dialogue script. */
  public register(id: string, lines: DialogueLine[]): this {
    this.dialogues.set(id, lines);
    return this;
  }

  /** Register several dialogues at once. */
  public registerAll(map: Record<string, DialogueLine[]>): this {
    Object.keys(map).forEach(id => this.register(id, map[id]));
    return this;
  }

  /** Start (or restart) a named dialogue, or play raw lines directly. */
  public play(idOrLines: string | DialogueLine[]): void {
    const lines = typeof idOrLines === 'string' ? this.dialogues.get(idOrLines) : idOrLines;
    if (!lines || lines.length === 0) return;

    if (this.isPlaying) {
      // Already in a conversation — restart with the new script.
      if (this.current?.onEnd) this.current.onEnd();
      this.emit('dialogue_skipped');
    }

    this.currentId = typeof idOrLines === 'string' ? idOrLines : null;
    this.script = lines;
    this.queue = lines.slice();
    this.current = null;
    this.currentIndex = -1;
    this.typingTime = 0;
    this.emit('dialogue_started', { id: this.currentId, length: this.queue.length });
    this.advance();
  }

  /**
   * Advance to the next line. If the current line is still typing, this first
   * finishes the typewriter effect instead.
   */
  public advance(): void {
    if (!this.isPlaying) return;
    if (this.isTyping) {
      this.finishTyping();
      return;
    }
    if (this.current?.onEnd) this.current.onEnd();

    if (this.queue.length === 0) {
      this.finish();
      return;
    }

    const line = this.queue.shift()!;
    this.current = line;
    this.currentIndex++;
    this.typingTime = 0;
    if (line.onStart) line.onStart();
    this.emit('dialogue_line', { line, index: this.currentIndex } satisfies DialogueLineEvent);
  }

  /** Finish the typewriter effect instantly for the current line. */
  public skipTyping(): void {
    this.finishTyping();
  }

  /** Select a choice by index. Jumps to the targeted line or ends the dialogue. */
  public selectChoice(index: number): void {
    const line = this.current;
    const choice = line?.choices?.[index];
    if (!choice) return;
    this.emit('dialogue_choice_selected', { choice, line });
    if (choice.onSelect) choice.onSelect();
    this.finishTyping();

    // Explicit end sentinel — note: `next: 0` is a valid line index and must NOT end.
    if (choice.next === undefined || choice.next === null || choice.next === '') {
      if (this.current?.onEnd) this.current.onEnd();
      this.finish();
      return;
    }

    const targetIndex = this.indexOfLine(choice.next);
    if (targetIndex < 0 || !this.script) {
      this.finish();
      return;
    }
    const target = this.script[targetIndex];
    if (this.current?.onEnd) this.current.onEnd();
    this.current = target;
    this.currentIndex = targetIndex;
    // Continue from the line after the jump target within the same script.
    this.queue = this.script.slice(targetIndex + 1);
    this.typingTime = 0;
    if (target.onStart) target.onStart();
    this.emit('dialogue_line', { line: target, index: this.currentIndex } satisfies DialogueLineEvent);
  }

  /** Stop the dialogue immediately. */
  public stop(): void {
    if (!this.isPlaying) return;
    if (this.current?.onEnd) this.current.onEnd();
    const id = this.currentId;
    this.queue = [];
    this.script = null;
    this.current = null;
    this.currentId = null;
    this.typingTime = 0;
    this.emit('dialogue_ended', { id });
  }

  /** Advance the typewriter effect. Call every frame while playing. */
  public update(dt: number): void {
    if (!this.isTyping || !this.current) return;
    this.typingTime += dt;
  }

  public get isPlaying(): boolean {
    return this.current !== null || this.queue.length > 0;
  }

  public get currentLine(): DialogueLine | null {
    return this.current;
  }

  public get currentDialogueId(): string | null {
    return this.currentId;
  }

  public get isTyping(): boolean {
    if (!this.current) return false;
    const cps = this.current.typewriterCps ?? this.typewriterCps;
    return cps > 0 && this.typedCharacters < this.current.text.length;
  }

  /** Number of characters revealed by the typewriter effect. */
  public get typedCharacters(): number {
    if (!this.current) return 0;
    const cps = this.current.typewriterCps ?? this.typewriterCps;
    if (cps <= 0) return this.current.text.length;
    return Math.min(this.current.text.length, Math.floor(this.typingTime * cps));
  }

  public get choices(): DialogueChoice[] | undefined {
    return this.current?.choices;
  }

  private finishTyping(): void {
    if (!this.current) return;
    const cps = this.current.typewriterCps ?? this.typewriterCps;
    if (cps > 0) this.typingTime = this.current.text.length / cps;
  }

  private finish(): void {
    this.queue = [];
    this.script = null;
    this.current = null;
    const id = this.currentId;
    this.currentId = null;
    this.typingTime = 0;
    this.emit('dialogue_ended', { id });
  }

  /** Resolve a choice target (line id or index) to an index in the active script. */
  private indexOfLine(target: string | number): number {
    if (!this.script) return -1;
    if (typeof target === 'number') {
      return target >= 0 && target < this.script.length ? target : -1;
    }
    return this.script.findIndex(l => l.id === target);
  }
}
