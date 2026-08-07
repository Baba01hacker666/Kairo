export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon?: string;
    secret?: boolean;
}
export declare class SaveSystem {
    private saveKey;
    data: Record<string, any>;
    achievementDefs: Record<string, AchievementDef>;
    constructor(gameId: string);
    load(): void;
    save(): void;
    getProgress<T>(key: string, defaultValue: T): T;
    setProgress(key: string, value: any): void;
    unlockAchievement(id: string, uiManager?: any): boolean;
    hasAchievement(id: string): boolean;
    defineAchievement(def: AchievementDef): void;
}
