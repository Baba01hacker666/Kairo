import { GameState } from '../state.ts';

export class GameHUD {
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
    onCaptureScreenshot: () => void,
    onPlayClickSound: () => void
  ) {
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

    GameState.instance.on('game_won', () => {
      this.showVictoryModal();
    });
  }

  public showToast(text: string, icon = '✨') {
    this.toastIconEl.innerText = icon;
    this.toastTextEl.innerText = text;
    this.actionToastEl.classList.add('show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.actionToastEl.classList.remove('show');
    }, 2800);
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
    this.questTextEl.innerText = 'Ancient Grove Restored! You are the Golden Spirit Fox!';

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
