export class GameState {
  public static instance: GameState = new GameState();

  public acornsCollected: number = 0;
  public totalAcorns: number = 20;
  public totalWisps: number = 5;
  public wispsCollectedCount: number = 0;

  public stamina: number = 100;
  public maxStamina: number = 100;
  public isGoldenForm: boolean = false;
  public isGameWon: boolean = false;
  public soundEnabled: boolean = true;
  public isPhotoMode: boolean = false;
  public gameStartTime: number = performance.now();

  private listeners: Map<string, Array<(data?: any) => void>> = new Map();

  public on(event: string, callback: (data?: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public emit(event: string, data?: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => cb(data));
    }
  }

  public collectAcorn(): number {
    this.acornsCollected++;
    this.emit('acorn_collected', this.acornsCollected);
    return this.acornsCollected;
  }

  public collectWisp(id: number, name: string) {
    this.wispsCollectedCount++;
    this.emit('wisp_collected', { id, name, count: this.wispsCollectedCount });
    if (this.wispsCollectedCount >= this.totalWisps && !this.isGameWon) {
      this.isGameWon = true;
      this.isGoldenForm = true;
      this.emit('game_won');
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    this.emit('sound_toggled', this.soundEnabled);
    return this.soundEnabled;
  }

  public togglePhotoMode(): boolean {
    this.isPhotoMode = !this.isPhotoMode;
    this.emit('photo_mode_toggled', this.isPhotoMode);
    return this.isPhotoMode;
  }
}
