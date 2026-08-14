import { GameState } from '../state.ts';

export interface ObjectiveItem {
  id: string;
  text: string;
  isCompleted: boolean;
  currentCount?: number;
  totalCount?: number;
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
  private hasTalkedToOwl: boolean = false;

  constructor(
    onStartGame: (isContinue: boolean) => void,
    onCaptureScreenshot: () => void,
    onPlayClickSound: () => void
  ) {
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

    // Dialogue Close
    this.dialogueCloseBtnEl.addEventListener('click', () => {
      this.dialogueBoxEl.classList.remove('active');
      this.hasTalkedToOwl = true;
      this.renderQuestObjectives();
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

    GameState.instance.on('wisp_collected', () => {
      this.renderQuestObjectives();
    });

    GameState.instance.on('beast_defeated', () => {
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

    GameState.instance.on('chime_lit', () => {
      // Keep the chime objective counter live instead of waiting for the
      // chapter change event.
      this.renderQuestObjectives();
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
    const state = GameState.instance;

    const chapterTitles: Record<number, { tag: string; title: string }> = {
      1: { tag: 'CHAPTER 1', title: 'The Ashen Shadow' },
      2: { tag: 'CHAPTER 2', title: 'Harmonize the Grove' },
      3: { tag: 'CHAPTER 3', title: 'The Alpine Gateway' },
      4: { tag: 'CHAPTER 4', title: 'The Moonlit Summit' }
    };

    const info = chapterTitles[chapter] || chapterTitles[1];
    if (this.questChapterTagEl) this.questChapterTagEl.innerText = info.tag;
    if (this.questTextEl) this.questTextEl.innerText = info.title;

    let objectives: ObjectiveItem[] = [];

    if (chapter === 1) {
      const creepersKilled = Math.min(3, state.beastsDefeated);
      objectives = [
        { id: 'owl', text: 'Speak with Grand Elder Owl', isCompleted: this.hasTalkedToOwl },
        { id: 'creepers', text: `Purify Shadow Creepers (${creepersKilled}/3)`, isCompleted: creepersKilled >= 3 },
        { id: 'acorns', text: `Gather Sun Acorns (${state.acornsCollected}/${state.totalAcorns})`, isCompleted: state.acornsCollected >= state.totalAcorns }
      ];
    } else if (chapter === 2) {
      const chimesLit = state.litChimeIds.size;
      const wisps = state.wispsCollectedCount;
      objectives = [
        { id: 'chimes', text: `Ring Ancient Chimes (${chimesLit}/4 🔔)`, isCompleted: chimesLit >= 4 },
        { id: 'wisps', text: `Awaken Grove Wisps (${wisps}/5 ✨)`, isCompleted: wisps >= 5 },
        { id: 'acorns', text: `Gather Sun Acorns (${state.acornsCollected}/${state.totalAcorns})`, isCompleted: state.acornsCollected >= state.totalAcorns }
      ];
    } else if (chapter === 3) {
      const isL2 = state.currentLevel === 2;
      objectives = [
        { id: 'portal', text: 'Step through the Northern Portal', isCompleted: isL2 },
        { id: 'explore', text: 'Explore the Moonlit Crystal Peaks', isCompleted: isL2 },
        { id: 'geyser', text: 'Launch off a Crystal Geyser 💨', isCompleted: isL2 }
      ];
    } else {
      objectives = [
        { id: 'altar', text: 'Ascend to the Moon Altar 💎', isCompleted: state.isGameWon },
        { id: 'boss', text: 'Cleanse the Shadow Behemoth', isCompleted: state.isGameWon },
        { id: 'golden', text: 'Master the Golden Spirit Fox Form', isCompleted: state.isGoldenForm }
      ];
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
