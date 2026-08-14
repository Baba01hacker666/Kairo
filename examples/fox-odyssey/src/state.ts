export interface SaveData {
  acornsCollected: number;
  collectedAcornIds: number[];
  collectedWispIds: number[];
  litChimeIds: number[];
  ducksFollowing: boolean;
  isGoldenForm: boolean;
  playerPos: [number, number, number];
  timestamp: number;
}

export class GameState {
  public static instance: GameState = new GameState();

  public isGameStarted: boolean = false;
  public acornsCollected: number = 0;
  public totalAcorns: number = 20;
  public totalWisps: number = 5;
  public wispsCollectedCount: number = 0;

  public collectedAcornIds: Set<number> = new Set();
  public collectedWispIds: Set<number> = new Set();
  public litChimeIds: Set<number> = new Set();
  public ducksFollowing: boolean = false;

  public stamina: number = 100;
  public maxStamina: number = 100;
  public isGoldenForm: boolean = false;
  public isGameWon: boolean = false;
  public soundEnabled: boolean = true;
  public isPhotoMode: boolean = false;
  public gameStartTime: number = performance.now();

  private listeners: Map<string, Array<(data?: any) => void>> = new Map();
  private static readonly SAVE_KEY = 'kairo_fox_odyssey_save_v1';

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

  public collectAcorn(id: number): number {
    if (this.collectedAcornIds.has(id)) return this.acornsCollected;
    this.collectedAcornIds.add(id);
    this.acornsCollected = this.collectedAcornIds.size;
    this.emit('acorn_collected', this.acornsCollected);
    this.saveGame();
    return this.acornsCollected;
  }

  public collectWisp(id: number, name: string) {
    if (this.collectedWispIds.has(id)) return;
    this.collectedWispIds.add(id);
    this.wispsCollectedCount = this.collectedWispIds.size;
    this.emit('wisp_collected', { id, name, count: this.wispsCollectedCount });

    if (this.wispsCollectedCount >= this.totalWisps && !this.isGameWon) {
      this.isGameWon = true;
      this.isGoldenForm = true;
      this.emit('game_won');
    }
    this.saveGame();
  }

  public lightChime(id: number) {
    this.litChimeIds.add(id);
    this.saveGame();
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

  public saveGame(playerPos?: [number, number, number]) {
    if (typeof localStorage === 'undefined') return;
    try {
      const data: SaveData = {
        acornsCollected: this.acornsCollected,
        collectedAcornIds: Array.from(this.collectedAcornIds),
        collectedWispIds: Array.from(this.collectedWispIds),
        litChimeIds: Array.from(this.litChimeIds),
        ducksFollowing: this.ducksFollowing,
        isGoldenForm: this.isGoldenForm,
        playerPos: playerPos || [0, 0.5, 8],
        timestamp: Date.now()
      };
      localStorage.setItem(GameState.SAVE_KEY, JSON.stringify(data));
      this.emit('saved', data);
    } catch (err) {
      console.warn('Could not write save to localStorage', err);
    }
  }

  public loadGame(): SaveData | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(GameState.SAVE_KEY);
      if (!raw) return null;
      const data: SaveData = JSON.parse(raw);

      this.acornsCollected = data.acornsCollected || 0;
      this.collectedAcornIds = new Set(data.collectedAcornIds || []);
      this.collectedWispIds = new Set(data.collectedWispIds || []);
      this.litChimeIds = new Set(data.litChimeIds || []);
      this.ducksFollowing = data.ducksFollowing || false;
      this.isGoldenForm = data.isGoldenForm || false;
      this.wispsCollectedCount = this.collectedWispIds.size;
      this.isGameWon = this.wispsCollectedCount >= this.totalWisps;

      return data;
    } catch (err) {
      console.warn('Failed to parse save data', err);
      return null;
    }
  }

  public hasSaveData(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem(GameState.SAVE_KEY);
  }

  public clearSaveData() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(GameState.SAVE_KEY);
    this.collectedAcornIds.clear();
    this.collectedWispIds.clear();
    this.litChimeIds.clear();
    this.acornsCollected = 0;
    this.wispsCollectedCount = 0;
    this.isGoldenForm = false;
    this.isGameWon = false;
    this.ducksFollowing = false;
  }
}
