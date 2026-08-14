export declare class GameState {
    static instance: GameState;
    acornsCollected: number;
    totalAcorns: number;
    totalWisps: number;
    wispsCollectedCount: number;
    stamina: number;
    maxStamina: number;
    isGoldenForm: boolean;
    isGameWon: boolean;
    soundEnabled: boolean;
    isPhotoMode: boolean;
    gameStartTime: number;
    private listeners;
    on(event: string, callback: (data?: any) => void): void;
    emit(event: string, data?: any): void;
    collectAcorn(): number;
    collectWisp(id: number, name: string): void;
    toggleSound(): boolean;
    togglePhotoMode(): boolean;
}
