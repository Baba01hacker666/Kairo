import type { QuestSystem, DialogueSystem } from '@kairo/core';
import { GameState } from '../state.ts';
import { questForChapter } from '../quests.ts';

export interface ObjectiveItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export class GameHUD {
  // Start Screen Elements
  private startScreenEl = document.getElementById('start-screen')!;
  private startNewBtnEl = document.getElementById('start-new-btn')!;
  private startContinueBtnEl = document.getElementById('start-continue-btn')!;
  private saveInfoPreviewEl = document.getElementById('save-info-preview')!;
  private saveWispsCountEl = document.getElementById('save-wisps-count')!;
  private saveAcornsCountEl = document.getElementById('save-acorns-count')!;
  private startResetSaveBtnEl = document.getElementById('start-reset-save-btn')!;

  // HUD Elements
  private acornValEl = document.getElementById('acorn-val')!;
  private staminaFillEl = document.getElementById('stamina-fill')!;
  private realmPillEl = document.getElementById('realm-pill')!;
  private questChapterTagEl = document.getElementById('quest-chapter-tag')!;
  private questTextEl = document.getElementById('quest-text')!;
  private questObjectivesListEl = document.getElementById('quest-objectives-list')!;
  private spiritRankBadgeEl = document.getElementById('spirit-rank-badge')!;
  private actionToastEl = document.getElementById('action-toast')!;
  private toastIconEl = document.getElementById('toast-icon')!;
  private toastTextEl = document.getElementById('toast-text')!;
  private soundBtnEl = document.getElementById('sound-btn')!;
  private photoBtnEl = document.getElementById('photo-btn')!;
  private photoModeUIEl = document.getElementById('photo-mode-ui')!;
  private photoExitBtnEl = document.getElementById('photo-exit-btn')!;
  private photoCaptureBtnEl = document.getElementById('photo-capture-btn')!;
  private victoryModalEl = document.getElementById('victory-modal')!;
  private finalAcornsEl = document.getElementById('final-acorns')!;
  private finalTimeEl = document.getElementById('final-time')!;
  private victoryContinueBtnEl = document.getElementById('victory-continue-btn')!;

  private dialogueBoxEl = document.getElementById('dialogue-box')!;
  private npcAvatarEl = document.getElementById('npc-avatar')!;
  private npcNameEl = document.getElementById('npc-name')!;
  private npcTextEl = document.getElementById('npc-text')!;
  private dialogueCloseBtnEl = document.getElementById('dialogue-close-btn')!;

  private toastTimeout: any = null;
  private quests?: QuestSystem;
  private dialogue?: DialogueSystem;

  constructor(
    onStartGame: (isContinue: boolean) => void,
    onCaptureScreenshot: () => void,
    onPlayClickSound: () => void,
    quests?: QuestSystem,
    dialogue?: DialogueSystem
  ) {
    this.quests = quests;
    this.dialogue = dialogue;
    this.checkSavedGame();

    // Start Screen New Game
    this.startNewBtnEl.addEventListener('click', () => {
      this.startScreenEl.classList.add('hidden');
      GameState.instance.isGameStarted = true;
      onPlayClickSound();
      onStartGame(false);
    });

    // Start Screen Continue Game
    this.startContinueBtnEl.addEventListener('click', () => {
      this.startScreenEl.classList.add('hidden');
      GameState.instance.isGameStarted = true;
      onPlayClickSound();
      onStartGame(true);
    });

    // Reset Saved Game
    this.startResetSaveBtnEl.addEventListener('click', () => {
      if (confirm('Clear saved progress and start fresh?')) {
        GameState.instance.clearSaveData();
        this.checkSavedGame();
        this.showToast('Saved data cleared', '🗑️');
      }
    });

    // Sound Button
    this.soundBtnEl.addEventListener('click', () => {
      const enabled = GameState.instance.toggleSound();
      this.soundBtnEl.innerText = enabled ? '🔊' : '🔇';
      this.showToast(enabled ? 'Audio Enabled' : 'Audio Muted', enabled ? '🔊' : '🔇');
    });

    // Photo Mode Buttons
    this.photoBtnEl.addEventListener('click', () => {
      this.togglePhotoMode();
    });
    this.photoExitBtnEl.addEventListener('click', () => {
      this.togglePhotoMode();
    });
    this.photoCaptureBtnEl.addEventListener('click', () => {
      onCaptureScreenshot();
      this.showToast('📸 Screenshot Saved!', '✨');
    });

    // Dialogue Close — advances the engine DialogueSystem (finish typing → next
    // line → end). The box is hidden by the 'dialogue_ended' event below.
    this.dialogueCloseBtnEl.addEventListener('click', () => {
      this.dialogue?.advance();
      if (!this.dialogue) this.dialogueBoxEl.classList.remove('active');
      onPlayClickSound();
    });

    // Victory Continue
    this.victoryContinueBtnEl.addEventListener('click', () => {
      this.victoryModalEl.classList.remove('active');
    });

    // Reactive State Subscriptions
    GameState.instance.on('acorn_collected', (count: number) => {
      if (this.acornValEl) {
        this.acornValEl.innerText = `${count} / ${GameState.instance.totalAcorns}`;
      }
      this.renderQuestObjectives();
    });

    GameState.instance.on('player_damaged', (hearts: number) => {
      this.updateHearts(hearts, GameState.instance.maxHearts);
      this.showToast(`Fox took damage! (${hearts}/${GameState.instance.maxHearts} ❤️)`, '💔');
    });

    GameState.instance.on('player_healed', (hearts: number) => {
      this.updateHearts(hearts, GameState.instance.maxHearts);
      this.showToast(`Restored Heart! (${hearts}/${GameState.instance.maxHearts} ❤️)`, '💖');
    });

    GameState.instance.on('player_revived', (hearts: number) => {
      // The fox fainted and revived with full hearts — refresh the UI so it
      // doesn't stay stuck showing 0 hearts.
      this.updateHearts(hearts, GameState.instance.maxHearts);
      this.showToast(`The grove spirit revives you! (${hearts}/${GameState.instance.maxHearts} ❤️)`, '✨');
    });

    GameState.instance.on('chapter_changed', () => {
      this.renderQuestObjectives();
    });

    GameState.instance.on('level_changed', (level: number) => {
      this.updateRealm(level);
      this.renderQuestObjectives();
    });

    GameState.instance.on('game_won', () => {
      this.showVictoryModal();
    });

    // Quest-driven objective UI (objective progress/completion re-renders the list)
    if (this.quests) {
      this.quests.on('quest_started', () => this.renderQuestObjectives());
      this.quests.on('objective_progress', () => this.renderQuestObjectives());
      this.quests.on('objective_completed', () => this.renderQuestObjectives());
      this.quests.on('quest_completed', () => this.renderQuestObjectives());
    }

    // Engine DialogueSystem drives the dialogue box
    if (this.dialogue) {
      this.dialogue.on('dialogue_line', e => {
        this.showDialogue(e.line.speaker ?? '', e.line.avatar ?? '', e.line.text);
      });
      this.dialogue.on('dialogue_ended', () => {
        this.hideDialogue();
      });
    }
  }

  public checkSavedGame() {
    const hasSave = GameState.instance.hasSaveData();
    if (hasSave) {
      const save = GameState.instance.loadGame();
      if (save) {
        this.startContinueBtnEl.style.display = 'block';
        this.startResetSaveBtnEl.style.display = 'inline-block';
        this.saveInfoPreviewEl.style.display = 'block';
        this.saveWispsCountEl.innerText = String(save.collectedWispIds?.length || 0);
        this.saveAcornsCountEl.innerText = String(save.acornsCollected || 0);
      }
    } else {
      this.startContinueBtnEl.style.display = 'none';
      this.startResetSaveBtnEl.style.display = 'none';
      this.saveInfoPreviewEl.style.display = 'none';
    }
  }

  public syncSavedUI() {
    if (this.acornValEl) {
      this.acornValEl.innerText = `${GameState.instance.acornsCollected} / ${GameState.instance.totalAcorns}`;
    }
    this.updateHearts(GameState.instance.hearts, GameState.instance.maxHearts);
    this.updateRealm(GameState.instance.currentLevel);
    this.renderQuestObjectives();
  }

  public updateRealm(level: number) {
    if (this.realmPillEl) {
      const names: Record<number, string> = {
        1: '🌲 Ancient Grove',
        2: '💎 Crystal Peaks',
        3: '💧 Azure Grotto',
        4: '🌑 Eclipse Citadel'
      };
      this.realmPillEl.innerText = names[level] || '🌲 Ancient Grove';
    }
  }

  public updateHearts(hearts: number, maxHearts: number = 3) {
    for (let i = 0; i < maxHearts; i++) {
      const heartEl = document.getElementById(`heart-${i}`);
      if (heartEl) {
        if (i < hearts) {
          heartEl.classList.remove('lost');
        } else {
          heartEl.classList.add('lost');
        }
      }
    }
  }

  public renderQuestObjectives() {
    const chapter = GameState.instance.currentChapter;
    const fallbackTitles: Record<number, string> = {
      1: 'The Ashen Shadow',
      2: 'Harmonize the Grove',
      3: 'The Alpine Gateway',
      4: 'The Moonlit Summit'
    };

    const questId = questForChapter(chapter);
    const quest = this.quests?.get(questId);
    const title = quest?.title ?? fallbackTitles[chapter] ?? fallbackTitles[1];

    if (this.questChapterTagEl) this.questChapterTagEl.innerText = `CHAPTER ${chapter}`;
    if (this.questTextEl) this.questTextEl.innerText = title;

    // Objectives come from the engine QuestSystem (formatted with live progress)
    let objectives: ObjectiveItem[] = [];
    const formatted = this.quests?.getFormattedObjectives(questId);
    if (formatted) {
      objectives = formatted.map(o => ({ id: o.id, text: o.text, isCompleted: o.completed }));
    }

    if (this.questObjectivesListEl) {
      this.questObjectivesListEl.innerHTML = objectives
        .map(
          obj => `
        <div class="quest-obj-row ${obj.isCompleted ? 'completed' : ''}">
          <span class="obj-checkbox ${obj.isCompleted ? 'checked' : ''}">
            ${obj.isCompleted ? '✓' : ''}
          </span>
          <span class="obj-text">${obj.text}</span>
        </div>
      `
        )
        .join('');
    }
  }

  public showToast(text: string, icon = '✨') {
    this.toastIconEl.innerText = icon;
    this.toastTextEl.innerText = text;
    this.actionToastEl.classList.add('show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.actionToastEl.classList.remove('show');
    }, 2500);
  }

  public showDialogue(speaker: string, avatar: string, text: string) {
    this.npcNameEl.innerText = speaker;
    this.npcAvatarEl.innerText = avatar;
    this.npcTextEl.innerText = text;
    this.dialogueBoxEl.classList.add('active');
  }

  public hideDialogue() {
    this.dialogueBoxEl.classList.remove('active');
  }

  public togglePhotoMode(): boolean {
    const isPhoto = GameState.instance.togglePhotoMode();
    if (isPhoto) {
      this.photoModeUIEl.classList.add('active');
      document.body.classList.add('cinematic');
      this.showToast('Photo Mode Enabled', '📷');
    } else {
      this.photoModeUIEl.classList.remove('active');
      document.body.classList.remove('cinematic');
    }
    return isPhoto;
  }

  public updateStamina(stamina: number, maxStamina: number) {
    if (this.staminaFillEl) {
      this.staminaFillEl.style.width = `${(stamina / maxStamina) * 100}%`;
    }
  }

  public showVictoryModal() {
    this.spiritRankBadgeEl.innerText = 'Golden Avatar';
    this.spiritRankBadgeEl.style.background = 'rgba(245, 158, 11, 0.4)';
    this.spiritRankBadgeEl.style.color = '#fff';
    this.renderQuestObjectives();

    const elapsed = Math.floor((performance.now() - GameState.instance.gameStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');

    this.finalAcornsEl.innerText = `${GameState.instance.acornsCollected} / ${GameState.instance.totalAcorns}`;
    this.finalTimeEl.innerText = `${mins}:${secs}`;

    setTimeout(() => {
      this.victoryModalEl.classList.add('active');
    }, 1200);
  }
}
