import { GameState } from '../state.ts';

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
  private questTextEl = document.getElementById('quest-text')!;
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
      onPlayClickSound();
    });

    // Victory Continue
    this.victoryContinueBtnEl.addEventListener('click', () => {
      this.victoryModalEl.classList.remove('active');
    });

    // Reactive State Subscriptions
    GameState.instance.on('acorn_collected', (count: number) => {
      this.acornValEl.innerText = `${count} / ${GameState.instance.totalAcorns}`;
    });

    GameState.instance.on('wisp_collected', ({ id }: { id: number }) => {
      const dotEl = document.getElementById(`wisp-dot-${id}`);
      if (dotEl) dotEl.classList.add('collected');
    });

    GameState.instance.on('player_damaged', (hearts: number) => {
      this.updateHearts(hearts, GameState.instance.maxHearts);
      this.showToast(`Fox took damage! (${hearts}/${GameState.instance.maxHearts} ❤️)`, '💔');
    });

    GameState.instance.on('player_healed', (hearts: number) => {
      this.updateHearts(hearts, GameState.instance.maxHearts);
      this.showToast(`Restored Heart! (${hearts}/${GameState.instance.maxHearts} ❤️)`, '💖');
    });

    GameState.instance.on('chapter_changed', (chapter: number) => {
      this.updateChapterQuestText(chapter);
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
    this.acornValEl.innerText = `${GameState.instance.acornsCollected} / ${GameState.instance.totalAcorns}`;
    this.updateHearts(GameState.instance.hearts, GameState.instance.maxHearts);
    this.updateChapterQuestText(GameState.instance.currentChapter);

    for (let i = 0; i < 5; i++) {
      const dotEl = document.getElementById(`wisp-dot-${i}`);
      if (dotEl) {
        if (GameState.instance.collectedWispIds.has(i)) {
          dotEl.classList.add('collected');
        } else {
          dotEl.classList.remove('collected');
        }
      }
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

  public updateChapterQuestText(chapter: number) {
    const quests: Record<number, string> = {
      1: 'Chapter 1: Speak with Elder Owl & cleanse the Shadow Creepers (⚡/Shift)!',
      2: 'Chapter 2: Ring the 4 Chime Monoliths (🔔/E) & gather 20 Sun Acorns!',
      3: 'Chapter 3: Step through the Northern Portal to the Moonlit Crystal Peaks!',
      4: 'Chapter 4: Awaken the Moon Altar & Defeat the Shadow Behemoth!'
    };
    if (this.questTextEl) {
      this.questTextEl.innerText = quests[chapter] || quests[1];
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
    this.staminaFillEl.style.width = `${(stamina / maxStamina) * 100}%`;
  }

  public showVictoryModal() {
    this.spiritRankBadgeEl.innerText = 'Golden Avatar';
    this.spiritRankBadgeEl.style.background = 'rgba(245, 158, 11, 0.4)';
    this.spiritRankBadgeEl.style.color = '#fff';
    this.questTextEl.innerText = 'Ancient Grove & Crystal Peaks Restored!';

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
