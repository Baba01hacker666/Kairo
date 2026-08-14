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
  objectives: Array<{ id: string; progress: number; completed: boolean }>;
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
export class QuestSystem extends EventEmitter {
  private defs: Map<string, QuestDef> = new Map();
  private quests: Map<string, QuestState> = new Map();

  /** Register a quest definition. */
  public register(def: QuestDef): this {
    this.defs.set(def.id, def);
    return this;
  }

  /** Register several quest definitions at once. */
  public registerAll(defs: QuestDef[]): this {
    defs.forEach(def => this.register(def));
    return this;
  }

  /** True when the quest is registered and all prerequisites are completed. */
  public hasUnlocked(id: string): boolean {
    const def = this.defs.get(id);
    if (!def) return false;
    return !(def.prerequisites || []).some(prereq => !this.isCompleted(prereq));
  }

  /** Whether a registered quest exists. */
  public has(id: string): boolean {
    return this.defs.has(id);
  }

  /** Start a quest. Returns the quest state, or null if unknown / prereqs unmet. */
  public start(id: string): QuestState | null {
    const def = this.defs.get(id);
    if (!def || !this.hasUnlocked(id)) return null;

    let quest = this.quests.get(id);
    if (!quest) {
      quest = this.buildState(def);
      this.quests.set(id, quest);
    }
    if (quest.status !== 'active') {
      quest.status = 'active';
      quest.startedAt = Date.now();
      this.emit('quest_started', id);
    }
    return quest;
  }

  /** Force-complete a quest (marks all objectives complete). */
  public complete(id: string): void {
    const quest = this.ensureState(id);
    if (quest.status === 'completed') return;
    quest.objectives.forEach(obj => {
      obj.progress = obj.target;
      obj.completed = true;
    });
    quest.status = 'completed';
    quest.completedAt = Date.now();
    this.emit('quest_completed', id);
  }

  /** Mark a quest as failed. */
  public fail(id: string): void {
    const quest = this.ensureState(id);
    if (quest.status === 'completed' || quest.status === 'failed') return;
    quest.status = 'failed';
    this.emit('quest_failed', id);
  }

  /** Advance an objective's progress. Auto-completes objectives and the quest. */
  public advance(id: string, objectiveId: string, amount: number = 1): void {
    this.addProgress(id, objectiveId, amount);
  }

  /** Set an objective's progress to an absolute value. */
  public setProgress(id: string, objectiveId: string, value: number): void {
    const quest = this.ensureState(id);
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return;
    obj.progress = Math.max(0, Math.min(obj.target, value));
    this.emit('objective_progress', { questId: id, objectiveId, progress: obj.progress, target: obj.target } satisfies ObjectiveProgressEvent);
    if (obj.progress >= obj.target) this.completeObjective(quest, obj.id);
  }

  /** Get quest state (creates a fresh state from the definition if never started). */
  public get(id: string): QuestState | undefined {
    const def = this.defs.get(id);
    if (!def) return undefined;
    return this.quests.get(id) ?? this.buildState(def);
  }

  /** Objective text with {current}/{total} placeholders filled with live values. */
  public getFormattedText(id: string, objectiveId: string): string | null {
    const quest = this.get(id);
    const obj = quest?.objectives.find(o => o.id === objectiveId);
    if (!obj) return null;
    return formatObjectiveText(obj.text, obj.progress, obj.target);
  }

  /** All objectives of a quest with their placeholder-formatted display text. */
  public getFormattedObjectives(id: string): Array<{ id: string; text: string; progress: number; target: number; completed: boolean }> | null {
    const quest = this.get(id);
    if (!quest) return null;
    return quest.objectives.map(o => ({
      id: o.id,
      text: formatObjectiveText(o.text, o.progress, o.target),
      progress: o.progress,
      target: o.target,
      completed: o.completed
    }));
  }

  /** All active (in-progress) quests. */
  public getActive(): QuestState[] {
    const result: QuestState[] = [];
    this.quests.forEach(q => {
      if (q.status === 'active') result.push(q);
    });
    return result;
  }

  public isActive(id: string): boolean {
    return this.quests.get(id)?.status === 'active';
  }

  public isCompleted(id: string): boolean {
    return this.quests.get(id)?.status === 'completed';
  }

  /** Snapshot all quest state for save/load. */
  public serialize(): QuestSnapshot[] {
    const snapshots: QuestSnapshot[] = [];
    this.quests.forEach(q => {
      snapshots.push({
        id: q.id,
        status: q.status,
        startedAt: q.startedAt,
        completedAt: q.completedAt,
        objectives: q.objectives.map(o => ({ id: o.id, progress: o.progress, completed: o.completed }))
      });
    });
    return snapshots;
  }

  /** Restore quest state from snapshots. Definitions must be registered first. */
  public deserialize(snapshots: QuestSnapshot[]): void {
    snapshots.forEach(snap => {
      const def = this.defs.get(snap.id);
      if (!def) return; // Unknown quest — ignore for forward compatibility
      const quest = this.quests.get(snap.id) ?? this.buildState(def);
      quest.status = snap.status;
      quest.startedAt = snap.startedAt;
      quest.completedAt = snap.completedAt;
      snap.objectives.forEach(snapObj => {
        const obj = quest.objectives.find(o => o.id === snapObj.id);
        if (obj) {
          obj.progress = snapObj.progress;
          obj.completed = snapObj.completed;
        }
      });
      this.quests.set(snap.id, quest);
    });
  }

  /** Reset all quest state (definitions stay registered). */
  public reset(): void {
    this.quests.clear();
  }

  private addProgress(id: string, objectiveId: string, amount: number): void {
    const quest = this.ensureState(id);
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return;
    obj.progress = Math.min(obj.target, obj.progress + amount);
    this.emit('objective_progress', { questId: id, objectiveId, progress: obj.progress, target: obj.target } satisfies ObjectiveProgressEvent);
    if (obj.progress >= obj.target) this.completeObjective(quest, obj.id);
  }

  private completeObjective(quest: QuestState, objectiveId: string): void {
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return;
    obj.completed = true;
    this.emit('objective_completed', { questId: quest.id, objectiveId });
    if (quest.objectives.every(o => o.completed) && quest.status === 'active') {
      quest.status = 'completed';
      quest.completedAt = Date.now();
      this.emit('quest_completed', quest.id);
    }
  }

  private ensureState(id: string): QuestState {
    const def = this.defs.get(id);
    if (!def) {
      throw new Error(`[QuestSystem] Quest '${id}' is not registered. Call register() first.`);
    }
    let quest = this.quests.get(id);
    if (!quest) {
      quest = this.buildState(def);
      this.quests.set(id, quest);
    }
    return quest;
  }

  private buildState(def: QuestDef): QuestState {
    return {
      id: def.id,
      title: def.title,
      description: def.description ?? '',
      status: 'locked',
      objectives: def.objectives.map(o => ({
        id: o.id,
        text: o.text,
        target: o.target ?? 1,
        progress: 0,
        completed: false
      })),
      startedAt: 0,
      completedAt: null,
      hidden: def.hidden ?? false
    };
  }
}

function formatObjectiveText(text: string, progress: number, target: number): string {
  return text.split('{current}').join(String(progress)).split('{total}').join(String(target));
}
