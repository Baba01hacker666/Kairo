import type { QuestSystem } from '@kairo/core';
import type { GameState } from './state.ts';

/**
 * Fox Odyssey quest definitions (one quest per story chapter), driven through
 * the engine's QuestSystem. Objective progress is derived from GameState, which
 * is already persisted — so quest state never needs its own save entry.
 */
export const CHAPTER_QUESTS: Record<number, string> = {
  1: 'ch1_ashen_shadow',
  2: 'ch2_harmonize',
  3: 'ch3_gateway',
  4: 'ch4_summit'
};

export function questForChapter(chapter: number): string {
  return CHAPTER_QUESTS[chapter] ?? 'ch1_ashen_shadow';
}

export function registerFoxQuests(quests: QuestSystem): void {
  quests.registerAll([
    {
      id: 'ch1_ashen_shadow',
      title: 'The Ashen Shadow',
      objectives: [
        { id: 'speak_owl', text: 'Speak with Grand Elder Owl' },
        { id: 'creepers', text: 'Purify Shadow Creepers ({current}/3)', target: 3 },
        { id: 'acorns', text: 'Gather Sun Acorns ({current}/{total})', target: 20 }
      ]
    },
    {
      id: 'ch2_harmonize',
      title: 'Harmonize the Grove',
      objectives: [
        { id: 'chimes', text: 'Ring Ancient Chimes ({current}/4 🔔)', target: 4 },
        { id: 'wisps', text: 'Awaken Grove Wisps ({current}/5 ✨)', target: 5 },
        { id: 'acorns', text: 'Gather Sun Acorns ({current}/{total})', target: 20 }
      ]
    },
    {
      id: 'ch3_gateway',
      title: 'The Alpine Gateway',
      objectives: [
        { id: 'portal', text: 'Step through the Northern Portal' },
        { id: 'explore', text: 'Explore the Moonlit Crystal Peaks' },
        { id: 'geyser', text: 'Launch off a Crystal Geyser 💨' }
      ]
    },
    {
      id: 'ch4_summit',
      title: 'The Moonlit Summit',
      objectives: [
        { id: 'altar', text: 'Ascend to the Moon Altar 💎' },
        { id: 'boss', text: 'Cleanse the Shadow Behemoth' },
        { id: 'golden', text: 'Master the Golden Spirit Fox Form' }
      ]
    }
  ]);
}

/**
 * Re-derive objective progress from the persisted GameState. Idempotent —
 * call after loading a save or starting a new game.
 */
export function syncFoxQuestProgress(quests: QuestSystem, state: GameState): void {
  const set = (questId: string, objectiveId: string, value: number) => {
    quests.setProgress(questId, objectiveId, value);
  };

  set('ch1_ashen_shadow', 'creepers', state.beastsDefeated);
  set('ch1_ashen_shadow', 'acorns', state.acornsCollected);

  set('ch2_harmonize', 'chimes', state.litChimeIds.size);
  set('ch2_harmonize', 'wisps', state.wispsCollectedCount);
  set('ch2_harmonize', 'acorns', state.acornsCollected);

  const reachedPeaks = state.currentLevel === 2;
  set('ch3_gateway', 'portal', reachedPeaks ? 1 : 0);
  set('ch3_gateway', 'explore', reachedPeaks ? 1 : 0);

  set('ch4_summit', 'altar', state.isGameWon ? 1 : 0);
  set('ch4_summit', 'boss', state.isGameWon ? 1 : 0);
  set('ch4_summit', 'golden', state.isGoldenForm ? 1 : 0);
}
