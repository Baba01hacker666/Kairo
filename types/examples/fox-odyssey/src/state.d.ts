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
export declare class GameState {
    static instance: GameState;
    isGameStarted: boolean;
    acornsCollected: number;
    totalAcorns: number;
    totalWisps: number;
    wispsCollectedCount: number;
    collectedAcornIds: Set<number>;
    collectedWispIds: Set<number>;
    litChimeIds: Set<number>;
    ducksFollowing: boolean;
    stamina: number;
    maxStamina: number;
    isGoldenForm: boolean;
    isGameWon: boolean;
    soundEnabled: boolean;
    isPhotoMode: boolean;
    gameStartTime: number;
    /** Last known player position, used as default when saving without an explicit position. */
    private lastPlayerPos;
    private listeners;
    private static readonly SAVE_KEY;
    on(event: string, callback: (data?: any) => void): void;
    emit(event: string, data?: any): void;
    collectAcorn(id: number): number;
    collectWisp(id: number, name: string): void;
    lightChime(id: number): void;
    toggleSound(): boolean;
    togglePhotoMode(): boolean;
    saveGame(playerPos?: [number, number, number]): void;
    loadGame(): SaveData | null;
    hasSaveData(): boolean;
    clearSaveData(): void;
}
