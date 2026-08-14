import type { HealthComponent } from '@kairo/core';

export interface SaveData {
  acornsCollected: number;
  collectedAcornIds: number[];
  collectedWispIds: number[];
  litChimeIds: number[];
  ducksFollowing: boolean;
  isGoldenForm: boolean;
  playerPos: [number, number, number];
  currentLevel?: number;
  currentChapter?: number;
  hearts?: number;
  beastsDefeated?: number;
  timestamp: number;
}

export class GameState {
  public static instance: GameState = new GameState();

  public isGameStarted: boolean = false;
  public currentLevel: number = 1; // 1 = Ancient Grove, 2 = Moonlit Crystal Peaks
  public currentChapter: number = 1; // 1: Ashen Shadow, 2: Chime Resonance, 3: Portal Journey, 4: Moonlit Summit

  // Combat Health (3 Spirit Hearts)
  public hearts: number = 3;
  public maxHearts: number = 3;
  public beastsDefeated: number = 0;

  /**
   * Engine HealthComponent backing the spirit hearts. Wired up by the game
   * bootstrap (main.ts); when present, damagePlayer/healPlayer delegate to it
   * and the component's events drive the player_damaged/player_healed/… emits.
   */
  public health?: HealthComponent;

  // Collectibles & Quests
  public acornsCollected: number = 0;
  public totalAcorns: number = 20;
  public totalWisps: number = 5;
  public wispsCollectedCount: number = 0;

  public collectedAcornIds: Set<number> = new Set();
  public collectedWispIds: Set<number> = new Set();
  public litChimeIds: Set<number> = new Set();
  public ducksFollowing: boolean = false;

  // Generous Double Stamina (200 max)
  public stamina: number = 200;
  public maxStamina: number = 200;
  public isGoldenForm: boolean = false;
  public isGameWon: boolean = false;
  public soundEnabled: boolean = true;
  public isPhotoMode: boolean = false;
  public gameStartTime: number = performance.now();
  /** Last known player position, used as default when saving without an explicit position. */
  private lastPlayerPos: [number, number, number] = [0, 0.5, 8];

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

  public damagePlayer(amount: number = 1): number {
    if (this.isGoldenForm) return this.hearts;
    if (this.health) {
      // Engine CombatSystem drives the damage/revive cycle and re-emits the
      // classic events (player_damaged / player_fainted / player_revived).
      this.health.damage(amount, { source: 'enemy' });
      this.saveGame();
      return this.health.current;
    }
    this.hearts = Math.max(0, this.hearts - amount);
    this.emit('player_damaged', this.hearts);
    if (this.hearts <= 0) {
      this.emit('player_fainted');
      // Revive at entrance with 3 hearts
      this.hearts = this.maxHearts;
      this.emit('player_revived', this.hearts);
    }
    this.saveGame();
    return this.hearts;
  }

  public healPlayer(amount: number = 1): number {
    if (this.health) {
      this.health.heal(amount);
      this.saveGame();
      return this.health.current;
    }
    this.hearts = Math.min(this.maxHearts, this.hearts + amount);
    this.emit('player_healed', this.hearts);
    this.saveGame();
    return this.hearts;
  }

  public recordBeastDefeat() {
    this.beastsDefeated++;
    this.emit('beast_defeated', this.beastsDefeated);
    if (this.currentChapter === 1 && this.beastsDefeated >= 3) {
      this.setChapter(2);
    }
    this.saveGame();
  }

  public setChapter(chapter: number) {
    this.currentChapter = chapter;
    this.emit('chapter_changed', chapter);
    this.saveGame();
  }

  public setLevel(level: number) {
    this.currentLevel = level;
    this.emit('level_changed', level);
    if (level === 2 && this.currentChapter < 3) {
      this.setChapter(3);
    }
    this.saveGame();
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
      this.setChapter(4);
      this.emit('game_won');
    }
    this.saveGame();
  }

  public lightChime(id: number) {
    this.litChimeIds.add(id);
    this.emit('chime_lit', this.litChimeIds.size);
    if (this.litChimeIds.size >= 4 && this.currentChapter < 3) {
      this.setChapter(3);
    }
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
      if (playerPos) {
        this.lastPlayerPos = playerPos;
      }
      const data: SaveData = {
        acornsCollected: this.acornsCollected,
        collectedAcornIds: Array.from(this.collectedAcornIds),
        collectedWispIds: Array.from(this.collectedWispIds),
        litChimeIds: Array.from(this.litChimeIds),
        ducksFollowing: this.ducksFollowing,
        isGoldenForm: this.isGoldenForm,
        playerPos: this.lastPlayerPos,
        currentLevel: this.currentLevel,
        currentChapter: this.currentChapter,
        hearts: this.hearts,
        beastsDefeated: this.beastsDefeated,
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
      this.currentLevel = data.currentLevel || 1;
      this.currentChapter = data.currentChapter || 1;
      this.hearts = data.hearts !== undefined ? data.hearts : 3;
      this.beastsDefeated = data.beastsDefeated || 0;
      if (data.playerPos) {
        this.lastPlayerPos = data.playerPos;
      }

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
    this.currentLevel = 1;
    this.currentChapter = 1;
    this.hearts = 3;
    this.beastsDefeated = 0;
    this.stamina = 200;
    this.maxStamina = 200;
    this.lastPlayerPos = [0, 0.5, 8];
  }
}
