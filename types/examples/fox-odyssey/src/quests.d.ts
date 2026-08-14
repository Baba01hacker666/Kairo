import type { QuestSystem } from '@kairo/core';
import type { GameState } from './state.ts';
/**
 * Fox Odyssey quest definitions (one quest per story chapter), driven through
 * the engine's QuestSystem. Objective progress is derived from GameState, which
 * is already persisted — so quest state never needs its own save entry.
 */
export declare const CHAPTER_QUESTS: Record<number, string>;
export declare function questForChapter(chapter: number): string;
export declare function registerFoxQuests(quests: QuestSystem): void;
/**
 * Re-derive objective progress from the persisted GameState. Idempotent —
 * call after loading a save or starting a new game.
 */
export declare function syncFoxQuestProgress(quests: QuestSystem, state: GameState): void;
