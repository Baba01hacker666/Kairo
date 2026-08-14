import { EventEmitter } from './EventSystem.ts';
export type QuestStatus = 'locked' | 'active' | 'completed' | 'failed';
export interface QuestObjectiveDef {
    /** Unique objective id within the quest. */
    id: string;
    /** Display text. May contain {current}/{total} placeholders for the UI. */
    text: string;
    /** Progress required to complete the objective. Defaults to 1. */
    target?: number;
}
export interface QuestDef {
    id: string;
    title: string;
    description?: string;
    objectives: QuestObjectiveDef[];
    /** Quest ids that must be completed before this quest can be started. */
    prerequisites?: string[];
    /** Hidden quests are not revealed by unlock checks until explicitly started. */
    hidden?: boolean;
}
export interface QuestObjectiveState {
    id: string;
    text: string;
    target: number;
    progress: number;
    completed: boolean;
}
export interface QuestState {
    id: string;
    title: string;
    description: string;
    status: QuestStatus;
    objectives: QuestObjectiveState[];
    startedAt: number;
    completedAt: number | null;
    hidden: boolean;
}
/** Serializable snapshot used for save/load (no functions or runtime state). */
export interface QuestSnapshot {
    id: string;
    status: QuestStatus;
    startedAt: number;
    completedAt: number | null;
    objectives: Array<{
        id: string;
        progress: number;
        completed: boolean;
    }>;
}
export interface ObjectiveProgressEvent {
    questId: string;
    objectiveId: string;
    progress: number;
    target: number;
}
/**
 * 🎯 QuestSystem
 * Declarative quest & objective tracking with prerequisite gating, automatic
 * objective/quest completion, event hooks, and save/load snapshots.
 *
 * Events:
 *  - 'quest_unlocked'  (questId)      – prerequisites satisfied, can be started
 *  - 'quest_started'   (questId)
 *  - 'objective_progress' ({ questId, objectiveId, progress, target })
 *  - 'objective_completed' ({ questId, objectiveId })
 *  - 'quest_completed' (questId)
 *  - 'quest_failed'    (questId)
 */
export declare class QuestSystem extends EventEmitter {
    private defs;
    private quests;
    /** Register a quest definition. */
    register(def: QuestDef): this;
    /** Register several quest definitions at once. */
    registerAll(defs: QuestDef[]): this;
    /** True when the quest is registered and all prerequisites are completed. */
    hasUnlocked(id: string): boolean;
    /** Whether a registered quest exists. */
    has(id: string): boolean;
    /** Start a quest. Returns the quest state, or null if unknown / prereqs unmet. */
    start(id: string): QuestState | null;
    /** Force-complete a quest (marks all objectives complete). */
    complete(id: string): void;
    /** Mark a quest as failed. */
    fail(id: string): void;
    /** Advance an objective's progress. Auto-completes objectives and the quest. */
    advance(id: string, objectiveId: string, amount?: number): void;
    /** Set an objective's progress to an absolute value. */
    setProgress(id: string, objectiveId: string, value: number): void;
    /** Get quest state (creates a fresh state from the definition if never started). */
    get(id: string): QuestState | undefined;
    /** Objective text with {current}/{total} placeholders filled with live values. */
    getFormattedText(id: string, objectiveId: string): string | null;
    /** All objectives of a quest with their placeholder-formatted display text. */
    getFormattedObjectives(id: string): Array<{
        id: string;
        text: string;
        progress: number;
        target: number;
        completed: boolean;
    }> | null;
    /** All active (in-progress) quests. */
    getActive(): QuestState[];
    isActive(id: string): boolean;
    isCompleted(id: string): boolean;
    /** Snapshot all quest state for save/load. */
    serialize(): QuestSnapshot[];
    /** Restore quest state from snapshots. Definitions must be registered first. */
    deserialize(snapshots: QuestSnapshot[]): void;
    /** Reset all quest state (definitions stay registered). */
    reset(): void;
    private addProgress;
    private completeObjective;
    private ensureState;
    private buildState;
}
